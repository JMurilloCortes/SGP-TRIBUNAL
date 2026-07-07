import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Typography, Tabs, Tab, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material'
import api from '../services/api'
import { connectSocket, disconnectSocket } from '../services/socket'
import { useAuth } from '../context/AuthContext'

type TipoCons = 'OFICIO' | 'CIRCULAR' | 'CITACION' | 'RESOLUCION'
type Filtro = 'TODOS' | 'DISPONIBLE' | 'OCUPADO'

interface Consecutivo {
  id: number
  numero: string
  tipo: TipoCons
  estado: 'DISPONIBLE' | 'OCUPADO'
  tomadoPor: number | null
  tomadoUser: { nombre: string } | null
}

const TIPOS: { key: TipoCons; label: string }[] = [
  { key: 'OFICIO', label: 'Oficios' },
  { key: 'CIRCULAR', label: 'Circulares' },
  { key: 'CITACION', label: 'Citaciones' },
  { key: 'RESOLUCION', label: 'Resoluciones' },
]

export default function ConsecutivosPage() {
  const [consecutivos, setConsecutivos] = useState<Consecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoActivo, setTipoActivo] = useState<TipoCons>('OFICIO')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [tomando, setTomando] = useState<number | null>(null)
  const { user, token } = useAuth()
  const snapshots = useRef<Map<number, Consecutivo>>(new Map())

  const load = useCallback(async (tipo: TipoCons) => {
    setLoading(true)
    const r = await api.get<Consecutivo[]>('/consecutivos', { params: { tipo } })
    setConsecutivos(r.data)
    setLoading(false)
  }, [])

  useEffect(() => { load(tipoActivo) }, [tipoActivo, load])

  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)
    socket.on('consecutivo:update', (c: Consecutivo) => {
      setConsecutivos(prev => {
        if (c.tipo !== tipoActivo) return prev
        const i = prev.findIndex(p => p.id === c.id)
        if (i === -1) return prev
        const copy = [...prev]
        copy[i] = c
        return copy
      })
    })
    return () => {
      socket.off('consecutivo:update')
      disconnectSocket()
    }
  }, [token, tipoActivo])

  const revertIfUnchanged = useCallback((id: number, snapshot: Consecutivo) => {
    setConsecutivos(prev => {
      if (snapshots.current.get(id) !== snapshot) return prev
      const i = prev.findIndex(p => p.id === id)
      if (i === -1) return prev
      const copy = [...prev]
      copy[i] = snapshot
      return copy
    })
  }, [])

  async function handleClick(c: Consecutivo) {
    if (tomando || bloqueados.has(c.id)) return
    setTomando(c.id)

    if (c.estado === 'DISPONIBLE') {
      const snapshot = { ...c }
      snapshots.current.set(c.id, snapshot)
      setConsecutivos(prev => {
        const i = prev.findIndex(p => p.id === c.id)
        if (i === -1) return prev
        const copy = [...prev]
        copy[i] = { ...c, estado: 'OCUPADO', tomadoUser: user ? { nombre: user.nombre } : null }
        return copy
      })
      try {
        const r = await api.patch(`/consecutivos/${c.id}/ocupar`)
        snapshots.current.delete(c.id)
        if (r.data?.id) setConsecutivos(prev => prev.map(p => p.id === c.id ? r.data : p))
      } catch { revertIfUnchanged(c.id, snapshot) }
    } else if (user?.rol === 'ADMIN') {
      const snapshot = { ...c }
      snapshots.current.set(c.id, snapshot)
      setConsecutivos(prev => {
        const i = prev.findIndex(p => p.id === c.id)
        if (i === -1) return prev
        const copy = [...prev]
        copy[i] = { ...c, estado: 'DISPONIBLE', tomadoUser: null }
        return copy
      })
      try {
        const r = await api.patch(`/consecutivos/${c.id}/liberar`)
        snapshots.current.delete(c.id)
        if (r.data?.id) setConsecutivos(prev => prev.map(p => p.id === c.id ? r.data : p))
      } catch { revertIfUnchanged(c.id, snapshot) }
    }
    setTomando(null)
  }

  const disponiblesMap = new Map(consecutivos.filter(c => c.estado === 'DISPONIBLE').map(c => [c.numero, c]))
  const bloqueados = new Set(
    [...disponiblesMap.entries()]
      .filter(([num]) => {
        if (num === '0001') return false
        const anterior = String(parseInt(num, 10) - 1).padStart(4, '0')
        return disponiblesMap.has(anterior)
      })
      .map(([_, c]) => c.id)
  )

  const filtrados = consecutivos.filter(c => {
    if (filtro === 'DISPONIBLE') return c.estado === 'DISPONIBLE'
    if (filtro === 'OCUPADO') return c.estado === 'OCUPADO'
    return true
  })

  const primerNombre = (n: string) => n.split(' ')[0]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4" fontWeight="bold">Consecutivos</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {consecutivos.filter(c => c.estado === 'DISPONIBLE').length} disponibles
          </Typography>
          <ToggleButtonGroup value={filtro} exclusive size="small"
            onChange={(_, v) => v && setFiltro(v)}>
            <ToggleButton value="TODOS">Todos</ToggleButton>
            <ToggleButton value="DISPONIBLE">Disponibles</ToggleButton>
            <ToggleButton value="OCUPADO">Ocupados</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Tabs value={tipoActivo} onChange={(_, v) => setTipoActivo(v)} sx={{ mb: 2 }}>
        {TIPOS.map(t => <Tab key={t.key} value={t.key} label={t.label} />)}
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))',
          gap: '3px',
        }}>
          {filtrados.map(c => {
            const bloqueado = bloqueados.has(c.id)
            const bg = bloqueado ? '#757575' : c.estado === 'DISPONIBLE' ? '#2e7d32' : '#d32f2f'
            return (
              <div
                key={c.id}
                onClick={() => handleClick(c)}
                title={`#${c.numero}${bloqueado ? ' (tome primero #' + String(parseInt(c.numero, 10) - 1).padStart(4, '0') + ')' : c.tomadoUser ? ' - ' + c.tomadoUser.nombre : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 48,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: 4,
                  cursor: bloqueado ? 'not-allowed' : tomando === c.id ? 'wait' : 'pointer',
                  backgroundColor: bg,
                  color: '#fff',
                  transition: 'background-color 0.1s',
                  userSelect: 'none',
                  lineHeight: 1.1,
                }}
                onMouseEnter={e => { if (!bloqueado) (e.target as HTMLElement).style.opacity = '0.85' }}
                onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1' }}
              >
                <span>{c.numero}</span>
                {c.tomadoUser && (
                  <span style={{ fontSize: '0.55rem', fontWeight: 400, opacity: 0.9 }}>
                    {primerNombre(c.tomadoUser.nombre)}
                  </span>
                )}
                {bloqueado && (
                  <span style={{ fontSize: '0.45rem', fontWeight: 400, opacity: 0.7 }}>bloq</span>
                )}
              </div>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
