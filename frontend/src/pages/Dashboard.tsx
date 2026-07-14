import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar, Button,
} from '@mui/material'
import {
  FolderOpen, Verified, Timer, GppBad, ArrowForward,
  Badge, Business, MarkEmailUnread, CheckCircle,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import type { Proceso } from '../types'

const colorMap: Record<string, { label: string; color: string; bg: string }> = {
  VERDE: { label: 'Al día', color: '#2D6B3F', bg: 'rgba(139,196,168,0.15)' },
  AMARILLO: { label: 'Próximo a vencer', color: '#8A7530', bg: 'rgba(232,207,150,0.15)' },
  NARANJA: { label: 'Por vencer', color: '#8A5A30', bg: 'rgba(232,207,150,0.15)' },
  ROJO: { label: 'Vencido', color: '#8A3040', bg: 'rgba(232,168,176,0.15)' },
  GRIS: { label: 'Archivado', color: '#5A5868', bg: 'rgba(155,142,216,0.1)' },
}

interface Resumen {
  total: number
  activos: number
  porVencer: number
  vencidos: number
  archivados: number
}

interface ProcesoPendiente {
  id: number
  radicado: string
  demandante: string
  demandado: string
  colorEstado: string
  despachoActual: { nombre: string; codigo: string } | null
}

interface ProvidenciaPendiente {
  id: number
  proceso: ProcesoPendiente | null
  tipoProvidencia: { nombre: string; diasTermino: number } | null
  fechaProvidencia: string
  createdAt: string
}

const statCards = [
  {
    key: 'total', label: 'Total Procesos', icon: <FolderOpen sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 100%)',
    bg: 'rgba(155,142,216,0.08)',
    color: '#7B6FC0',
  },
  {
    key: 'activos', label: 'Activos', icon: <Verified sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #8BC4A8 0%, #A8D5BA 100%)',
    bg: 'rgba(139,196,168,0.08)',
    color: '#5A9E7A',
  },
  {
    key: 'porVencer', label: 'Por vencer', icon: <Timer sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #E8CF96 0%, #F0DDB0 100%)',
    bg: 'rgba(232,207,150,0.08)',
    color: '#C4A858',
  },
  {
    key: 'vencidos', label: 'Vencidos', icon: <GppBad sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #E8A8B0 0%, #F0C0C6 100%)',
    bg: 'rgba(232,168,176,0.08)',
    color: '#C4707A',
  },
]

const rolLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  ESCRIBIENTE: 'Escribiente',
  NOTIFICADOR: 'Notificador',
}

