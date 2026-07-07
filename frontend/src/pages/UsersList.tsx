import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Button, Switch,
} from '@mui/material'
import { Add, Edit, Delete, Visibility } from '@mui/icons-material'
import api from '../services/api'
import type { User } from '../types'

export default function UsersList() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data))
  }, [])

  async function handleToggleActivo(id: number) {
    const res = await api.patch(`/users/${id}/estado`)
    setUsers(prev => prev.map(u => u.id === id ? res.data : u))
  }

  async function handleEliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar permanentemente al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return
    await api.delete(`/users/${id}`)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Usuarios</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Gestión de usuarios del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/usuarios/nuevo')} sx={{ borderRadius: 2, px: 3, py: 1.2 }}>
          Nuevo Usuario
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Despachos</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} hover>
                  <TableCell><Typography fontWeight={600} fontSize="0.85rem">{u.nombre}</Typography></TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.rol === 'ADMIN' ? 'Admin' : u.rol === 'NOTIFICADOR' ? 'Notificador' : 'Escribiente'}
                      color={u.rol === 'ADMIN' ? 'primary' : u.rol === 'NOTIFICADOR' ? 'success' : 'default'} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {u.despachos?.length > 0 ? u.despachos.map(d => d.codigo).join(', ') : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Switch checked={u.activo} disabled={u.rol === 'ADMIN'}
                        onChange={() => handleToggleActivo(u.id)} size="small" />
                      <Chip label={u.activo ? 'Activo' : 'Inactivo'}
                        color={u.activo ? 'success' : 'error'} size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/usuarios/${u.id}`)} title="Ver" size="small" sx={{ color: 'primary.main' }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => navigate(`/usuarios/${u.id}/editar`)} title="Editar" size="small" sx={{ color: 'text.secondary' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    {u.rol !== 'ADMIN' && (
                      <IconButton onClick={() => handleEliminar(u.id, u.nombre)} color="error" size="small" title="Eliminar">
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
