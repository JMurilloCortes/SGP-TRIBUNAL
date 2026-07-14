import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Box, Typography, Tabs, Tab, ToggleButtonGroup, ToggleButton, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import { RestartAlt } from '@mui/icons-material'
import api from '../services/api'
import { connectSocket, disconnectSocket } from '../services/socket'
import { useAuth } from '../context/AuthContext'
import { toastError } from '../services/swal'

type TipoCons = 'OFICIO' | 'CIRCULAR' | 'CITACION' | 'RESOLUCION'
type Filtro = 'TODOS' | 'DISPONIBLE' | 'OCUPADO'

interface Consecutivo {
  id: number
  numero: string
  tipo: TipoCons
  estado: 'DISPONIBLE' | 'OCUPADO'
  tomadoPor: number | null
  tomadoUser: { nombre: string } | null
  updatedAt: string
}

const PAGE_SIZE = 200

const TIPOS: { key: TipoCons; label: string }[] = [
  { key: 'OFICIO', label: 'Oficios' },
  { key: 'CIRCULAR', label: 'Circulares' },
  { key: 'CITACION', label: 'Citaciones' },
  { key: 'RESOLUCION', label: 'Resoluciones' },
]

export default function ConsecutivosPage() {
  const [consecutivos, setConsecutivos] = useState<Consecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [tipoActivo, setTipoActivo] = useState<TipoCons>('OFICIO')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const pendingIds = useRef<Set<number>>(new Set())
  const { user, token } = useAuth()
  const [resetOpen, setResetOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const skipRef = useRef(0)
  const totalRef = useRef(0)
  const loadingMoreRef = useRef(false)
  const tipoRef = useRef(tipoActivo)
  const filtroRef = useRef(filtro)
  tipoRef.current = tipoActivo
  filtroRef.current = filtro
  const [disponiblesCount, setDisponiblesCount] = useState(0)

  const loadInitial = useCallback(async (tipo: TipoCons, filtroActual: Filtro) => {
    setLoading(true)
    setConsecutivos([])
    skipRef.current = 0
    const r = await api.get<{ consecutivos: Consecutivo[]; total: number }>('/consecutivos', {
      params: { tipo, skip: 0, take: PAGE_SIZE, filtro: filtroActual },
    })
    setConsecutivos(r.data.consecutivos)
    totalRef.current = r.data.total
    skipRef.current = r.data.consecutivos.length
    setLoading(false)
  }, [])

  const loadDisponiblesCount = useCallback(async (tipo: TipoCons) => {
    const r = await api.get<{ tipo: string; disponibles: number }>('/consecutivos/conteo', { params: { tipo } })
    setDisponiblesCount(r.data.disponibles)
  }, [])

  useEffect(() => { loadInitial(tipoActivo, filtro); loadDisponiblesCount(tipoActivo) }, [tipoActivo, filtro, loadInitial, loadDisponiblesCount])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMoreRef.current && skipRef.current < totalRef.current) {
          loadingMoreRef.current = true
          setLoadingMore(true)
          const skip = skipRef.current
          api.get<{ consecutivos: Consecutivo[]; total: number }>('/consecutivos', {
            params: { tipo: tipoRef.current, skip, take: PAGE_SIZE, filtro: filtroRef.current },
          }).then(r => {
            setConsecutivos(prev => {
              const existingIds = new Set(prev.map(c => c.id))
              const newItems = r.data.consecutivos.filter(c => !existingIds.has(c.id))
              return newItems.length > 0 ? [...prev, ...newItems] : prev
            })
            totalRef.current = r.data.total
            skipRef.current = skip + r.data.consecutivos.length
            loadingMoreRef.current = false
            setLoadingMore(false)
          }).catch(() => {
            loadingMoreRef.current = false
            setLoadingMore(false)
          })
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [consecutivos.length])

  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)
    socket.on('consecutivo:update', (c: Consecutivo) => {
      if (pendingIds.current.has(c.id)) return
      setConsecutivos(prev => {
        if (c.tipo !== tipoActivo) return prev
        const i = prev.findIndex(p => p.id === c.id)
        if (i === -1) return prev
        const copy = [...prev]
        copy[i] = c
        return copy
      })
      loadDisponiblesCount(tipoActivo)
    })
    socket.on('consecutivo:reset', () => {
      loadInitial(tipoActivo, filtro)
      loadDisponiblesCount(tipoActivo)
    })
    return () => {
      socket.off('consecutivo:update')
      socket.off('consecutivo:reset')
      disconnectSocket()
    }
  }, [token, tipoActivo, filtro, loadInitial, loadDisponiblesCount])

  async function handleClick(c: Consecutivo) {
    if (bloqueados.has(c.id) || pendingIds.current.has(c.id)) return
    pendingIds.current.add(c.id)

    if (c.estado === 'DISPONIBLE') {
      const optimistic: Consecutivo = { ...c, estado: 'OCUPADO', tomadoPor: user?.id ?? null, tomadoUser: user ? { nombre: user.nombre } : null, updatedAt: new Date().toISOString() }
      setConsecutivos(prev => prev.map(p => p.id === c.id ? optimistic : p))
      try {
        await api.patch(`/consecutivos/${c.id}/ocupar`)
        loadDisponiblesCount(tipoActivo)
      } catch (err: any) {
        setConsecutivos(prev => prev.map(p => p.id === c.id ? c : p))
        const msg = err?.response?.data?.error || 'Error al ocupar el consecutivo'
        toastError(msg)
      }
    } else if (user?.rol === 'ADMIN') {
      const optimistic: Consecutivo = { ...c, estado: 'DISPONIBLE', tomadoPor: null, tomadoUser: null, updatedAt: new Date().toISOString() }
      setConsecutivos(prev => prev.map(p => p.id === c.id ? optimistic : p))
      try {
        await api.patch(`/consecutivos/${c.id}/liberar`)
        loadDisponiblesCount(tipoActivo)
      } catch (err: any) {
        setConsecutivos(prev => prev.map(p => p.id === c.id ? c : p))
        const msg = err?.response?.data?.error || 'Error al liberar el consecutivo'
        toastError(msg)
      }
    }
    pendingIds.current.delete(c.id)
  }

  const bloqueados = useMemo(() => {
    const dMap = new Map(consecutivos.filter(c => c.estado === 'DISPONIBLE').map(c => [c.numero, c]))
    return new Set(
      [...dMap.entries()]
        .filter(([num]) => {
          if (num === '0001') return false
          const anterior = String(parseInt(num, 10) - 1).padStart(4, '0')
          return dMap.has(anterior)
        })
        .map(([_, c]) => c.id)
    )
  }, [consecutivos])

  const primerNombre = (n: string) => n.split(' ')[0]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}
        sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="h4" fontWeight={800} sx={{
          background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>Consecutivos</Typography>
        <Box display="flex" gap={1} alignItems="center"
          sx={{ flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
          <Typography variant="body2" color="text.secondary">
            {disponiblesCount} disponibles
          </Typography>
          {user?.rol === 'ADMIN' && (
            <Button size="small" color="error" variant="outlined"
              startIcon={<RestartAlt />} onClick={() => setResetOpen(true)}>
              Resetear
            </Button>
          )}
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
        <>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))',
            gap: '3px',
          }}>
            {consecutivos.map(c => {
              const bloqueado = bloqueados.has(c.id)
              const bg = bloqueado ? '#8A8895' : c.estado === 'DISPONIBLE' ? '#8BC4A8' : '#E8A8B0'
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
                    height: 56,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 4,
                    cursor: bloqueado || pendingIds.current.has(c.id) ? 'not-allowed' : 'pointer',
                    backgroundColor: bg,
                    color: '#2D2B3D',
                    transition: 'background-color 0.1s',
                    userSelect: 'none',
                    lineHeight: 1.1,
                  }}
                  onMouseEnter={e => { if (!bloqueado) (e.target as HTMLElement).style.opacity = '0.85' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1' }}
                >
                  <span>{c.numero}</span>
                  {c.tomadoUser && (
                    <>
                      <span style={{ fontSize: '0.55rem', fontWeight: 400, opacity: 0.9 }}>
                        {primerNombre(c.tomadoUser.nombre)}
                      </span>
                      <span style={{ fontSize: '0.55rem', fontWeight: 400, opacity: 0.8 }}>
                        {new Date(c.updatedAt).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </>
                  )}
                  {bloqueado && (
                    <span style={{ fontSize: '0.45rem', fontWeight: 400, opacity: 0.7 }}>bloq</span>
                  )}
                </div>
              )
            })}
          </Box>
          <div ref={sentinelRef} style={{ height: 1 }} />
          {loadingMore && (
            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
          )}
          {!loadingMore && skipRef.current >= totalRef.current && consecutivos.length > 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              Todos los {totalRef.current} consecutivos cargados
            </Typography>
          )}
        </>
      )}

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle>Resetear todos los consecutivos</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esto marcará todos los números como disponibles y limpiará quién los tomó. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={async () => {
            await api.post('/consecutivos/reset')
            setResetOpen(false)
            loadInitial(tipoActivo, filtro)
            loadDisponiblesCount(tipoActivo)
          }}>
            Resetear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
