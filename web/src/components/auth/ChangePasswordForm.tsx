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
import { useNavigate } from 'react-router-dom'

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { handleChangePassword, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await handleChangePassword(currentPassword, newPassword, confirmPassword)
      // Redirect to login after password change
      navigate('/login')
    } catch (err) {
      // Error is handled by store
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        修改密码
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        修改密码后需要重新登录
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="当前密码"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        margin="normal"
        required
        disabled={isLoading}
      />

      <TextField
        fullWidth
        label="新密码"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        margin="normal"
        required
        helperText="至少6个字符，支持字母、数字、特殊字符"
        disabled={isLoading}
      />

      <TextField
        fullWidth
        label="确认新密码"
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
        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
      >
        {isLoading ? <CircularProgress size={24} /> : '修改密码'}
      </Button>
    </Box>
  )
}
