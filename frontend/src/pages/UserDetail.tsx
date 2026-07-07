import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Grid, Chip, Button, CircularProgress,
} from '@mui/material'
import { Edit, ArrowBack } from '@mui/icons-material'
import api from '../services/api'
import type { User } from '../types'

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
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/usuarios')}>Volver</Button>
        <Typography variant="h4" fontWeight="bold" flex={1}>{user.nombre}</Typography>
        <Button variant="outlined" startIcon={<Edit />}
          onClick={() => navigate(`/usuarios/${id}/editar`)}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 2, maxWidth: 500 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Nombre</Typography>
            <Typography>{user.nombre}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography>{user.email}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Rol</Typography>
            <Chip label={user.rol === 'ADMIN' ? 'Administrador' : 'Escribiente'}
              color={user.rol === 'ADMIN' ? 'primary' : 'default'} size="small" />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Estado</Typography>
            <Chip label={user.activo ? 'Activo' : 'Inactivo'}
              color={user.activo ? 'success' : 'error'} size="small" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Despachos asignados</Typography>
            <Box display="flex" gap={0.5} mt={0.5}>
              {user.despachos?.length > 0
                ? user.despachos.map(d => (
                    <Chip key={d.id} label={`${d.nombre} (${d.codigo})`} size="small" />
                  ))
                : <Typography variant="body2">Ninguno</Typography>
              }
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
