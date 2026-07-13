import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Grid, Chip, Button, CircularProgress,
  Avatar, Divider,
} from '@mui/material'
import { Edit, ArrowBack } from '@mui/icons-material'
import api from '../services/api'
import type { User } from '../types'

const rolColors: Record<string, 'primary' | 'success' | 'default'> = {
  ADMIN: 'primary',
  NOTIFICADOR: 'success',
  ESCRIBIENTE: 'default',
}

const rolLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  NOTIFICADOR: 'Notificador',
  ESCRIBIENTE: 'Escribiente',
}

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/users/${id}`)
      .then(r => setUser(r.data))
      .catch(() => navigate('/usuarios'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>
  if (!user) return null

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/usuarios')} sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight={800} flex={1} noWrap sx={{
          background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>{user.nombre}</Typography>
        <Button variant="outlined" startIcon={<Edit />}
          onClick={() => navigate(`/usuarios/${id}/editar`)} sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          background: 'linear-gradient(135deg, rgba(155,142,216,0.04) 0%, rgba(242,181,174,0.04) 100%)',
          borderBottom: '1px solid rgba(155,142,216,0.06)',
        }}>
          <Avatar sx={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 100%)',
            fontSize: '1.6rem',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(155,142,216,0.3)',
          }}>
            {user.nombre.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700} noWrap>{user.nombre}</Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip label={rolLabels[user.rol] || user.rol}
                color={rolColors[user.rol] || 'default'} size="small" sx={{ fontWeight: 600 }} />
              <Chip label={user.activo ? 'Activo' : 'Inactivo'}
                color={user.activo ? 'success' : 'error'} size="small" sx={{ fontWeight: 600 }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Correo electrónico
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                {user.email}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Despachos asignados
              </Typography>
              <Box mt={0.5}>
                {user.despachos?.length > 0 ? (
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {user.despachos.map(d => (
                      <Chip key={d.id} label={`${d.nombre} (${d.codigo})`} size="small" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled">Ninguno</Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                ID de usuario: {user.id}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}
