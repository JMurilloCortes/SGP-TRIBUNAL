import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Grid, Chip, Button, CircularProgress,
  Avatar, Divider,
} from '@mui/material'
import { Edit, ArrowBack } from '@mui/icons-material'
import api from '../services/api'
import type { User } from '../types'

const rolColors: Record<string, 'primary' | 'success' | 'default' | 'warning' | 'info' | 'error'> = {
  ADMIN: 'primary',
  NOTIFICADOR: 'success',
  ESCRIBIENTE: 'default',
  CONTADOR_LIQUIDADOR: 'warning',
  PROFESIONAL: 'info',
  SECRETARIO: 'error',
  OFICIAL_MAYOR: 'success',
}

const rolLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  NOTIFICADOR: 'Notificador',
  ESCRIBIENTE: 'Escribiente',
  CONTADOR_LIQUIDADOR: 'Contador Liquidador',
  PROFESIONAL: 'Profesional Universitario',
  SECRETARIO: 'Secretario General',
  OFICIAL_MAYOR: 'Oficial Mayor',
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
      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/usuarios')} sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight={800} flex={1} noWrap sx={{
          background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '1.3rem', sm: '2.125rem' },
        }}>{user.nombre}</Typography>
        <Button variant="outlined" startIcon={<Edit />}
          onClick={() => navigate(`/usuarios/${id}/editar`)} sx={{ borderRadius: 2, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          p: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2.5 },
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, rgba(155,142,216,0.04) 0%, rgba(242,181,174,0.04) 100%)',
          borderBottom: '1px solid rgba(155,142,216,0.06)',
        }}>
          <Avatar sx={{
            width: { xs: 48, sm: 64 },
            height: { xs: 48, sm: 64 },
            background: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 100%)',
            fontSize: { xs: '1.2rem', sm: '1.6rem' },
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

            {(user as any).cargo && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Cargo
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                  {(user as any).cargo}
                </Typography>
              </Grid>
            )}

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

            {(user as any).juzgados?.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Juzgados asignados
                </Typography>
                <Box mt={0.5}>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {(user as any).juzgados.map((j: any) => (
                      <Chip key={j.id} label={`${j.nombre} (${j.codigo})`} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}

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
