import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import api from '../services/api'
import { confirmDelete, toastSuccess, toastError } from '../services/swal'

interface Despacho {
  id: number
  nombre: string
  codigo: string
  _count?: { procesos: number; usuarios: number }
}

const empty = { nombre: '', codigo: '' }

export default function DespachosPage() {
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Despacho | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get<Despacho[]>('/despachos').then(r => setDespachos(r.data))
  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setError('')
    setDialogOpen(true)
  }

  function openEdit(d: Despacho) {
    setEditing(d)
    setForm({ nombre: d.nombre, codigo: d.codigo })
    setError('')
    setDialogOpen(true)
  }

  async function handleSave() {
    setError('')
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.codigo.trim()) { setError('El código es obligatorio'); return }

    setSaving(true)
    try {
      const body = { nombre: form.nombre.trim(), codigo: form.codigo.trim().toUpperCase() }
      if (editing) {
        await api.patch(`/despachos/${editing.id}`, body)
        toastSuccess('Despacho actualizado')
      } else {
        await api.post('/despachos', body)
        toastSuccess('Despacho creado')
      }
      setDialogOpen(false)
      load()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number, nombre: string) {
    const confirmed = await confirmDelete(`¿Eliminar permanentemente "<strong>${nombre}</strong>"? Esta acción no se puede deshacer.`)
    if (!confirmed) return
    try {
      await api.delete(`/despachos/${id}`)
      setDespachos(prev => prev.filter(d => d.id !== id))
      toastSuccess('Despacho eliminado')
    } catch (err: any) {
      toastError(err?.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}
        sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 0 } }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Despachos</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Administración de despachos del tribunal
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ borderRadius: 2, px: 3, py: 1.2, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}>
          Nuevo Despacho
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(155,142,216,0.2)', borderRadius: 3 } }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell sx={{ width: 120 }}>Código</TableCell>
                <TableCell sx={{ width: 100 }}>Procesos</TableCell>
                <TableCell sx={{ width: 100 }}>Usuarios</TableCell>
                <TableCell sx={{ width: 120 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {despachos.map(d => (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="0.85rem">{d.nombre}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={d.codigo} size="small" variant="outlined"
                      sx={{ fontWeight: 600, borderColor: 'rgba(155,142,216,0.25)' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {d._count?.procesos || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {d._count?.usuarios || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton onClick={() => openEdit(d)} title="Editar" size="small" sx={{ color: 'text.secondary' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(d.id, d.nombre)} color="error" size="small" title="Eliminar">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {despachos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No hay despachos registrados</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {editing ? 'Editar Despacho' : 'Nuevo Despacho'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2, mt: 1, p: 1.5, bgcolor: 'rgba(232,168,176,0.1)', borderRadius: 1 }}>
              {error}
            </Typography>
          )}
          <TextField fullWidth label="Nombre" value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            margin="normal" autoFocus />
          <TextField fullWidth label="Código" value={form.codigo}
            onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))}
            margin="normal" placeholder="Ej: TRIB-001" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
