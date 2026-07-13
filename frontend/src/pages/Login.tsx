import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
} from '@mui/material'
import { AccountBalance } from '@mui/icons-material'
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
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #F8F6F3 0%, #EDE8F8 25%, #F8EDEB 50%, #EDF8F0 75%, #F8F6F3 100%)',
      backgroundSize: '400% 400%',
      animation: 'pastelShift 18s ease-in-out infinite',
      '@keyframes pastelShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '25%': { backgroundPosition: '100% 0%' },
        '50%': { backgroundPosition: '100% 100%' },
        '75%': { backgroundPosition: '0% 100%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 600px 400px at 10% 20%, rgba(155,142,216,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 500px 500px at 90% 30%, rgba(242,181,174,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 400px 600px at 50% 80%, rgba(139,196,168,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 300px 300px at 70% 70%, rgba(168,200,232,0.08) 0%, transparent 60%)
        `,
        animation: 'floatBlob 25s ease-in-out infinite',
      },
      '@keyframes floatBlob': {
        '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
        '33%': { transform: 'translate(2%, -2%) scale(1.02)' },
        '66%': { transform: 'translate(-1%, 1%) scale(0.98)' },
      },
    }}>
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '35%',
        height: '35%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,142,216,0.08) 0%, transparent 70%)',
        animation: 'floatBlob 20s ease-in-out infinite',
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '45%',
        height: '45%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(242,181,174,0.08) 0%, transparent 70%)',
        animation: 'floatBlob 22s ease-in-out infinite reverse',
      }} />

      <Card sx={{
        width: { xs: '94%', sm: 420 },
        borderRadius: { xs: 4, sm: 6 },
        boxShadow: '0 25px 60px rgba(155,142,216,0.2), 0 8px 20px rgba(155,142,216,0.1), 0 0 0 1px rgba(155,142,216,0.06)',
        position: 'relative',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        overflow: 'visible',
        zIndex: 1,
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 4, sm: 5 },
          pb: 1,
          position: 'relative',
        }}>
          <Box sx={{
            width: { xs: 64, sm: 80 },
            height: { xs: 64, sm: 80 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #9B8ED8 0%, #B8ADE8 50%, #C8BFF0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 2, sm: 2.5 },
            boxShadow: '0 8px 30px rgba(155,142,216,0.35), 0 0 0 3px rgba(255,255,255,0.8)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.05) rotate(-3deg)' },
          }}>
            <AccountBalance sx={{ fontSize: { xs: 30, sm: 38 }, color: '#FFFFFF' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} sx={{
              background: 'linear-gradient(135deg, #2D2B3D 0%, #9B8ED8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              SGP Tribunal
            </Typography>
            <Typography variant="caption" sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              mt: 0.5,
              color: '#6E6B7B',
              fontWeight: 500,
            }}>
              Administrativo del Chocó
            </Typography>
          </Box>
        </Box>
        <CardContent sx={{ px: { xs: 2.5, sm: 4 }, pb: { xs: 3, sm: 4 } }}>
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
              sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2 }}
            >
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
