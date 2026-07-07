import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton,
} from '@mui/material'
import { Visibility, CheckCircle } from '@mui/icons-material'
import api from '../services/api'
import type { Providencia } from '../types'

export default function PendientesNotificacion() {
  const navigate = useNavigate()
  const [providencias, setProvidencias] = useState<(Providencia & { proceso?: any })[]>([])

  useEffect(() => {
    api.get('/providencias/pendientes').then(r => setProvidencias(r.data))
  }, [])

  async function handleNotificar(id: number) {
    await api.patch(`/providencias/${id}/notificar`)
    setProvidencias(prev => prev.filter(p => p.id !== id))
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Pendientes de Notificación</Typography>

      <TableContainer component={Paper}>
        <Table>
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
            {providencias.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>{p.proceso?.radicado}</TableCell>
                <TableCell>{p.proceso?.demandante}</TableCell>
                <TableCell>{p.proceso?.demandado}</TableCell>
                <TableCell>{p.proceso?.despachoActual?.codigo}</TableCell>
                <TableCell>{p.tipoProvidencia?.nombre}</TableCell>
                <TableCell>{p.tipoProvidencia?.diasTermino} días</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/procesos/${p.procesoId}`)} title="Ver proceso">
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handleNotificar(p.id)} color="success" title="Marcar como notificado">
                    <CheckCircle />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {providencias.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay providencias pendientes de notificar</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
