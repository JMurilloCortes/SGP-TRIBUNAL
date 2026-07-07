import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Button,
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

  async function handleEliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar permanentemente al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return
    await api.delete(`/users/${id}`)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">Usuarios</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/usuarios/nuevo')}>
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper}>
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
                <TableCell><Typography fontWeight="medium">{u.nombre}</Typography></TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip label={u.rol === 'ADMIN' ? 'Admin' : 'Escribiente'}
                    color={u.rol === 'ADMIN' ? 'primary' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  {u.despachos?.length > 0
                    ? u.despachos.map(d => d.codigo).join(', ')
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip label={u.activo ? 'Activo' : 'Inactivo'}
                    color={u.activo ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/usuarios/${u.id}`)} title="Ver">
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => navigate(`/usuarios/${u.id}/editar`)} title="Editar">
                    <Edit />
                  </IconButton>
                  {u.rol !== 'ADMIN' && (
                    <IconButton onClick={() => handleEliminar(u.id, u.nombre)} color="error" title="Eliminar">
                      <Delete />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
