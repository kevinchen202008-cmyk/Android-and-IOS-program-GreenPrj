import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useAuthStore } from '@/stores/auth-store'

export function LoginForm() {
  const [password, setPassword] = useState('')
  const { handleLogin, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await handleLogin(password)
      // Redirect will be handled by parent component
    } catch (err) {
      // Error is handled by store
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        登录
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        请输入您的密码以访问账户
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="密码"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
        autoFocus
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading || !password}
      >
        {isLoading ? <CircularProgress size={24} /> : '登录'}
      </Button>
    </Box>
  )
}
