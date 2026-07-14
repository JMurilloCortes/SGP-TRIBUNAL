import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Button, Switch,
  Tooltip,
} from '@mui/material'
import { Add, Edit, Delete, Visibility } from '@mui/icons-material'
import api from '../services/api'
import { confirmDelete, toastSuccess, toastError } from '../services/swal'
import type { User } from '../types'

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  ESCRIBIENTE: 'Escribiente',
  NOTIFICADOR: 'Notificador',
  CONTADOR_LIQUIDADOR: 'Cont. Liquidador',
  PROFESIONAL: 'Profesional',
  SECRETARIO: 'Secretario',
  OFICIAL_MAYOR: 'Oficial Mayor',
}

const roleColors: Record<string, 'primary' | 'success' | 'default' | 'warning' | 'info' | 'error'> = {
  ADMIN: 'primary',
  ESCRIBIENTE: 'default',
  NOTIFICADOR: 'success',
  CONTADOR_LIQUIDADOR: 'warning',
  PROFESIONAL: 'info',
  SECRETARIO: 'error',
  OFICIAL_MAYOR: 'success',
}

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
    const confirmed = await confirmDelete(`¿Eliminar permanentemente al usuario <strong>"${nombre}"</strong>? Esta acción no se puede deshacer.`)
    if (!confirmed) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
      toastSuccess('Usuario eliminado correctamente')
    } catch {
      toastError('Error al eliminar el usuario')
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}
        sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 0 } }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Usuarios</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Gestión de usuarios del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/usuarios/nuevo')}
          sx={{ borderRadius: 2, px: 3, py: 1.2, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}>
          Nuevo Usuario
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(155,142,216,0.2)', borderRadius: 3 } }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell sx={{ width: 90 }}>Rol</TableCell>
                <TableCell sx={{ width: 140 }}>Cargo</TableCell>
                <TableCell>Despachos / Juzgados</TableCell>
                <TableCell sx={{ width: 130 }}>Estado</TableCell>
                <TableCell sx={{ width: 120 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Typography fontWeight={600} fontSize="0.85rem" noWrap>{u.nombre}</Typography>
                  </TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Tooltip title={u.email} placement="top">
                      <Typography noWrap variant="body2">{u.email}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={roleLabels[u.rol] || u.rol}
                      color={roleColors[u.rol] || 'default'}
                      size="small"
                      sx={{ fontWeight: 600, minWidth: 0 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {(u as any).cargo || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const despachos = u.despachos || []
                      const juzgados = (u as any).juzgados || []
                      const all = [
                        ...despachos.map((d: any) => ({ code: d.codigo, key: `d-${d.id}` })),
                        ...juzgados.map((j: any) => ({ code: j.codigo, key: `j-${j.id}` })),
                      ]
                      if (all.length === 0) return <Typography variant="body2" color="text.disabled">—</Typography>
                      return (
                        <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap' }}>
                          {all.slice(0, 3).map((item: any) => (
                            <Chip key={item.key} label={item.code} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                          ))}
                          {all.length > 3 && (
                            <Tooltip title={all.map((item: any) => item.code).join(', ')} placement="top">
                              <Chip label={`+${all.length - 3}`} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(155,142,216,0.1)' }} />
                            </Tooltip>
                          )}
                        </Box>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Switch checked={u.activo} disabled={u.rol === 'ADMIN'}
                        onChange={() => handleToggleActivo(u.id)} size="small" />
                      <Chip label={u.activo ? 'Activo' : 'Inactivo'}
                        color={u.activo ? 'success' : 'error'} size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
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
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No hay usuarios registrados</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
