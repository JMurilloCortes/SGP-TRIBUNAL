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

interface Juzgado {
  id: number
  nombre: string
  codigo: string
}

interface Props {
  open: boolean
  procesoId: number
  juzgadoOrigenId?: number | null
  onClose: () => void
}

export default function GenerarOficioDialog({ open, procesoId, juzgadoOrigenId, onClose }: Props) {
  const [modelos, setModelos] = useState<ModeloOficio[]>([])
  const [juzgados, setJuzgados] = useState<Juzgado[]>([])
  const [modeloId, setModeloId] = useState('')
  const [juzgadoSel, setJuzgadoSel] = useState('')
  const [destinatario, setDestinatario] = useState('')
  const [cargo, setCargo] = useState('')
  const [entidad, setEntidad] = useState('')
  const [direccion, setDireccion] = useState('')
  const [asunto, setAsunto] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const esDevolver = Number(modeloId) === 1

  useEffect(() => {
    api.get('/oficios/modelos').then(r => setModelos(r.data))
    api.get('/catalogos/juzgados').then(r => setJuzgados(r.data))
  }, [])

  useEffect(() => {
    if (!esDevolver || !juzgadoSel) return
    const j = juzgados.find(j => String(j.id) === juzgadoSel)
    if (!j) return
    setDestinatario(`JUEZ ${j.nombre.toUpperCase()}`)
    setCargo('Juez Administrativo')
    setEntidad(j.nombre)
    setDireccion('Quibdó, Chocó')
  }, [juzgadoSel, esDevolver, juzgados])

  useEffect(() => {
    if (!esDevolver) {
      setJuzgadoSel('')
    } else if (juzgadoOrigenId) {
      setJuzgadoSel(String(juzgadoOrigenId))
    }
  }, [esDevolver, juzgadoOrigenId])

  async function handleGenerar() {
    setError('')
    if (!modeloId || !destinatario || !cargo || !entidad || !direccion || !asunto) {
      setError('Todos los campos son obligatorios')
      return
    }
    setLoading(true)
    try {
      const res = await api.post(`/oficios/${procesoId}/generar`, {
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

        {esDevolver && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Juzgado destino</InputLabel>
            <Select value={juzgadoSel} label="Juzgado destino" onChange={e => setJuzgadoSel(e.target.value)}>
              {juzgados.map(j => <MenuItem key={j.id} value={j.id}>{j.nombre} ({j.codigo})</MenuItem>)}
            </Select>
          </FormControl>
        )}

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
