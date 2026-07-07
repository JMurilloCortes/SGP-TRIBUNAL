import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid, Paper, Typography, Box, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material'
import { Gavel, HourglassEmpty, Warning, CheckCircle } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import type { Proceso } from '../types'

interface Stats {
  total: number
  activos: number
  vencidos: number
  porVencer: number
  archivados: number
  proximos: Proceso[]
}

const colorMap: Record<string, { label: string; color: string }> = {
  VERDE: { label: 'Al día', color: '#2e7d32' },
  AMARILLO: { label: 'Próximo a vencer', color: '#ed6c02' },
  NARANJA: { label: 'Por vencer', color: '#e65100' },
  ROJO: { label: 'Vencido', color: '#d32f2f' },
  GRIS: { label: 'Archivado', color: '#757575' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>

  const cards = [
    { title: 'Procesos Activos', value: stats?.activos ?? 0, icon: <Gavel sx={{ fontSize: 40 }} />, color: '#1976d2' },
    { title: 'Por Vencer', value: stats?.porVencer ?? 0, icon: <HourglassEmpty sx={{ fontSize: 40 }} />, color: '#ed6c02' },
    { title: 'Vencidos', value: stats?.vencidos ?? 0, icon: <Warning sx={{ fontSize: 40 }} />, color: '#d32f2f' },
    { title: 'Archivados', value: stats?.archivados ?? 0, icon: <CheckCircle sx={{ fontSize: 40 }} />, color: '#2e7d32' },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Bienvenido, {user?.nombre} | {user?.rol === 'ADMIN' ? 'Administrador' : 'Escribiente'}
        {stats && <span> | Total procesos: {stats.total}</span>}
      </Typography>

      <Grid container spacing={3} mb={3}>
        {cards.map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: card.color }}>{card.icon}</Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.title}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Próximos a vencer</Typography>
        {stats?.proximos && stats.proximos.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Radicado</TableCell>
                  <TableCell>Demandante</TableCell>
                  <TableCell>Clase</TableCell>
                  <TableCell>Etapa</TableCell>
                  <TableCell>Vence</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.proximos.map(p => (
                  <TableRow key={p.id} hover onClick={() => navigate(`/procesos/${p.id}`)} sx={{ cursor: 'pointer' }}>
                    <TableCell><Typography fontWeight="medium">{p.radicado}</Typography></TableCell>
                    <TableCell>{p.demandante}</TableCell>
                    <TableCell>{p.claseProceso?.nombre}</TableCell>
                    <TableCell>{p.etapaActual?.nombre}</TableCell>
                    <TableCell>
                      {p.terminos?.[0]?.fechaVencimiento
                        ? new Date(p.terminos[0].fechaVencimiento).toLocaleDateString('es-CO')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={colorMap[p.colorEstado]?.label || p.colorEstado}
                        sx={{ bgcolor: colorMap[p.colorEstado]?.color || '#757575', color: '#fff' }}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay procesos próximos a vencer.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}
