import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, List, ListItem, ListItemButton,
  ListItemText, ListItemIcon, Button, Chip, Divider, Tabs, Tab,
} from '@mui/material'
import { Warning, Info, TaskAlt, DoneAll } from '@mui/icons-material'
import api from '../services/api'
import type { Notificacion } from '../types'

const iconMap: Record<string, React.ReactNode> = {
  ALERTA_VENCIMIENTO: <Warning color="warning" />,
  VENCIDO: <Warning color="error" />,
  TAREA: <TaskAlt color="info" />,
  INFO: <Info color="action" />,
}

const labelMap: Record<string, string> = {
  ALERTA_VENCIMIENTO: 'Próximo a vencer',
  VENCIDO: 'Vencido',
  TAREA: 'Tarea',
  INFO: 'Informativa',
}

export default function NotificacionesPage() {
  const navigate = useNavigate()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [tab, setTab] = useState(0)
  const load = useCallback(async () => {
    try {
      const res = await api.get('/notificaciones')
      setNotificaciones(res.data.data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleMarcarLeida(id: number) {
    await api.patch(`/notificaciones/${id}/leer`)
    load()
  }

  async function handleMarcarTodasLeidas() {
    await api.post('/notificaciones/leer-todas')
    load()
  }

  const filtered = tab === 0
    ? notificaciones
    : notificaciones.filter(n => !n.leida)

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Notificaciones</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Centro de notificaciones del sistema
          </Typography>
        </Box>
        <Button startIcon={<DoneAll />} onClick={handleMarcarTodasLeidas} sx={{ borderRadius: 2 }}>
          Marcar todas leídas
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label={`Todas (${notificaciones.length})`} />
          <Tab label={`Sin leer (${notificaciones.filter(n => !n.leida).length})`} />
        </Tabs>

        {filtered.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="body1" color="text.secondary">
              No hay notificaciones
            </Typography>
          </Box>
        ) : (
          <List>
            {filtered.map((n, i) => (
              <Box key={n.id}>
                {i > 0 && <Divider />}
                <ListItem
                  disablePadding
                  secondaryAction={
                    !n.leida && (
                      <Button size="small" onClick={() => handleMarcarLeida(n.id)}>
                        Leer
                      </Button>
                    )
                  }
                >
                  <ListItemButton onClick={() => { handleMarcarLeida(n.id); navigate(`/procesos/${n.procesoId}`) }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {iconMap[n.tipo] || <Info />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={n.leida ? 'normal' : 'bold'}>
                            {n.proceso?.radicado || 'Sistema'}
                          </Typography>
                          <Chip label={labelMap[n.tipo] || n.tipo} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                          {!n.leida && <Chip label="Nueva" size="small" color="primary" sx={{ height: 20, fontSize: 10 }} />}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{n.mensaje}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(n.createdAt).toLocaleString('es-CO')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  )
}
