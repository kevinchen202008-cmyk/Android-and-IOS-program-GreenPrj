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

export function PasswordSetupForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { handleSetPassword, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await handleSetPassword(password, confirmPassword)
      // Redirect will be handled by parent component
    } catch (err) {
      // Error is handled by store
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        设置密码
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        请设置一个密码来保护您的账户数据
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
        helperText="至少6个字符，支持字母、数字、特殊字符"
        disabled={isLoading}
      />

      <TextField
        fullWidth
        label="确认密码"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        required
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading || !password || !confirmPassword}
      >
        {isLoading ? <CircularProgress size={24} /> : '设置密码'}
      </Button>
    </Box>
  )
}
