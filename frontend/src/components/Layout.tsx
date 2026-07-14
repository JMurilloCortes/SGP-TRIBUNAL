import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, AppBar, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
  Avatar, Menu, MenuItem, Divider, useMediaQuery, useTheme,
} from '@mui/material'
import {
  Menu as MenuIcon, Dashboard, Gavel, Logout,
  Person, AddCircle, Notifications as NotificationsIcon, GridOn,
  AccountBalance, ChevronLeft, GavelOutlined, Balance,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationPanel'

const drawerWidth = 270
const collapsedWidth = 72

const rolLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  NOTIFICADOR: 'Notificador',
  ESCRIBIENTE: 'Escribiente',
  CONTADOR_LIQUIDADOR: 'Contador Liquidador',
  PROFESIONAL: 'Profesional Universitario',
  SECRETARIO: 'Secretario General',
  OFICIAL_MAYOR: 'Oficial Mayor',
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    ...(user?.rol === 'NOTIFICADOR'
      ? [{ text: 'Pendientes', icon: <NotificationsIcon />, path: '/notificaciones/pendientes' }]
      : [
          { text: 'Registrar Proceso', icon: <AddCircle />, path: '/procesos/nuevo' },
          { text: 'Procesos', icon: <Gavel />, path: '/procesos' },
        ]),
    { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/notificaciones' },
    { text: 'Consecutivos', icon: <GridOn />, path: '/consecutivos' },
    ...(user?.rol === 'ADMIN' ? [
      { text: 'Usuarios', icon: <Person />, path: '/usuarios' },
      { text: 'Despachos', icon: <AccountBalance />, path: '/despachos' },
      { text: 'Juzgados', icon: <Balance />, path: '/juzgados' },
      { text: 'Tipos Providencia', icon: <GavelOutlined />, path: '/tipos-providencia' },
    ] : []),
  ]

  const currentWidth = isMobile ? 0 : (collapsed ? collapsedWidth : drawerWidth)

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        px: collapsed ? 0 : 2.5,
        minHeight: 72,
        background: 'linear-gradient(135deg, rgba(155,142,216,0.04) 0%, rgba(242,181,174,0.04) 100%)',
        borderBottom: '1px solid rgba(155,142,216,0.06)',
      }}>
        {collapsed ? (
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(155,142,216,0.3)',
          }}>
            <AccountBalance sx={{ color: '#fff', fontSize: 26 }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(155,142,216,0.3)',
            }}>
              <AccountBalance sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{
                lineHeight: 1.2,
                fontSize: '1.15rem',
                background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                SGP Tribunal
              </Typography>
              <Typography variant="caption" sx={{
                fontSize: '0.6rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#6E6B7B',
                fontWeight: 500,
              }}>
                Administrativo del Chocó
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <Divider />
      <List sx={{ flex: 1, py: 1.5 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={selected}
                onClick={() => { navigate(item.path); setMobileOpen(false) }}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: collapsed ? 1 : 2,
                  mx: 1,
                  my: 0.4,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  ...(selected && {
                    background: 'linear-gradient(135deg, rgba(155,142,216,0.1) 0%, rgba(155,142,216,0.04) 100%)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      height: '60%',
                      width: 3.5,
                      background: 'linear-gradient(180deg, #9B8ED8 0%, #B8ADE8 100%)',
                      borderRadius: '0 4px 4px 0',
                      boxShadow: '0 0 12px rgba(155,142,216,0.4)',
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(155,142,216,0.14) 0%, rgba(155,142,216,0.06) 100%)',
                    },
                  }),
                  ...(!selected && {
                    '&:hover': {
                      background: 'rgba(155,142,216,0.06)',
                      '& .MuiListItemIcon-root': { color: '#9B8ED8' },
                    },
                  }),
                }}
              >
                <ListItemIcon sx={{
                  minWidth: collapsed ? 0 : 40,
                  justifyContent: 'center',
                  color: selected ? '#9B8ED8' : undefined,
                  transition: 'color 0.2s ease',
                }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: selected ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Divider />
      <Box sx={{
        p: collapsed ? 1.5 : 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        background: 'linear-gradient(135deg, rgba(242,181,174,0.04) 0%, rgba(155,142,216,0.04) 100%)',
      }}>
        <Avatar sx={{
          width: 38,
          height: 38,
          background: 'linear-gradient(135deg, #F2B5AE 0%, #F8D0CC 100%)',
          color: '#2D2B3D',
          fontSize: '0.9rem',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(242,181,174,0.3)',
        }}>
          {user?.nombre?.charAt(0) || 'U'}
        </Avatar>
        {!collapsed && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#2D2B3D' }}>{user?.nombre}</Typography>
            <Typography variant="caption" sx={{ color: '#6E6B7B', fontWeight: 500 }} noWrap>{rolLabels[user?.rol || ''] || user?.rol}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={700} sx={{
              flexGrow: 1,
              background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              SGP Tribunal
            </Typography>
            <NotificationBell />
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
              <Avatar sx={{
                width: 30,
                height: 30,
                background: 'linear-gradient(135deg, #F2B5AE 0%, #F8D0CC 100%)',
                color: '#2D2B3D',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                {user?.nombre?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}>
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{user?.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary" >{rolLabels[user?.rol || ''] || user?.rol}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logout() }}>
                <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
        >
          {drawerContent}
        </Drawer>
        <Box component="main" sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: '100%',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ width: currentWidth, flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: currentWidth,
              boxSizing: 'border-box',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setCollapsed(!collapsed)} sx={{ mr: 1 }}>
              {collapsed ? <MenuIcon /> : <ChevronLeft />}
            </IconButton>
            <Typography variant="subtitle1" fontWeight={700} sx={{
              flexGrow: 1,
              opacity: collapsed ? 0 : 1,
              transition: 'opacity 0.25s ease',
            }}>
              Sistema de Gestión de Procesos
            </Typography>
            <NotificationBell />
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #F2B5AE 0%, #F8D0CC 100%)',
                color: '#2D2B3D',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(242,181,174,0.3)',
              }}>
                {user?.nombre?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}>
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{user?.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary" >{rolLabels[user?.rol || ''] || user?.rol}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logout() }}>
                <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{
          flex: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: 'background.default',
          overflow: 'auto',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
