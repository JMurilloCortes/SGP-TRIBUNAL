import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert,
} from '@mui/material'
import api from '../services/api'

interface ModeloOficio {
  id: number
  nombre: string
  descripcion: string
}

interface Props {
  open: boolean
  procesoId: number
  onClose: () => void
}

export default function GenerarOficioDialog({ open, procesoId, onClose }: Props) {
  const [modelos, setModelos] = useState<ModeloOficio[]>([])
  const [modeloId, setModeloId] = useState('')
  const [destinatario, setDestinatario] = useState('')
  const [cargo, setCargo] = useState('')
  const [entidad, setEntidad] = useState('')
  const [direccion, setDireccion] = useState('')
  const [asunto, setAsunto] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/oficios/modelos').then(r => setModelos(r.data))
  }, [])

  async function handleGenerar() {
    setError('')
    if (!modeloId || !destinatario || !cargo || !entidad || !direccion || !asunto) {
      setError('Todos los campos son obligatorios')
      return
    }
    setLoading(true)
    try {
      const res = await api.post(`/procesos/${procesoId}/oficios/generar`, {
        modeloId: parseInt(modeloId),
        destinatario, cargo, entidad, direccion, asunto,
      }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `oficio_${procesoId}.docx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar el oficio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generar Oficio</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Modelo de oficio</InputLabel>
          <Select value={modeloId} label="Modelo de oficio" onChange={e => setModeloId(e.target.value)}>
            {modelos.map(m => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField fullWidth label="Destinatario" sx={{ mt: 2 }} value={destinatario} onChange={e => setDestinatario(e.target.value)} />
        <TextField fullWidth label="Cargo" sx={{ mt: 2 }} value={cargo} onChange={e => setCargo(e.target.value)} />
        <TextField fullWidth label="Entidad" sx={{ mt: 2 }} value={entidad} onChange={e => setEntidad(e.target.value)} />
        <TextField fullWidth label="Dirección" sx={{ mt: 2 }} value={direccion} onChange={e => setDireccion(e.target.value)} />
        <TextField fullWidth label="Asunto" sx={{ mt: 2 }} value={asunto} onChange={e => setAsunto(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleGenerar} disabled={loading}>
          {loading ? 'Generando...' : 'Generar y descargar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
