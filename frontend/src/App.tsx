import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProcesoList from './pages/ProcesoList'
import ProcesoForm from './pages/ProcesoForm'
import ProcesoDetail from './pages/ProcesoDetail'
import NotificacionesPage from './pages/NotificacionesPage'
import PendientesNotificacion from './pages/PendientesNotificacion'
import ConsecutivosPage from './pages/ConsecutivosPage'
import UsersList from './pages/UsersList'
import UserForm from './pages/UserForm'
import UserDetail from './pages/UserDetail'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/procesos" element={<ProcesoList />} />
        <Route path="/procesos/nuevo" element={<ProcesoForm />} />
        <Route path="/procesos/:id" element={<ProcesoDetail />} />
        <Route path="/procesos/:id/editar" element={<ProcesoForm />} />
        <Route path="/notificaciones" element={<NotificacionesPage />} />
        <Route path="/notificaciones/pendientes" element={<PendientesNotificacion />} />
        <Route path="/consecutivos" element={<ConsecutivosPage />} />
        <Route path="/usuarios" element={<UsersList />} />
        <Route path="/usuarios/nuevo" element={<UserForm />} />
        <Route path="/usuarios/:id" element={<UserDetail />} />
        <Route path="/usuarios/:id/editar" element={<UserForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
