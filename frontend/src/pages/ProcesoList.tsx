import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Chip, IconButton, Button, Grid,
} from '@mui/material'
import { Add, Visibility, Edit } from '@mui/icons-material'
import api from '../services/api'
import type { Proceso, Despacho, Etapa } from '../types'

const colorMap: Record<string, { label: string; color: string }> = {
  VERDE: { label: 'Verde', color: '#2e7d32' },
  AMARILLO: { label: 'Amarillo', color: '#ed6c02' },
  NARANJA: { label: 'Naranja', color: '#e65100' },
  ROJO: { label: 'Rojo', color: '#d32f2f' },
  GRIS: { label: 'Gris', color: '#757575' },
}

export default function ProcesoList() {
  const navigate = useNavigate()
  const [procesos, setProcesos] = useState<Proceso[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [search, setSearch] = useState('')
  const [filtroEtapa, setFiltroEtapa] = useState('')
  const [filtroDespacho, setFiltroDespacho] = useState('')
  const [filtroColor, setFiltroColor] = useState('')
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [etapas, setEtapas] = useState<Etapa[]>([])

  useEffect(() => {
    api.get('/catalogos/despachos').then(r => setDespachos(r.data))
    api.get('/catalogos/etapas').then(r => setEtapas(r.data))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filtroEtapa) params.set('etapa', filtroEtapa)
    if (filtroDespacho) params.set('despacho', filtroDespacho)
    if (filtroColor) params.set('color', filtroColor)
    params.set('page', String(page + 1))
    params.set('limit', String(rowsPerPage))

    api.get(`/procesos?${params}`).then(r => {
      setProcesos(r.data.data)
      setTotal(r.data.total)
    })
  }, [page, rowsPerPage, search, filtroEtapa, filtroDespacho, filtroColor])

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">Procesos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/procesos/nuevo')}>
          Nuevo Proceso
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth size="small" label="Buscar (radicado, demandante, demandado)"
              value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Etapa</InputLabel>
              <Select value={filtroEtapa} label="Etapa" onChange={e => { setFiltroEtapa(e.target.value); setPage(0) }}>
                <MenuItem value="">Todas</MenuItem>
                {etapas.map(e => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Despacho</InputLabel>
              <Select value={filtroDespacho} label="Despacho" onChange={e => { setFiltroDespacho(e.target.value); setPage(0) }}>
                <MenuItem value="">Todos</MenuItem>
                {despachos.map(d => <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select value={filtroColor} label="Estado" onChange={e => { setFiltroColor(e.target.value); setPage(0) }}>
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(colorMap).map(([key, v]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: v.color }} />
                      {v.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Radicado</TableCell>
              <TableCell>Demandante</TableCell>
              <TableCell>Demandado</TableCell>
              <TableCell>Clase</TableCell>
              <TableCell>Instancia</TableCell>
              <TableCell>Etapa</TableCell>
              <TableCell>Despacho</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {procesos.map(p => (
              <TableRow key={p.id} hover>
                <TableCell><Typography fontWeight="medium">{p.radicado}</Typography></TableCell>
                <TableCell>{p.demandante}</TableCell>
                <TableCell>{p.demandado}</TableCell>
                <TableCell>{p.claseProceso?.nombre}</TableCell>
                <TableCell>{p.instancia === 'PRIMERA' ? '1ª Inst' : '2ª Inst'}</TableCell>
                <TableCell>{p.etapaActual?.nombre}</TableCell>
                <TableCell>{p.despachoActual?.codigo}</TableCell>
                <TableCell>
                  <Chip
                    label={colorMap[p.colorEstado]?.label || p.colorEstado}
                    sx={{
                      bgcolor: colorMap[p.colorEstado]?.color || '#757575',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/procesos/${p.id}`)}><Visibility /></IconButton>
                  <IconButton onClick={() => navigate(`/procesos/${p.id}/editar`)}><Edit /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {procesos.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">No se encontraron procesos</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          labelRowsPerPage="Filas por página"
        />
      </TableContainer>
    </Box>
  )
}
