import { Paper, Typography, Button, Alert, Grid } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { useMergeStore } from '@/stores/merge-store'
import { exportToCSV } from '@/services/data-management/csv-export-service'
import { useState } from 'react'

export function DataExportSection() {
  const { isExporting, error, exportAccountBook, clearError } = useMergeStore()
  const [isExportingCSV, setIsExportingCSV] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExportJSON = async () => {
    setExportError(null)
    await exportAccountBook()
  }

  const handleExportCSV = async () => {
    setExportError(null)
    setIsExportingCSV(true)
    try {
      await exportToCSV()
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'CSV导出失败')
    } finally {
      setIsExportingCSV(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        数据导出
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        导出账本数据为JSON或CSV格式，用于备份或数据分析
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {exportError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setExportError(null)}>
          {exportError}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportJSON}
            disabled={isExporting}
            fullWidth
          >
            {isExporting ? '导出中...' : '导出JSON'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            包含所有数据（账目、预算、设置），可用于完整备份
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            fullWidth
          >
            {isExportingCSV ? '导出中...' : '导出CSV'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            仅包含账目数据，可用于Excel等表格软件分析
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}
