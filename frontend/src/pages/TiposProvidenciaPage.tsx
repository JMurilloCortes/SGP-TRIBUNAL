import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, Switch,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import api from '../services/api'
import { confirmDelete, toastSuccess, toastError } from '../services/swal'

interface TipoProvidencia {
  id: number
  nombre: string
  diasTermino: number
  ordenPredeterminada: string
  activo: boolean
  _count?: { providencias: number }
}

const ORDENES = [
  { value: 'ADMITIR', label: 'Admitir' },
  { value: 'INADMITIR', label: 'Inadmitir' },
  { value: 'RECHAZAR', label: 'Rechazar' },
  { value: 'SENTENCIA', label: 'Sentencia' },
  { value: 'ARCHIVAR', label: 'Archivar' },
  { value: 'REMITIR_CORTE', label: 'Remitir Corte' },
  { value: 'REMITIR_CONSEJO_ESTADO', label: 'Remitir Consejo de Estado' },
  { value: 'DEVOLVER_JUZGADO', label: 'Devolver a Juzgado' },
  { value: 'OTRO', label: 'Otro' },
]

const empty = { nombre: '', diasTermino: '', ordenPredeterminada: 'OTRO' }

export default function TiposProvidenciaPage() {
  const [tipos, setTipos] = useState<TipoProvidencia[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoProvidencia | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get<TipoProvidencia[]>('/tipos-providencia').then(r => setTipos(r.data))
  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setError('')
    setDialogOpen(true)
  }

  function openEdit(t: TipoProvidencia) {
    setEditing(t)
    setForm({ nombre: t.nombre, diasTermino: String(t.diasTermino), ordenPredeterminada: t.ordenPredeterminada })
    setError('')
    setDialogOpen(true)
  }

  async function handleSave() {
    setError('')
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.diasTermino || Number(form.diasTermino) < 1) { setError('Los días término deben ser al menos 1'); return }

    setSaving(true)
    try {
      const body = { nombre: form.nombre.trim(), diasTermino: Number(form.diasTermino), ordenPredeterminada: form.ordenPredeterminada }
      if (editing) {
        await api.patch(`/tipos-providencia/${editing.id}`, body)
        toastSuccess('Tipo de providencia actualizado')
      } else {
        await api.post('/tipos-providencia', body)
        toastSuccess('Tipo de providencia creado')
      }
      setDialogOpen(false)
      load()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(id: number) {
    try {
      const r = await api.patch(`/tipos-providencia/${id}/estado`)
      setTipos(prev => prev.map(t => t.id === id ? { ...t, activo: r.data.activo } : t))
    } catch { toastError('Error al cambiar estado') }
  }

  async function handleDelete(id: number, nombre: string) {
    const confirmed = await confirmDelete(`¿Eliminar permanentemente "<strong>${nombre}</strong>"? Esta acción no se puede deshacer.`)
    if (!confirmed) return
    try {
      await api.delete(`/tipos-providencia/${id}`)
      setTipos(prev => prev.filter(t => t.id !== id))
      toastSuccess('Tipo de providencia eliminado')
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
          }}>Tipos de Providencia</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Configuración de tipos de providencia y sus términos
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ borderRadius: 2, px: 3, py: 1.2, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}>
          Nuevo Tipo
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(155,142,216,0.2)', borderRadius: 3 } }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell sx={{ width: 120 }}>Días Término</TableCell>
                <TableCell>Orden Predeterminada</TableCell>
                <TableCell sx={{ width: 100 }}>Providencias</TableCell>
                <TableCell sx={{ width: 130 }}>Estado</TableCell>
                <TableCell sx={{ width: 120 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tipos.map(t => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="0.85rem">{t.nombre}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${t.diasTermino} días`} size="small" variant="outlined"
                      sx={{ fontWeight: 600, borderColor: 'rgba(155,142,216,0.25)' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {ORDENES.find(o => o.value === t.ordenPredeterminada)?.label || t.ordenPredeterminada}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {t._count?.providencias || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Switch checked={t.activo} onChange={() => handleToggle(t.id)} size="small" />
                      <Chip label={t.activo ? 'Activo' : 'Inactivo'}
                        color={t.activo ? 'success' : 'error'} size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton onClick={() => openEdit(t)} title="Editar" size="small" sx={{ color: 'text.secondary' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(t.id, t.nombre)} color="error" size="small" title="Eliminar">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {tipos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No hay tipos de providencia registrados</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {editing ? 'Editar Tipo de Providencia' : 'Nuevo Tipo de Providencia'}
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
          <TextField fullWidth label="Días de Término" type="number" value={form.diasTermino}
            onChange={e => setForm(p => ({ ...p, diasTermino: e.target.value }))}
            margin="normal" inputProps={{ min: 1 }} />
          <TextField fullWidth select label="Orden Predeterminada" value={form.ordenPredeterminada}
            onChange={e => setForm(p => ({ ...p, ordenPredeterminada: e.target.value }))}
            margin="normal">
            {ORDENES.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
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
