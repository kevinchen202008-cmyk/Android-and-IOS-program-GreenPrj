import { Paper, Typography, Button, Box, Alert } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { useMergeStore } from '@/stores/merge-store'

export function ExportSection() {
  const { isExporting, error, exportAccountBook, clearError } = useMergeStore()

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        导出账本
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        导出所有账目、预算和设置数据为JSON格式，可用于备份或导入到其他设备
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={exportAccountBook}
        disabled={isExporting}
        fullWidth
      >
        {isExporting ? '导出中...' : '导出账本'}
      </Button>
    </Paper>
  )
}
