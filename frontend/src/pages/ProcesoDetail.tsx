import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton,
} from '@mui/material'
import { Edit, ArrowBack, Add, CheckCircle, Delete } from '@mui/icons-material'
import api from '../services/api'
import type { Proceso } from '../types'
import ProvidenciaDialog from '../components/ProvidenciaDialog'

const colorMap: Record<string, { label: string; color: string }> = {
  VERDE: { label: 'Al día', color: '#2e7d32' },
  AMARILLO: { label: 'Próximo a vencer', color: '#ed6c02' },
  NARANJA: { label: 'Por vencer', color: '#e65100' },
  ROJO: { label: 'Vencido', color: '#d32f2f' },
  GRIS: { label: 'Archivado', color: '#757575' },
}

export default function ProcesoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proceso, setProceso] = useState<Proceso | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = useCallback(() => {
    if (!id) return
    api.get(`/procesos/${id}`)
      .then(r => setProceso(r.data))
      .catch(() => navigate('/procesos'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleCumplir(terminoId: number) {
    await api.patch(`/terminos/${terminoId}/cumplir`)
    load()
  }

  async function handleEliminarProvidencia(pvId: number) {
    if (!confirm('¿Eliminar esta providencia?')) return
    await api.delete(`/providencias/${pvId}`)
    load()
  }

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>
  if (!proceso) return null

  const terminoProximo = proceso.terminos?.find(t => t.estado === 'PENDIENTE')

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/procesos')}>Volver</Button>
        <Typography variant="h4" fontWeight="bold" flex={1}>
          {proceso.radicado}
        </Typography>
        <Button variant="outlined" startIcon={<Edit />}
          onClick={() => navigate(`/procesos/${id}/editar`)}>
          Editar
        </Button>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Información General</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Radicado</Typography><Typography>{proceso.radicado}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Instancia</Typography><Typography>{proceso.instancia === 'PRIMERA' ? 'Primera Instancia (nace en el Tribunal)' : 'Segunda Instancia (viene de un Juzgado)'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Demandante</Typography><Typography>{proceso.demandante}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Demandado</Typography><Typography>{proceso.demandado}</Typography></Grid>
              <Grid item xs={4}><Typography variant="body2" color="text.secondary">Clase</Typography><Typography>{proceso.claseProceso?.nombre}</Typography></Grid>
              <Grid item xs={4}><Typography variant="body2" color="text.secondary">Despacho</Typography><Typography>{proceso.despachoActual?.nombre}</Typography></Grid>
              <Grid item xs={4}><Typography variant="body2" color="text.secondary">Etapa</Typography><Chip label={proceso.etapaActual?.nombre} color="primary" size="small" /></Grid>
              <Grid item xs={4}><Typography variant="body2" color="text.secondary">Estado</Typography><Chip label={colorMap[proceso.colorEstado]?.label} sx={{ bgcolor: colorMap[proceso.colorEstado]?.color, color: '#fff' }} size="small" /></Grid>
              <Grid item xs={4}><Typography variant="body2" color="text.secondary">Fecha Ingreso</Typography><Typography>{new Date(proceso.fechaIngresoTribunal).toLocaleDateString('es-CO')}</Typography></Grid>
              {proceso.juzgadoOrigen && <Grid item xs={4}><Typography variant="body2" color="text.secondary">Juzgado Origen</Typography><Typography>{proceso.juzgadoOrigen.nombre}</Typography></Grid>}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Término Actual</Typography>
            {terminoProximo ? (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {terminoProximo.providencia?.tipoProvidencia?.nombre}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={
                  terminoProximo.estado === 'VENCIDO' ? 'error' : 'text.primary'
                }>
                  {new Date(terminoProximo.fechaVencimiento).toLocaleDateString('es-CO')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {terminoProximo.diasTotales} días hábiles desde notificación
                </Typography>
                <Button
                  variant="contained" color="success" size="small"
                  startIcon={<CheckCircle />} sx={{ mt: 1 }}
                  onClick={() => handleCumplir(terminoProximo.id)}
                >
                  Cumplir término
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Sin términos activos</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Providencias</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Registrar Providencia
          </Button>
        </Box>

        {proceso.providencias && proceso.providencias.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha Providencia</TableCell>
                  <TableCell>Notificación</TableCell>
                  <TableCell>Orden</TableCell>
                  <TableCell>Término</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proceso.providencias.map(pv => {
                  const termino = pv.terminos?.[0]
                  return (
                    <TableRow key={pv.id}>
                      <TableCell><Typography fontWeight="medium">{pv.tipoProvidencia?.nombre}</Typography></TableCell>
                      <TableCell>{new Date(pv.fechaProvidencia).toLocaleDateString('es-CO')}</TableCell>
                      <TableCell>{new Date(pv.fechaNotificacion).toLocaleDateString('es-CO')}</TableCell>
                      <TableCell>{pv.orden}</TableCell>
                      <TableCell>
                        {termino ? (
                          <>
                            <Typography variant="body2">
                              Vence: {new Date(termino.fechaVencimiento).toLocaleDateString('es-CO')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({termino.diasTotales} días hábiles)
                            </Typography>
                          </>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {termino ? (
                          <Chip
                            label={termino.estado === 'CUMPLIDO' ? 'Cumplido' : termino.estado === 'VENCIDO' ? 'Vencido' : 'Pendiente'}
                            color={termino.estado === 'CUMPLIDO' ? 'success' : termino.estado === 'VENCIDO' ? 'error' : 'warning'}
                            size="small"
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {termino?.estado === 'PENDIENTE' ? (
                          <IconButton size="small" color="success"
                            onClick={() => handleCumplir(termino.id)}
                            title="Cumplir término">
                            <CheckCircle />
                          </IconButton>
                        ) : null}
                        <IconButton size="small" color="error"
                          onClick={() => handleEliminarProvidencia(pv.id)}
                          title="Eliminar">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
            No se han registrado providencias. Haga clic en "Registrar Providencia" para agregar una.
          </Typography>
        )}
      </Paper>

      {id && (
        <ProvidenciaDialog
          open={dialogOpen}
          procesoId={parseInt(id)}
          onClose={() => setDialogOpen(false)}
          onCreated={load}
        />
      )}
    </Box>
  )
}
