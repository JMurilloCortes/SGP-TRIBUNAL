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
  Scale, ChevronLeft,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationPanel'

const drawerWidth = 270
const collapsedWidth = 72

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
    ...(user?.rol === 'ADMIN' ? [{ text: 'Usuarios', icon: <Person />, path: '/usuarios' }] : []),
  ]

  const currentWidth = isMobile ? 0 : (collapsed ? collapsedWidth : drawerWidth)

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 0 : 2, minHeight: 64 }}>
        {collapsed ? (
          <Scale sx={{ color: 'primary.main', fontSize: 32 }} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Scale sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={800} color="primary" sx={{ lineHeight: 1.2, fontSize: '1.15rem' }}>
                SGP Tribunal
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Administrativo del Chocó
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <Divider />
      <List sx={{ flex: 1, py: 1 }}>
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
                  my: 0.3,
                  borderRadius: 2,
                  position: 'relative',
                  ...(selected && {
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '25%',
                      height: '50%',
                      width: 3,
                      bgcolor: 'secondary.main',
                      borderRadius: '0 4px 4px 0',
                    },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: selected ? 600 : 400 }} />}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Divider />
      <Box sx={{ p: collapsed ? 1 : 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: '0.9rem', fontWeight: 700 }}>
          {user?.nombre?.charAt(0) || 'U'}
        </Avatar>
        {!collapsed && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{user?.nombre}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }} noWrap>{user?.rol?.toLowerCase()}</Typography>
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
            <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>SGP Tribunal</Typography>
            <NotificationBell />
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: 'secondary.main', fontSize: '0.8rem' }}>
                {user?.nombre?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}>
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{user?.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{user?.rol?.toLowerCase()}</Typography>
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
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ width: currentWidth, flexShrink: 0, transition: 'width 0.25s ease' }}>
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: currentWidth,
              boxSizing: 'border-box',
              transition: 'width 0.25s ease',
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
            <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1, opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>
              Sistema de Gestión de Procesos
            </Typography>
            <NotificationBell />
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.85rem', fontWeight: 700 }}>
                {user?.nombre?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}>
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{user?.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{user?.rol?.toLowerCase()}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logout() }}>
                <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flex: 1, p: 3, bgcolor: 'background.default', overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
