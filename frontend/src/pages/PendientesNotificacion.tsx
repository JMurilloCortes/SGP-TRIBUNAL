import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button,
  Tabs, Tab, Chip,
} from '@mui/material'
import { Visibility, CheckCircle, History } from '@mui/icons-material'
import api from '../services/api'
import { toastSuccess, toastError } from '../services/swal'

interface ProvidedPendiente {
  id: number
  procesoId: number
  proceso?: any
  tipoProvidencia?: any
  fechaProvidencia: string
  createdAt: string
}

interface ProvidedHistorial extends ProvidedPendiente {
  fechaNotificacion: string
  terminos?: { estado: string; fechaVencimiento: string }[]
}

export default function PendientesNotificacion() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [pendientes, setPendientes] = useState<ProvidedPendiente[]>([])
  const [historial, setHistorial] = useState<ProvidedHistorial[]>([])

  const loadPendientes = useCallback(async () => {
    try {
      const r = await api.get<ProvidedPendiente[]>('/providencias/pendientes')
      setPendientes(r.data)
    } catch { /* ignore */ }
  }, [])

  const loadHistorial = useCallback(async () => {
    try {
      const r = await api.get<ProvidedHistorial[]>('/providencias/historial')
      setHistorial(r.data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadPendientes(); loadHistorial() }, [loadPendientes, loadHistorial])

  async function handleNotificar(id: number) {
    try {
      await api.patch(`/providencias/${id}/notificar`)
      setPendientes(prev => prev.filter(p => p.id !== id))
      loadHistorial()
      toastSuccess('Providencia notificada correctamente')
    } catch {
      toastError('Error al notificar la providencia')
    }
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={3} sx={{
        background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>Notificaciones</Typography>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, pt: 1 }}>
          <Tab label={`Pendientes (${pendientes.length})`} />
          <Tab label={`Historial (${historial.length})`} icon={<History />} iconPosition="start" />
        </Tabs>

        {tab === 0 && (
          <TableContainer sx={{ '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(155,142,216,0.2)', borderRadius: 3 } }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Radicado</TableCell>
                  <TableCell>Demandante</TableCell>
                  <TableCell>Demandado</TableCell>
                  <TableCell>Despacho</TableCell>
                  <TableCell>Providencia</TableCell>
                  <TableCell>Término</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendientes.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.proceso?.radicado}</TableCell>
                    <TableCell>{p.proceso?.demandante}</TableCell>
                    <TableCell>{p.proceso?.demandado}</TableCell>
                    <TableCell>{p.proceso?.despachoActual?.codigo}</TableCell>
                    <TableCell>{p.tipoProvidencia?.nombre}</TableCell>
                    <TableCell>{p.tipoProvidencia?.diasTermino} días</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => navigate(`/procesos/${p.procesoId}`)} title="Ver proceso" size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleNotificar(p.id)} color="success" title="Marcar como notificado" size="small">
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {pendientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No hay providencias pendientes de notificar</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer sx={{ '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(155,142,216,0.2)', borderRadius: 3 } }}>
            <Table sx={{ minWidth: 850 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Radicado</TableCell>
                  <TableCell>Demandante</TableCell>
                  <TableCell>Despacho</TableCell>
                  <TableCell>Providencia</TableCell>
                  <TableCell>Fecha Notificación</TableCell>
                  <TableCell>Estado Término</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historial.map(h => (
                  <TableRow key={h.id} hover>
                    <TableCell>
                      <Typography fontWeight={600} fontSize="0.85rem" color="primary">
                        {h.proceso?.radicado}
                      </Typography>
                    </TableCell>
                    <TableCell>{h.proceso?.demandante}</TableCell>
                    <TableCell>{h.proceso?.despachoActual?.codigo}</TableCell>
                    <TableCell>{h.tipoProvidencia?.nombre}</TableCell>
                    <TableCell>
                      {new Date(h.fechaNotificacion).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      {h.terminos && h.terminos.length > 0 ? (
                        <Chip
                          label={h.terminos[0].estado}
                          size="small"
                          color={h.terminos[0].estado === 'VENCIDO' ? 'error' : h.terminos[0].estado === 'CUMPLIDO' ? 'success' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Chip label="Sin término" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {h.terminos && h.terminos.length > 0
                        ? new Date(h.terminos[0].fechaVencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" onClick={() => navigate(`/procesos/${h.procesoId}`)}>
                        Ver proceso
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {historial.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No hay notificaciones realizadas</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  )
}
