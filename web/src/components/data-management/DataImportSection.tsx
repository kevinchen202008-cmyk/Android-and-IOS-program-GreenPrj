import { useState, useRef } from 'react'
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
} from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'
import { useMergeStore } from '@/stores/merge-store'
import { importFromCSV } from '@/services/data-management/csv-import-service'
import type { ImportMode } from '@/types/data-management'

interface DataImportSectionProps {
  onImportComplete?: () => void
}

export function DataImportSection({ onImportComplete }: DataImportSectionProps) {
  const {
    isImporting,
    importPreview,
    mergeResult,
    error,
    previewImport,
    importAccountBook,
    clearError,
  } = useMergeStore()

  const [fileContent, setFileContent] = useState<string>('')
  const [fileType, setFileType] = useState<'json' | 'csv' | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [importMode, setImportMode] = useState<ImportMode>('merge')
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      setFileContent(content)

      // Detect file type
      if (file.name.endsWith('.json')) {
        setFileType('json')
        await previewImport(content)
      } else if (file.name.endsWith('.csv')) {
        setFileType('csv')
        // CSV preview is simpler, just show file info
        setConfirmDialogOpen(true)
      } else {
        // Try to detect by content
        try {
          JSON.parse(content)
          setFileType('json')
          await previewImport(content)
        } catch {
          setFileType('csv')
          setConfirmDialogOpen(true)
        }
      }
    } catch (error) {
      clearError()
      setFileType(null)
    }
  }

  const handleImport = async () => {
    if (!fileContent || !fileType) return

    setIsProcessing(true)
    setImportResult(null)
    clearError()

    try {
      if (fileType === 'json') {
        await importAccountBook({ skipDuplicates: importMode === 'replace' })
        setConfirmDialogOpen(false)
      } else if (fileType === 'csv') {
        const result = await importFromCSV(fileContent)
        setImportResult({
          imported: result.imported,
          errors: result.errors,
        })
        setConfirmDialogOpen(false)
      }

      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      // Error handled by store or service
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        数据导入
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        从JSON或CSV文件导入账本数据，支持合并或替换模式
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {mergeResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            导入完成
          </Typography>
          <Typography variant="body2">
            成功导入: {mergeResult.imported} 条
            {mergeResult.duplicates > 0 && `，跳过重复: ${mergeResult.duplicates} 条`}
            {mergeResult.errors.length > 0 && `，错误: ${mergeResult.errors.length} 条`}
          </Typography>
        </Alert>
      )}

      {importResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            CSV导入完成
          </Typography>
          <Typography variant="body2">
            成功导入: {importResult.imported} 条
            {importResult.errors.length > 0 && (
              <>
                <br />
                错误: {importResult.errors.length} 条
                {importResult.errors.slice(0, 3).map((err, i) => (
                  <Box key={i} component="span" sx={{ display: 'block', fontSize: '0.875rem' }}>
                    {err}
                  </Box>
                ))}
              </>
            )}
          </Typography>
        </Alert>
      )}

      {importPreview && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            预览信息
          </Typography>
          <Typography variant="body2">
            账目: {importPreview.data.accounts?.length || 0} 条
            <br />
            预算: {importPreview.data.budgets?.length || 0} 条
            <br />
            导出时间: {new Date(importPreview.exportedAt).toLocaleString('zh-CN')}
          </Typography>
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          fullWidth
          sx={{ mb: 2 }}
        >
          选择文件（JSON或CSV）
        </Button>
      </Box>

      {(isImporting || isProcessing) && <LinearProgress sx={{ mt: 2 }} />}

      {/* Import Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>确认导入</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {fileType === 'json' && importPreview && (
              <>
                准备导入 {importPreview.data.accounts?.length || 0} 条账目和{' '}
                {importPreview.data.budgets?.length || 0} 条预算。
              </>
            )}
            {fileType === 'csv' && '准备导入CSV文件中的账目数据。'}
            <br />
            <br />
            请选择导入模式：
          </DialogContentText>
          <FormControl component="fieldset">
            <FormLabel component="legend">导入模式</FormLabel>
            <RadioGroup
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as ImportMode)}
            >
              <FormControlLabel
                value="merge"
                control={<Radio />}
                label="合并模式：将新数据与现有数据合并，自动去重"
              />
              <FormControlLabel
                value="replace"
                control={<Radio />}
                label="替换模式：跳过所有重复数据（仅导入新数据）"
              />
            </RadioGroup>
          </FormControl>
          {importMode === 'replace' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              注意：替换模式不会删除现有数据，只会跳过重复的条目
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>取消</Button>
          <Button onClick={handleImport} variant="contained" disabled={isProcessing}>
            {isProcessing ? '导入中...' : '确认导入'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
