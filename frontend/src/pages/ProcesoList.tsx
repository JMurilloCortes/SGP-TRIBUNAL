import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Button, Grid, Pagination,
} from '@mui/material'
import { Add, Visibility, Edit, FilterList, Search } from '@mui/icons-material'
import api from '../services/api'
import type { Proceso, Despacho, Etapa } from '../types'

const colorMap: Record<string, { label: string; color: string; bg: string }> = {
  VERDE: { label: 'Al día', color: '#2D6B3F', bg: 'rgba(139,196,168,0.15)' },
  AMARILLO: { label: 'Próximo a vencer', color: '#8A7530', bg: 'rgba(232,207,150,0.15)' },
  NARANJA: { label: 'Por vencer', color: '#8A5A30', bg: 'rgba(232,207,150,0.15)' },
  ROJO: { label: 'Vencido', color: '#8A3040', bg: 'rgba(232,168,176,0.15)' },
  GRIS: { label: 'Archivado', color: '#5A5868', bg: 'rgba(155,142,216,0.1)' },
}

export default function ProcesoList() {
  const navigate = useNavigate()
  const [procesos, setProcesos] = useState<Proceso[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filtroEtapa, setFiltroEtapa] = useState('')
  const [filtroDespacho, setFiltroDespacho] = useState('')
  const [filtroColor, setFiltroColor] = useState('')
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    api.get('/catalogos/despachos').then(r => setDespachos(r.data))
    api.get('/catalogos/etapas').then(r => setEtapas(r.data))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (filtroEtapa) params.set('etapa', filtroEtapa)
    if (filtroDespacho) params.set('despacho', filtroDespacho)
    if (filtroColor) params.set('color', filtroColor)
    params.set('page', String(page + 1))
    params.set('limit', String(rowsPerPage))

    api.get(`/procesos?${params}`).then(r => {
      setProcesos(r.data.data)
      setTotal(r.data.total)
    })
  }, [page, rowsPerPage, debouncedSearch, filtroEtapa, filtroDespacho, filtroColor])

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}
        sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 0 } }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Procesos</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Gestión y seguimiento de procesos judiciales
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/procesos/nuevo')}
          sx={{ borderRadius: 2, px: 3, py: 1.2, width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap' }}
        >
          Nuevo Proceso
        </Button>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar radicado, demandante o demandado..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                },
              }}
            />
          </Grid>
          <Grid item xs={6} md={2.5}>
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
          <Grid item xs={6} md={1.5}>
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
          <Grid item xs={6} md={2}>
            <Button variant="outlined" startIcon={<FilterList />} onClick={() => { setFiltroEtapa(''); setFiltroDespacho(''); setFiltroColor(''); setSearch('') }} fullWidth>
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
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
                <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/procesos/${p.id}`)}>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="0.85rem" color="primary">{p.radicado}</Typography>
                  </TableCell>
                  <TableCell>{p.demandante}</TableCell>
                  <TableCell>{p.demandado}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.claseProceso?.nombre}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.instancia === 'PRIMERA' ? '1ª Inst' : '2ª Inst'}
                      size="small"
                      variant="outlined"
                      color={p.instancia === 'PRIMERA' ? 'primary' : 'secondary'}
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>{p.etapaActual?.nombre}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{p.despachoActual?.codigo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={colorMap[p.colorEstado]?.label || p.colorEstado}
                      sx={{
                        bgcolor: colorMap[p.colorEstado]?.bg || 'rgba(155,142,216,0.1)',
                        color: colorMap[p.colorEstado]?.color || '#6E6B7B',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        backdropFilter: 'blur(4px)',
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" onClick={e => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => navigate(`/procesos/${p.id}`)} sx={{ color: 'primary.main' }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/procesos/${p.id}/editar`)} sx={{ color: 'text.secondary' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {procesos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No se encontraron procesos</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          px: 3,
          py: 2,
          borderTop: '1px solid rgba(155,142,216,0.06)',
          bgcolor: 'rgba(155,142,216,0.02)',
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              Mostrando{' '}
              <Typography component="span" fontWeight={700} sx={{ color: '#2D2B3D' }}>
                {(page * rowsPerPage) + 1}-{Math.min((page + 1) * rowsPerPage, total)}
              </Typography>{' '}
              de{' '}
              <Typography component="span" fontWeight={700} sx={{ color: '#2D2B3D' }}>
                {total}
              </Typography>{' '}
              registros
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Filas:</Typography>
              <Select
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0) }}
                size="small"
                sx={{
                  minWidth: 72,
                  height: 32,
                  fontSize: '0.8rem',
                  borderRadius: 1.5,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(155,142,216,0.15)' },
                }}
              >
                {[10, 20, 50, 100].map(n => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          <Pagination
            count={Math.ceil(total / rowsPerPage)}
            page={page + 1}
            onChange={(_, p) => setPage(p - 1)}
            siblingCount={1}
            boundaryCount={1}
            shape="rounded"
            size="medium"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: '0.8rem',
                minWidth: 34,
                height: 34,
                transition: 'all 0.2s ease',
                color: '#6E6B7B',
                border: '1px solid transparent',
                '&:hover': {
                  bgcolor: 'rgba(155,142,216,0.07)',
                  borderColor: 'rgba(155,142,216,0.15)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(155,142,216,0.12)',
                  color: '#9B8ED8',
                  fontWeight: 700,
                  border: '1px solid rgba(155,142,216,0.2)',
                  boxShadow: '0 2px 8px rgba(155,142,216,0.1)',
                  '&:hover': { bgcolor: 'rgba(155,142,216,0.18)' },
                },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              },
              '& .MuiPaginationItem-ellipsis': {
                color: '#B0AEB8',
                border: 'none',
                minWidth: 20,
              },
              '& .MuiPaginationItem-icon': {
                fontSize: 18,
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  )
}
