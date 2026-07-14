import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Typography, Paper, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, Grid, Alert, CircularProgress, Chip,
  OutlinedInput, Checkbox, ListItemText,
} from '@mui/material'
import api from '../services/api'
import type { Despacho, Juzgado, User } from '../types'

const ALL_ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'ESCRIBIENTE', label: 'Escribiente' },
  { value: 'NOTIFICADOR', label: 'Notificador' },
  { value: 'CONTADOR_LIQUIDADOR', label: 'Contador Liquidador' },
  { value: 'PROFESIONAL', label: 'Profesional Universitario' },
  { value: 'SECRETARIO', label: 'Secretario General' },
  { value: 'OFICIAL_MAYOR', label: 'Oficial Mayor' },
]

type Rol = typeof ALL_ROLES[number]['value']

export default function UserForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<Rol>('ESCRIBIENTE')
  const [cargo, setCargo] = useState('')
  const [despachoIds, setDespachoIds] = useState<number[]>([])
  const [juzgadoIds, setJuzgadoIds] = useState<number[]>([])
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [juzgados, setJuzgados] = useState<Juzgado[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)

  useEffect(() => {
    Promise.all([
      api.get('/catalogos/despachos'),
      api.get('/juzgados'),
    ]).then(([d, j]) => {
      setDespachos(d.data)
      setJuzgados(j.data)
    })
  }, [])

  useEffect(() => {
    if (!id) return
    api.get(`/users/${id}`).then((r: { data: User }) => {
      const u = r.data
      setNombre(u.nombre)
      setEmail(u.email)
      setRol(u.rol as Rol)
      setCargo((u as any).cargo || '')
      setDespachoIds(u.despachos?.map(d => d.id) || [])
      setJuzgadoIds((u as any).juzgados?.map((j: any) => j.id) || [])
    }).catch(() => navigate('/usuarios'))
      .finally(() => setLoadingData(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEdit) {
        const body: any = { nombre, email, rol, cargo: cargo || null }
        if (password) body.password = password
        await api.put(`/users/${id}`, body)
        await api.patch(`/users/${id}/despachos`, { despachoIds })
        await api.patch(`/users/${id}/juzgados`, { juzgadoIds })
      } else {
        await api.post('/users', { nombre, email, password, rol, cargo: cargo || null, despachoIds, juzgadoIds })
      }
      navigate('/usuarios')
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al guardar usuario')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <Box textAlign="center" mt={4}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={3} sx={{
        background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nombre" required
                value={nombre} onChange={e => setNombre(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" required
                value={email} onChange={e => setEmail(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={isEdit ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
                type="password" required={!isEdit}
                value={password} onChange={e => setPassword(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Rol</InputLabel>
                <Select value={rol} label="Rol" onChange={e => setRol(e.target.value as Rol)}>
                  {ALL_ROLES.map(r => (
                    <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Cargo / Cargo" value={cargo}
                onChange={e => setCargo(e.target.value)}
                placeholder="Ej: Contador Liquidador Grado 17" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Despachos asignados</InputLabel>
                <Select
                  multiple value={despachoIds}
                  onChange={e => setDespachoIds(e.target.value as number[])}
                  input={<OutlinedInput label="Despachos asignados" />}
                  renderValue={(selected) => (
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {selected.map(id => {
                        const d = despachos.find(d => d.id === id)
                        return d ? <Chip key={id} label={d.codigo} size="small" /> : null
                      })}
                    </Box>
                  )}
                >
                  {despachos.map(d => (
                    <MenuItem key={d.id} value={d.id}>
                      <Checkbox checked={despachoIds.includes(d.id)} />
                      <ListItemText primary={`${d.nombre} (${d.codigo})`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Juzgados asignados</InputLabel>
                <Select
                  multiple value={juzgadoIds}
                  onChange={e => setJuzgadoIds(e.target.value as number[])}
                  input={<OutlinedInput label="Juzgados asignados" />}
                  renderValue={(selected) => (
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {selected.map(id => {
                        const j = juzgados.find(j => j.id === id)
                        return j ? <Chip key={id} label={j.codigo} size="small" /> : null
                      })}
                    </Box>
                  )}
                >
                  {juzgados.map(j => (
                    <MenuItem key={j.id} value={j.id}>
                      <Checkbox checked={juzgadoIds.includes(j.id)} />
                      <ListItemText primary={`${j.nombre} (${j.codigo})`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={3} flexWrap="wrap">
            <Button variant="contained" type="submit" disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/usuarios')} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancelar</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}
