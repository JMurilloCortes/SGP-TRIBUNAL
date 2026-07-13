import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Popover, Box, Typography, List, ListItem, ListItemButton,
  ListItemText, ListItemIcon, Button, Divider, Badge, IconButton,
  Chip,
} from '@mui/material'
import { Notifications as Bell, Warning, Info, TaskAlt } from '@mui/icons-material'
import api from '../services/api'
import type { Notificacion } from '../types'

const iconMap = {
  ALERTA_VENCIMIENTO: <Warning color="warning" />,
  VENCIDO: <Warning color="error" />,
  TAREA: <TaskAlt color="info" />,
  INFO: <Info color="action" />,
}

const colorMap: Record<string, 'warning' | 'error' | 'info' | 'default'> = {
  ALERTA_VENCIMIENTO: 'warning',
  VENCIDO: 'error',
  TAREA: 'info',
  INFO: 'default',
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)

  const load = useCallback(async () => {
    try {
      const res = await api.get('/notificaciones?soloNoLeidas=true')
      setNotificaciones(res.data.data)
      setNoLeidas(res.data.noLeidas)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [load])

  async function handleMarcarLeida(id: number) {
    await api.patch(`/notificaciones/${id}/leer`)
    load()
  }

  async function handleMarcarTodasLeidas() {
    await api.post('/notificaciones/leer-todas')
    load()
  }

  function handleClickNotif(n: Notificacion) {
    handleMarcarLeida(n.id)
    navigate(`/procesos/${n.procesoId}`)
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={noLeidas} color="error">
          <Bell />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: { xs: 'calc(100vw - 32px)', sm: 400 }, maxHeight: 500 } } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.2} sx={{ minHeight: 48 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>Notificaciones</Typography>
          {noLeidas > 0 && (
            <Button size="small" onClick={handleMarcarTodasLeidas} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              Marcar todas
            </Button>
          )}
        </Box>
        <Divider />
        {notificaciones.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No hay notificaciones pendientes
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ '& .MuiListItemButton-root': { px: 2 } }}>
            {notificaciones.slice(0, 10).map(n => (
              <ListItem key={n.id} disablePadding divider>
                <ListItemButton onClick={() => handleClickNotif(n)} sx={{ alignItems: 'flex-start', py: 1.2 }}>
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.3 }}>
                    {iconMap[n.tipo] || <Info />}
                  </ListItemIcon>
                  <ListItemText
                    sx={{ my: 0, minWidth: 0, overflow: 'hidden' }}
                    primary={
                      <Box display="flex" alignItems="center" gap={0.8} sx={{ flexWrap: 'nowrap', minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={n.leida ? 500 : 700} noWrap sx={{ flexShrink: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {n.proceso?.radicado}
                        </Typography>
                        <Chip label={n.tipo} size="small"
                          color={colorMap[n.tipo] || 'default'}
                          variant="outlined" sx={{ height: 20, fontSize: 10, flexShrink: 0 }}
                        />
                      </Box>
                    }
                    primaryTypographyProps={{ sx: { overflow: 'hidden' } }}
                    secondary={n.mensaje.length > 80 ? n.mensaje.substring(0, 80) + '...' : n.mensaje}
                    secondaryTypographyProps={{ fontSize: 12, sx: { wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {notificaciones.length > 10 && (
              <ListItemButton onClick={() => { navigate('/notificaciones'); setAnchorEl(null) }} sx={{ justifyContent: 'center' }}>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  Ver todas ({notificaciones.length})
                </Typography>
              </ListItemButton>
            )}
          </List>
        )}
      </Popover>
    </>
  )
}
