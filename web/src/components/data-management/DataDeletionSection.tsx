import { useState } from 'react'
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { deleteAllData } from '@/services/data-management/data-deletion-service'
import { useAuthStore } from '@/stores/auth-store'
import { useNavigate } from 'react-router-dom'

const CONFIRMATION_PHRASE = 'DELETE'

export function DataDeletionSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleLogout } = useAuthStore()
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (confirmationText !== CONFIRMATION_PHRASE) {
      setError('确认短语不正确')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await deleteAllData()
      // Logout and redirect to setup
      handleLogout()
      navigate('/')
      // Clear all data from localStorage
      localStorage.clear()
      // Reload page to reset state
      window.location.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : '删除失败')
      setIsDeleting(false)
    }
  }

  return (
    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
      <Typography variant="h6" gutterBottom color="error">
        危险操作
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        删除所有账本数据。此操作不可恢复，请谨慎操作。
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteForeverIcon />}
        onClick={() => setDialogOpen(true)}
        fullWidth
      >
        删除所有数据
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>确认删除所有数据</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>警告：此操作不可恢复！</strong>
            <br />
            删除后，所有账目、预算和设置数据将被永久删除。
          </Alert>
          <DialogContentText sx={{ mb: 2 }}>
            为了确认您要删除所有数据，请输入确认短语 <strong>{CONFIRMATION_PHRASE}</strong>
          </DialogContentText>
          <TextField
            fullWidth
            label="确认短语"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            error={confirmationText !== '' && confirmationText !== CONFIRMATION_PHRASE}
            helperText={
              confirmationText !== '' && confirmationText !== CONFIRMATION_PHRASE
                ? '确认短语不正确'
                : '请输入 DELETE 以确认删除'
            }
            disabled={isDeleting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isDeleting}>
            取消
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={confirmationText !== CONFIRMATION_PHRASE || isDeleting}
          >
            {isDeleting ? '删除中...' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
