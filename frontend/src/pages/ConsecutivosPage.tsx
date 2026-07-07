import { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, ToggleButtonGroup, ToggleButton, CircularProgress, Tooltip,
} from '@mui/material'
import api from '../services/api'
import { connectSocket, disconnectSocket } from '../services/socket'
import { useAuth } from '../context/AuthContext'

interface Consecutivo {
  id: number
  numero: string
  estado: 'DISPONIBLE' | 'OCUPADO'
  tomadoPor: number | null
}

type Filtro = 'TODOS' | 'DISPONIBLE' | 'OCUPADO'

export default function ConsecutivosPage() {
  const [consecutivos, setConsecutivos] = useState<Consecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [tomando, setTomando] = useState<number | null>(null)
  const { user, token } = useAuth()
  const socketRef = useRef<any>(null)

  useEffect(() => {
    api.get<Consecutivo[]>('/consecutivos').then(r => {
      setConsecutivos(r.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)
    socketRef.current = socket
    socket.on('consecutivo:update', (c: Consecutivo) => {
      setConsecutivos(prev => prev.map(p => p.id === c.id ? c : p))
    })
    return () => {
      socket.off('consecutivo:update')
      disconnectSocket()
    }
  }, [token])

  async function handleClick(c: Consecutivo) {
    if (tomando) return
    setTomando(c.id)
    try {
      if (c.estado === 'DISPONIBLE') {
        const r = await api.patch(`/consecutivos/${c.id}/ocupar`)
        setConsecutivos(prev => prev.map(p => p.id === c.id ? r.data : p))
      } else if (user?.rol === 'ADMIN') {
        const r = await api.patch(`/consecutivos/${c.id}/liberar`)
        setConsecutivos(prev => prev.map(p => p.id === c.id ? r.data : p))
      }
    } catch { }
    setTomando(null)
  }

  const filtrados = consecutivos.filter(c => {
    if (filtro === 'DISPONIBLE') return c.estado === 'DISPONIBLE'
    if (filtro === 'OCUPADO') return c.estado === 'OCUPADO'
    return true
  })

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">Consecutivos</Typography>
        <ToggleButtonGroup
          value={filtro} exclusive size="small"
          onChange={(_, v) => v && setFiltro(v)}
        >
          <ToggleButton value="TODOS">Todos</ToggleButton>
          <ToggleButton value="DISPONIBLE">Disponibles</ToggleButton>
          <ToggleButton value="OCUPADO">Ocupados</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
        gap: 0.5,
      }}>
        {filtrados.map(c => (
          <Tooltip key={c.id} title={`#${c.numero} — ${c.estado === 'DISPONIBLE' ? 'Disponible' : 'Ocupado'}`}>
            <Box
              onClick={() => handleClick(c)}
              sx={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                borderRadius: 0.5,
                cursor: tomando === c.id ? 'wait' : 'pointer',
                bgcolor: c.estado === 'DISPONIBLE' ? 'success.main' : 'error.main',
                color: '#fff',
                transition: 'background-color 0.15s',
                '&:hover': { opacity: 0.8 },
                userSelect: 'none',
              }}
            >
              {c.numero}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  )
}
