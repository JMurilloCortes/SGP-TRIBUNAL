import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Typography, Paper, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, Grid, Alert, CircularProgress,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale/es'
import api from '../services/api'
import type { Despacho, ClaseProceso } from '../types'

interface FormData {
  radicado: string
  demandante: string
  demandado: string
  instancia: 'PRIMERA' | 'SEGUNDA'
  fechaIngresoTribunal: Date | null
  fechaPrimeraInstancia: Date | null
  fechaSegundaInstancia: Date | null
  juzgadoOrigen: string
  claseProcesoId: string
  despachoActualId: string
}

const initialForm: FormData = {
  radicado: '',
  demandante: '',
  demandado: '',
  instancia: 'PRIMERA',
  fechaIngresoTribunal: new Date(),
  fechaPrimeraInstancia: null,
  fechaSegundaInstancia: null,
  juzgadoOrigen: '',
  claseProcesoId: '',
  despachoActualId: '',
}

export default function ProcesoForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(initialForm)
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [clases, setClases] = useState<ClaseProceso[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)

  useEffect(() => {
    Promise.all([
      api.get('/catalogos/despachos'),
      api.get('/catalogos/clases-proceso'),
    ]).then(([d, c]) => {
      setDespachos(d.data)
      setClases(c.data)
    })
  }, [])

  useEffect(() => {
    if (!id) return
    api.get(`/procesos/${id}`).then(r => {
      const p = r.data
      setForm({
        radicado: p.radicado,
        demandante: p.demandante,
        demandado: p.demandado,
        instancia: p.instancia,
        fechaIngresoTribunal: new Date(p.fechaIngresoTribunal),
        fechaPrimeraInstancia: p.fechaPrimeraInstancia ? new Date(p.fechaPrimeraInstancia) : null,
        fechaSegundaInstancia: p.fechaSegundaInstancia ? new Date(p.fechaSegundaInstancia) : null,
        juzgadoOrigen: p.juzgadoOrigen || '',
        claseProcesoId: String(p.claseProcesoId),
        despachoActualId: String(p.despachoActualId),
      })
    }).catch(() => navigate('/procesos'))
      .finally(() => setLoadingData(false))
  }, [id])

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const body = {
        radicado: form.radicado,
        demandante: form.demandante,
        demandado: form.demandado,
        instancia: form.instancia,
        fechaIngresoTribunal: form.fechaIngresoTribunal?.toISOString(),
        fechaPrimeraInstancia: form.fechaPrimeraInstancia?.toISOString() || null,
        fechaSegundaInstancia: form.fechaSegundaInstancia?.toISOString() || null,
        juzgadoOrigen: form.juzgadoOrigen || null,
        claseProcesoId: parseInt(form.claseProcesoId),
        despachoActualId: parseInt(form.despachoActualId),
      }

      if (isEdit) {
        await api.put(`/procesos/${id}`, body)
      } else {
        await api.post('/procesos', body)
      }
      navigate('/procesos')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el proceso')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <Box textAlign="center" mt={4}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {isEdit ? 'Editar Proceso' : 'Registrar Nuevo Proceso'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Radicado" required
                  value={form.radicado} onChange={e => update('radicado', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Instancia</InputLabel>
                  <Select value={form.instancia} label="Instancia"
                    onChange={e => update('instancia', e.target.value as 'PRIMERA' | 'SEGUNDA')}>
                    <MenuItem value="PRIMERA">Primera Instancia</MenuItem>
                    <MenuItem value="SEGUNDA">Segunda Instancia</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Demandante" required
                  value={form.demandante} onChange={e => update('demandante', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Demandado" required
                  value={form.demandado} onChange={e => update('demandado', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker label="Fecha ingreso tribunal"
                  value={form.fechaIngresoTribunal}
                  onChange={d => update('fechaIngresoTribunal', d)}
                  slotProps={{ textField: { fullWidth: true, required: true } }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker label="Fecha 1ra instancia"
                  value={form.fechaPrimeraInstancia}
                  onChange={d => update('fechaPrimeraInstancia', d)}
                  slotProps={{ textField: { fullWidth: true } }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker label="Fecha 2da instancia"
                  value={form.fechaSegundaInstancia}
                  onChange={d => update('fechaSegundaInstancia', d)}
                  slotProps={{ textField: { fullWidth: true } }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Juzgado de origen"
                  value={form.juzgadoOrigen} onChange={e => update('juzgadoOrigen', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Clase de proceso</InputLabel>
                  <Select value={form.claseProcesoId} label="Clase de proceso"
                    onChange={e => update('claseProcesoId', e.target.value)}>
                    {clases.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Despacho</InputLabel>
                  <Select value={form.despachoActualId} label="Despacho"
                    onChange={e => update('despachoActualId', e.target.value)}>
                    {despachos.map(d => <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Box display="flex" gap={2} mt={3}>
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/procesos')}>Cancelar</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}
