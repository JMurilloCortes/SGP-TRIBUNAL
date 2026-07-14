import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Grid, Chip, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Card, CardContent, Avatar, Divider, Tabs, Tab,
} from '@mui/material'
import {
  ArrowBack, Edit, Gavel, Description, History,
  Person, CalendarToday, FolderOpen, Notifications as NotifIcon,
  CheckCircle,
} from '@mui/icons-material'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ProvidenciaDialog from '../components/ProvidenciaDialog'
import GenerarOficioDialog from '../components/GenerarOficioDialog'
import type { Proceso } from '../types'

const colorMap: Record<string, { label: string; color: string; bg: string }> = {
  VERDE: { label: 'Al día', color: '#2D6B3F', bg: 'rgba(139,196,168,0.15)' },
  AMARILLO: { label: 'Próximo a vencer', color: '#8A7530', bg: 'rgba(232,207,150,0.15)' },
  NARANJA: { label: 'Por vencer', color: '#8A5A30', bg: 'rgba(232,207,150,0.15)' },
  ROJO: { label: 'Vencido', color: '#8A3040', bg: 'rgba(232,168,176,0.15)' },
  GRIS: { label: 'Archivado', color: '#5A5868', bg: 'rgba(155,142,216,0.1)' },
}

export default function ProcesoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [proceso, setProceso] = useState<Proceso | null>(null)
  const [tab, setTab] = useState(0)
  const [providenciaOpen, setProvidenciaOpen] = useState(false)
  const [oficioOpen, setOficioOpen] = useState(false)
  const [cambioEtapaOpen, setCambioEtapaOpen] = useState(false)
  const [etapaId, setEtapaId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/procesos/${id}`).then(r => setProceso(r.data))
  }, [id])

  if (!proceso) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  )

  async function handleCambiarEtapa() {
    setError('')
    try {
      await api.patch(`/procesos/${id}/etapa`, { etapaActualId: parseInt(etapaId), descripcion })
      const r = await api.get(`/procesos/${id}`)
      setProceso(r.data)
      setCambioEtapaOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar etapa')
    }
  }

  const infoCards = [
    { label: 'Radicado', value: proceso.radicado, icon: <FolderOpen /> },
    { label: 'Demandante', value: proceso.demandante, icon: <Person /> },
    { label: 'Demandado', value: proceso.demandado, icon: <Person /> },
    { label: 'Instancia', value: proceso.instancia === 'PRIMERA' ? 'Primera Instancia' : 'Segunda Instancia', icon: <Gavel /> },
    { label: 'Clase', value: (proceso as any).claseProceso?.nombre || '-', icon: <FolderOpen /> },
    { label: 'Despacho', value: (proceso as any).despachoActual?.nombre || '-', icon: <Gavel /> },
    { label: 'Etapa Actual', value: (proceso as any).etapaActual?.nombre || '-', icon: <History /> },
    { label: 'Ingreso Tribunal', value: new Date(proceso.fechaIngresoTribunal).toLocaleDateString('es-CO'), icon: <CalendarToday /> },
  ]

  return (
    <Box>
      <Box display="flex" alignItems="flex-start" gap={2} mb={3}
        sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <IconButton onClick={() => navigate('/procesos')} sx={{ bgcolor: 'rgba(155,142,216,0.1)', borderRadius: 2, flexShrink: 0 }}>
            <ArrowBack />
          </IconButton>
          <Box flex={1} sx={{ minWidth: 0 }}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="h4" fontWeight={800} color="primary" sx={{ fontSize: { xs: '1.3rem', sm: '2.125rem' } }}>{proceso.radicado}</Typography>
              <Chip
                label={colorMap[proceso.colorEstado]?.label || proceso.colorEstado}
                sx={{ bgcolor: colorMap[proceso.colorEstado]?.bg || 'rgba(155,142,216,0.1)', color: colorMap[proceso.colorEstado]?.color || '#6E6B7B', fontWeight: 700, backdropFilter: 'blur(4px)' }}
                size="small"
              />
              <Chip
                label={proceso.instancia === 'PRIMERA' ? '1ª Instancia' : '2ª Instancia'}
                variant="outlined"
                color={proceso.instancia === 'PRIMERA' ? 'primary' : 'secondary'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {(proceso as any).claseProceso?.nombre} - {(proceso as any).despachoActual?.nombre}
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/procesos/${id}/editar`)}
          sx={{ borderRadius: 2, width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap' }}>
          Editar
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        {infoCards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(155,142,216,0.1)', color: '#9B8ED8' }}>
                  {c.icon}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{c.label}</Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>{c.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {(user?.rol === 'ADMIN' || user?.rol === 'ESCRIBIENTE') && (
        <Box display="flex" gap={1} mb={3} sx={{ flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Gavel />} onClick={() => setProvidenciaOpen(true)}
            sx={{ width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap' }}>
            Registrar Providencia
          </Button>
          <Button variant="contained" color="secondary" startIcon={<Description />} onClick={() => setOficioOpen(true)}
            sx={{ width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap' }}>
            Generar Oficio
          </Button>
          <Button variant="outlined" startIcon={<History />} onClick={() => setCambioEtapaOpen(true)}
            sx={{ width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap' }}>
            Cambiar Etapa
          </Button>
        </Box>
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, pt: 1 }}>
          <Tab label="Providencias" icon={<Gavel />} iconPosition="start" />
          <Tab label="Términos" icon={<CalendarToday />} iconPosition="start" />
          <Tab label="Actuaciones" icon={<History />} iconPosition="start" />
          <Tab label="Notificaciones" icon={<NotifIcon />} iconPosition="start" />
        </Tabs>
        <Divider />

        {tab === 0 && (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Notificación</TableCell>
                  <TableCell>Término</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {((proceso as any).providencias || []).map((p: any) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{new Date(p.fechaProvidencia).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>
                      <Chip label={p.tipoProvidencia?.nombre} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                    </TableCell>
                    <TableCell>{p.descripcion || '-'}</TableCell>
                    <TableCell>
                      {p.fechaNotificacion ? (
                        <Chip label={new Date(p.fechaNotificacion).toLocaleDateString('es-CO')} size="small" color="success" />
                      ) : (
                        <Chip label="Sin notificar" size="small" color="warning" />
                      )}
                    </TableCell>
                    <TableCell>
                      {p.terminos?.length > 0 ? (
                        <Chip
                          label={`${p.terminos[0].diasTotales}d - ${p.terminos[0].estado}`}
                          size="small"
                          color={p.terminos[0].estado === 'VENCIDO' ? 'error' : p.terminos[0].estado === 'CUMPLIDO' ? 'success' : 'warning'}
                        />
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {(!(proceso as any).providencias || (proceso as any).providencias.length === 0) && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>Sin providencias registradas</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Providencia</TableCell>
                  <TableCell>Días</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {((proceso as any).terminos || []).map((t: any) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.providencia?.tipoProvidencia?.nombre || '-'}</TableCell>
                    <TableCell>{t.diasTotales}</TableCell>
                    <TableCell>{new Date(t.fechaInicio).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>{new Date(t.fechaVencimiento).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.estado}
                        size="small"
                        color={t.estado === 'VENCIDO' ? 'error' : t.estado === 'CUMPLIDO' ? 'success' : 'warning'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {t.estado === 'VENCIDO' && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          startIcon={<CheckCircle />}
                          onClick={async () => {
                            await api.patch(`/terminos/${t.id}/cumplir`)
                            const r = await api.get(`/procesos/${id}`)
                            setProceso(r.data)
                          }}
                        >
                          Cumplir
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!(proceso as any).terminos || (proceso as any).terminos.length === 0) && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>Sin términos registrados</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 2 && (
          <TableContainer>
            <Table sx={{ minWidth: 450 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Descripción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {((proceso as any).actuaciones || []).map((a: any) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{new Date(a.createdAt).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>{a.user?.nombre || '-'}</TableCell>
                    <TableCell>{a.descripcion}</TableCell>
                  </TableRow>
                ))}
                {(!(proceso as any).actuaciones || (proceso as any).actuaciones.length === 0) && (
                  <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}>Sin actuaciones registradas</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 3 && (
          <TableContainer>
            <Table sx={{ minWidth: 550 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Mensaje</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {((proceso as any).notificaciones || []).map((n: any) => (
                  <TableRow key={n.id} hover>
                    <TableCell>{new Date(n.createdAt).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>{n.tipo}</TableCell>
                    <TableCell>{n.mensaje}</TableCell>
                    <TableCell>
                      <Chip label={n.leida ? 'Leída' : 'No leída'} size="small" color={n.leida ? 'success' : 'warning'} sx={{ fontWeight: 500 }} />
                    </TableCell>
                  </TableRow>
                ))}
                {(!(proceso as any).notificaciones || (proceso as any).notificaciones.length === 0) && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>Sin notificaciones</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <ProvidenciaDialog
        open={providenciaOpen}
        procesoId={Number(id)}
        onClose={() => setProvidenciaOpen(false)}
        onCreated={() => api.get(`/procesos/${id}`).then(r => setProceso(r.data))}
      />

      <GenerarOficioDialog
        open={oficioOpen}
        procesoId={Number(id)}
        juzgadoOrigenId={(proceso as any).juzgadoOrigenId}
        onClose={() => setOficioOpen(false)}
      />

      <Dialog open={cambioEtapaOpen} onClose={() => setCambioEtapaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Cambiar Etapa del Proceso</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <TextField fullWidth label="ID de la nueva etapa" value={etapaId} onChange={e => setEtapaId(e.target.value)} margin="normal" />
          <TextField fullWidth label="Descripción (opcional)" value={descripcion} onChange={e => setDescripcion(e.target.value)} margin="normal" multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCambioEtapaOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCambiarEtapa}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
