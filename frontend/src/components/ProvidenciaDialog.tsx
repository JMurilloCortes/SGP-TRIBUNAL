import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Select, MenuItem, FormControl, InputLabel, Grid, Alert,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale/es'
import api from '../services/api'
import type { TipoProvidencia } from '../types'

interface Props {
  open: boolean
  procesoId: number
  onClose: () => void
  onCreated: () => void
}

export default function ProvidenciaDialog({ open, procesoId, onClose, onCreated }: Props) {
  const [tipos, setTipos] = useState<TipoProvidencia[]>([])
  const [tipoProvidenciaId, setTipoProvidenciaId] = useState('')
  const [fechaProvidencia, setFechaProvidencia] = useState<Date | null>(new Date())
  const [fechaNotificacion, setFechaNotificacion] = useState<Date | null>(new Date())
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      api.get('/catalogos/tipos-providencia').then(r => setTipos(r.data))
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post(`/procesos/${procesoId}/providencias`, {
        tipoProvidenciaId: parseInt(tipoProvidenciaId),
        fechaProvidencia: fechaProvidencia?.toISOString(),
        fechaNotificacion: fechaNotificacion?.toISOString(),
        descripcion: descripcion || undefined,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar providencia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Registrar Providencia</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de providencia</InputLabel>
                  <Select value={tipoProvidenciaId} label="Tipo de providencia"
                    onChange={e => setTipoProvidenciaId(e.target.value)}>
                    {tipos.map(t => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.nombre} ({t.diasTermino} días hábiles)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <DatePicker label="Fecha providencia"
                  value={fechaProvidencia} onChange={setFechaProvidencia}
                  slotProps={{ textField: { fullWidth: true, required: true } }} />
              </Grid>
              <Grid item xs={6}>
                <DatePicker label="Fecha notificación"
                  value={fechaNotificacion} onChange={setFechaNotificacion}
                  slotProps={{ textField: { fullWidth: true, required: true } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Descripción" multiline rows={3}
                  value={descripcion} onChange={e => setDescripcion(e.target.value)} />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" type="submit" disabled={loading || !tipoProvidenciaId}>
            {loading ? 'Guardando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
