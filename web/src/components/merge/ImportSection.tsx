import { useState, useRef } from 'react'
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'
import { useMergeStore } from '@/stores/merge-store'
import type { DuplicateEntry } from '@/services/merge/import-service'

export function ImportSection() {
  const {
    isImporting,
    importPreview,
    mergeResult,
    error,
    previewImport,
    importAccountBook,
    clearPreview,
    clearError,
  } = useMergeStore()

  const [fileContent, setFileContent] = useState<string>('')
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false)
  const [conflicts, setConflicts] = useState<DuplicateEntry[]>([])
  const [conflictResolutions, setConflictResolutions] = useState<
    Record<string, 'keep-existing' | 'keep-imported' | 'keep-both'>
  >({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      setFileContent(content)
      await previewImport(content)
    } catch (error) {
      clearError()
      // Error will be set by store
    }
  }

  const handleImport = async () => {
    if (!importPreview) return

    // Check for conflicts
    const { findDuplicates } = await import('@/services/merge/import-service')
    const { getAllEntries } = await import('@/services/accounting/account-entry-service')
    const existingEntries = await getAllEntries(10000, 0)
    const detectedConflicts = findDuplicates(
      existingEntries,
      importPreview.data.accounts || []
    ).filter((d) => {
      // Only show conflicts (same date/amount/category but different details)
      return (
        d.existing.notes !== d.imported.notes ||
        d.existing.createdAt !== d.imported.createdAt
      )
    })

    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts)
      setConflictDialogOpen(true)
    } else {
      await importAccountBook({ skipDuplicates: false })
    }
  }

  const handleResolveConflicts = async () => {
    await importAccountBook({
      skipDuplicates: false,
      resolveConflicts: (duplicate) => {
        const key = `${duplicate.existing.id}-${duplicate.imported.id}`
        return conflictResolutions[key] || 'keep-existing'
      },
    })
    setConflictDialogOpen(false)
    setConflicts([])
    setConflictResolutions({})
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        导入账本
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        从JSON文件导入账本数据，支持自动去重和冲突解决
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
          accept=".json"
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
          选择JSON文件
        </Button>

        {importPreview && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={isImporting}
            fullWidth
          >
            {isImporting ? '导入中...' : '开始导入'}
          </Button>
        )}
      </Box>

      {isImporting && <LinearProgress sx={{ mt: 2 }} />}

      {/* Conflict Resolution Dialog */}
      <Dialog open={conflictDialogOpen} onClose={() => setConflictDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>解决合并冲突</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            检测到 {conflicts.length} 个冲突，请选择处理方式：
          </Typography>
          <List>
            {conflicts.map((conflict, index) => {
              const key = `${conflict.existing.id}-${conflict.imported.id}`
              const resolution = conflictResolutions[key] || 'keep-existing'

              return (
                <ListItem key={index}>
                  <ListItemText
                    primary={`冲突 ${index + 1}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          现有: {conflict.existing.date} - ¥{conflict.existing.amount} - {conflict.existing.category}
                          {conflict.existing.notes && ` (${conflict.existing.notes})`}
                        </Typography>
                        <Typography variant="body2">
                          导入: {conflict.imported.date} - ¥{conflict.imported.amount} - {conflict.imported.category}
                          {conflict.imported.notes && ` (${conflict.imported.notes})`}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label="保留现有"
                      color={resolution === 'keep-existing' ? 'primary' : 'default'}
                      onClick={() =>
                        setConflictResolutions({ ...conflictResolutions, [key]: 'keep-existing' })
                      }
                      size="small"
                    />
                    <Chip
                      label="保留导入"
                      color={resolution === 'keep-imported' ? 'primary' : 'default'}
                      onClick={() =>
                        setConflictResolutions({ ...conflictResolutions, [key]: 'keep-imported' })
                      }
                      size="small"
                    />
                    <Chip
                      label="保留两者"
                      color={resolution === 'keep-both' ? 'primary' : 'default'}
                      onClick={() =>
                        setConflictResolutions({ ...conflictResolutions, [key]: 'keep-both' })
                      }
                      size="small"
                    />
                  </Box>
                </ListItem>
              )
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictDialogOpen(false)}>取消</Button>
          <Button onClick={handleResolveConflicts} variant="contained">
            确认导入
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