async function handleNotificar(id: number) {
  await api.patch(`/providencias/${id}/notificar`)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resumen, setResumen] = useState<Resumen>({ total: 0, activos: 0, porVencer: 0, vencidos: 0, archivados: 0 })
  const [proximos, setProximos] = useState<Proceso[]>([])
  const [pendientesNotificar, setPendientesNotificar] = useState(0)
  const [procesosPendientes, setProcesosPendientes] = useState<ProvidenciaPendiente[]>([])

  useEffect(() => {
    api.get('/dashboard/stats').then(r => {
      if (r.data.rol === 'NOTIFICADOR') {
        setPendientesNotificar(r.data.pendientesNotificar || 0)
        setProcesosPendientes(r.data.procesosPendientes || [])
      } else {
        setResumen({
          total: r.data.total,
          activos: r.data.activos,
          porVencer: r.data.porVencer,
          vencidos: r.data.vencidos,
          archivados: r.data.archivados,
        })
        setProximos(r.data.proximos || [])
      }
    })
  }, [])

  const isNotificador = user?.rol === 'NOTIFICADOR'

  return (
    <Box>
      <Card sx={{
        mb: 3.5,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(155,142,216,0.04) 0%, rgba(242,181,174,0.04) 100%)',
        border: '1px solid rgba(155,142,216,0.06)',
        '&:hover': { transform: 'none', boxShadow: '0 1px 3px rgba(155,142,216,0.06)' },
      }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, py: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Avatar sx={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 100%)',
            fontSize: '1.4rem',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(155,142,216,0.3)',
          }}>
            {user?.nombre?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="h5" fontWeight={700} noWrap sx={{ color: '#2D2B3D' }}>
                {user?.nombre || 'Usuario'}
              </Typography>
              <Chip
                icon={<Badge sx={{ fontSize: 14 }} />}
                label={rolLabels[user?.rol || ''] || user?.rol || '—'}
                size="small"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, rgba(155,142,216,0.12) 0%, rgba(242,181,174,0.12) 100%)',
                  color: '#2D2B3D',
                  backdropFilter: 'blur(4px)',
                }}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mt={0.6}>
              <Business sx={{ fontSize: 15, color: '#6E6B7B' }} />
              {user?.despachos && user.despachos.length > 0 ? (
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {user.despachos.map(d => (
                    <Chip
                      key={d.id}
                      label={`${d.nombre} (${d.codigo})`}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.7rem', borderColor: 'rgba(155,142,216,0.25)' }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>
                  Sin despachos asignados
                </Typography>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
              {isNotificador ? 'Panel de notificaciones pendientes' : 'Resumen general del sistema de gestión de procesos'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {isNotificador ? (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{
                borderRadius: 3, p: 0.5, background: '#FFFFFF',
                position: 'relative', overflow: 'hidden',
                '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(135deg, #E8A8B0 0%, #F0C0C6 100%)', opacity: 0.6 },
                '&::after': { content: '""', position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #E8A8B0 0%, #F0C0C6 100%)', opacity: 0.04 },
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Avatar sx={{
                    width: 54, height: 54,
                    background: 'rgba(232,168,176,0.08)', color: '#C4707A',
                    boxShadow: '0 4px 12px #C4707A20',
                  }}>
                    <MarkEmailUnread sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                      {pendientesNotificar}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Pendientes por notificar
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{
            borderRadius: 3, overflow: 'hidden',
            '&::before': { content: '""', display: 'block', height: 4, background: 'linear-gradient(90deg, #E8A8B0 0%, #F0C0C6 50%, #F2B5AE 100%)' },
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" px={3} pt={2.5} pb={1.5}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#2D2B3D' }}>
                Providencias pendientes de notificar
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} onClick={() => navigate('/pendientes-notificacion')}
                sx={{ cursor: 'pointer', color: '#9B8ED8', transition: 'color 0.2s, gap 0.2s', '&:hover': { color: '#7B6FC0', gap: 1 } }}>
                <Typography variant="body2" fontWeight={600}>Ver todas</Typography>
                <ArrowForward fontSize="small" />
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Radicado</TableCell>
                    <TableCell>Demandante</TableCell>
                    <TableCell>Despacho</TableCell>
                    <TableCell>Providencia</TableCell>
                    <TableCell>Término</TableCell>
                    <TableCell align="right">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {procesosPendientes.map(p => (
                    <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/procesos/${p.proceso?.id}`)}>
                      <TableCell>
                        <Typography fontWeight={600} fontSize="0.85rem" color="primary">{p.proceso?.radicado}</Typography>
                      </TableCell>
                      <TableCell>{p.proceso?.demandante}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{p.proceso?.despachoActual?.codigo}</Typography>
                      </TableCell>
                      <TableCell>{p.tipoProvidencia?.nombre}</TableCell>
                      <TableCell>{p.tipoProvidencia?.diasTermino} días</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          startIcon={<CheckCircle />}
                          onClick={(e) => { e.stopPropagation(); handleNotificar(p.id).then(() => window.location.reload()) }}
                        >
                          Notificar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {procesosPendientes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No hay providencias pendientes de notificar</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      ) : (
        <>
          <Grid container spacing={3} mb={4}>
            {statCards.map(s => (
              <Grid item xs={12} sm={6} md={3} key={s.key}>
                <Card sx={{
                  borderRadius: 3,
                  p: 0.5,
                  background: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: s.gradient,
                    opacity: 0.6,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: s.gradient,
                    opacity: 0.04,
                  },
                }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Avatar sx={{
                      width: 54,
                      height: 54,
                      background: s.bg,
                      color: s.color,
                      boxShadow: `0 4px 12px ${s.color}20`,
                    }}>
                      {s.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={800} color="text.primary">
                        {resumen[s.key as keyof Resumen]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {s.label}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{
            borderRadius: 3,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              display: 'block',
              height: 4,
              background: 'linear-gradient(90deg, #9B8ED8 0%, #B8ADE8 50%, #F2B5AE 100%)',
            },
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" px={3} pt={2.5} pb={1.5}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#2D2B3D' }}>
                Próximos a vencer
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                onClick={() => navigate('/procesos')}
                sx={{
                  cursor: 'pointer',
                  color: '#9B8ED8',
                  transition: 'color 0.2s, gap 0.2s',
                  '&:hover': { color: '#7B6FC0', gap: 1 },
                }}
              >
                <Typography variant="body2" fontWeight={600}>Ver todos</Typography>
                <ArrowForward fontSize="small" />
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Radicado</TableCell>
                    <TableCell>Demandante</TableCell>
                    <TableCell>Etapa</TableCell>
                    <TableCell>Despacho</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proximos.map(p => (
                    <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/procesos/${p.id}`)}>
                      <TableCell>
                        <Typography fontWeight={600} fontSize="0.85rem" color="primary">{p.radicado}</Typography>
                      </TableCell>
                      <TableCell>{p.demandante}</TableCell>
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
                    </TableRow>
                  ))}
                  {proximos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No hay procesos próximos a vencer</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  )
}
