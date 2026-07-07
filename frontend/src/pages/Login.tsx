import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
} from '@mui/material'
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
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
            SGP - Tribunal Administrativo del Chocó
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={3}>
            Sistema de Gestión de Procesos
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Correo electrónico" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              margin="normal" required
            />
            <TextField
              fullWidth label="Contraseña" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              margin="normal" required
            />
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 2, py: 1.5 }}>
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
