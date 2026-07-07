import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Typography, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material'
import api from '../services/api'
import { connectSocket, disconnectSocket } from '../services/socket'
import { useAuth } from '../context/AuthContext'

interface Consecutivo {
  id: number
  numero: string
  estado: 'DISPONIBLE' | 'OCUPADO'
  tomadoPor: number | null
  tomadoUser: { nombre: string } | null
}

type Filtro = 'TODOS' | 'DISPONIBLE' | 'OCUPADO'

export default function ConsecutivosPage() {
  const [consecutivos, setConsecutivos] = useState<Consecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [tomando, setTomando] = useState<number | null>(null)
  const { user, token } = useAuth()
  const snapshots = useRef<Map<number, Consecutivo>>(new Map())

  useEffect(() => {
    api.get<Consecutivo[]>('/consecutivos').then(r => {
      setConsecutivos(r.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)
    socket.on('consecutivo:update', (c: Consecutivo) => {
      setConsecutivos(prev => {
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
  }, [token])

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
    if (tomando) return
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
        if (r.data?.id) {
          setConsecutivos(prev => {
            const i = prev.findIndex(p => p.id === c.id)
            if (i === -1) return prev
            const copy = [...prev]
            copy[i] = r.data
            return copy
          })
        }
      } catch {
        revertIfUnchanged(c.id, snapshot)
      }
    } else if (user?.rol === 'ADMIN' && c.estado === 'OCUPADO') {
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
        if (r.data?.id) {
          setConsecutivos(prev => {
            const i = prev.findIndex(p => p.id === c.id)
            if (i === -1) return prev
            const copy = [...prev]
            copy[i] = r.data
            return copy
          })
        }
      } catch {
        revertIfUnchanged(c.id, snapshot)
      }
    }
    setTomando(null)
  }

  const filtrados = consecutivos.filter(c => {
    if (filtro === 'DISPONIBLE') return c.estado === 'DISPONIBLE'
    if (filtro === 'OCUPADO') return c.estado === 'OCUPADO'
    return true
  })

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>

  const primerNombre = (n: string) => n.split(' ')[0]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">Consecutivos</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {consecutivos.filter(c => c.estado === 'DISPONIBLE').length} disponibles
          </Typography>
          <ToggleButtonGroup
            value={filtro} exclusive size="small"
            onChange={(_, v) => v && setFiltro(v)}
          >
            <ToggleButton value="TODOS">Todos</ToggleButton>
            <ToggleButton value="DISPONIBLE">Disponibles</ToggleButton>
            <ToggleButton value="OCUPADO">Ocupados</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))',
        gap: '3px',
      }}>
        {filtrados.map(c => (
          <div
            key={c.id}
            onClick={() => handleClick(c)}
            title={`#${c.numero}${c.tomadoUser ? ' - ' + c.tomadoUser.nombre : ''}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 4,
              cursor: tomando === c.id ? 'wait' : 'pointer',
              backgroundColor: c.estado === 'DISPONIBLE' ? '#2e7d32' : '#d32f2f',
              color: '#fff',
              transition: 'background-color 0.1s',
              userSelect: 'none',
              lineHeight: 1.1,
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.85' }}
            onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1' }}
          >
            <span>{c.numero}</span>
            {c.tomadoUser && (
              <span style={{ fontSize: '0.55rem', fontWeight: 400, opacity: 0.9 }}>
                {primerNombre(c.tomadoUser.nombre)}
              </span>
            )}
          </div>
        ))}
      </Box>
    </Box>
  )
}
