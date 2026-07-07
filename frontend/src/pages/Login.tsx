import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
} from '@mui/material'
import { Scale } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Credenciales inválidas')
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d1b4a 0%, #1a2d6e 50%, #0d1b4a 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at 30% 40%, rgba(201,151,0,0.06) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.03) 0%, transparent 50%)',
        animation: 'drift 20s ease-in-out infinite',
      },
      '@keyframes drift': {
        '0%, 100%': { transform: 'translate(0, 0)' },
        '25%': { transform: 'translate(2%, -1%)' },
        '50%': { transform: 'translate(-1%, 2%)' },
        '75%': { transform: 'translate(1%, 1%)' },
      },
    }}>
      <Card sx={{
        width: 420,
        maxWidth: '90vw',
        borderRadius: 4,
        boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.2)',
        position: 'relative',
        backdropFilter: 'blur(4px)',
        overflow: 'visible',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 4,
          pb: 1,
        }}>
          <Box sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d1b4a 0%, #1a2d6e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: '0 8px 24px rgba(13,27,74,0.3)',
          }}>
            <Scale sx={{ fontSize: 36, color: '#c99700' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="primary" sx={{ letterSpacing: '-0.02em' }}>
            SGP Tribunal
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', mt: 0.5 }}>
            Administrativo del Chocó
          </Typography>
        </Box>
        <CardContent sx={{ px: 4, pb: 4 }}>
          <Typography variant="body2" color="text.secondary" align="center" mb={3} sx={{ fontSize: '0.85rem' }}>
            Sistema de Gestión de Procesos
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              size="medium"
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              size="medium"
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              sx={{ mt: 3, py: 1.4, fontSize: '1rem', fontWeight: 700, borderRadius: 2 }}
            >
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
