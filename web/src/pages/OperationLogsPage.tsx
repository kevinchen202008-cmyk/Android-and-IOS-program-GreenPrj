import { useEffect, useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import { useOperationLogStore } from '@/stores/operation-log-store'
import type { OperationType } from '@/services/audit/operation-log-service'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  CREATE_ENTRY: '创建账目',
  UPDATE_ENTRY: '更新账目',
  DELETE_ENTRY: '删除账目',
  EXPORT_DATA: '导出数据',
  IMPORT_DATA: '导入数据',
  DELETE_ALL_DATA: '删除所有数据',
  CHANGE_PASSWORD: '修改密码',
  CREATE_BUDGET: '创建预算',
  UPDATE_BUDGET: '更新预算',
  DELETE_BUDGET: '删除预算',
}

export function OperationLogsPage() {
  const {
    logs,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    filters,
    loadLogs,
    setFilter,
    clearFilters,
    checkCleanup,
    performCleanup,
    clearError,
  } = useOperationLogStore()

  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false)
  const [cleanupInfo, setCleanupInfo] = useState<{ needed: boolean; count: number; reason?: string } | null>(null)

  useEffect(() => {
    loadLogs(0)
    checkCleanup().then(setCleanupInfo)
  }, [loadLogs, checkCleanup])

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    loadLogs(page - 1) // Pagination is 1-based, but our store uses 0-based
  }

  const handleExportLogs = async () => {
    try {
      const { getAllLogs: getAllLogsService } = await import('@/services/audit/operation-log-service')
      const allLogs = await getAllLogsService(10000, 0)
      const jsonString = JSON.stringify(allLogs, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `operation_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export logs failed:', error)
    }
  }

  const handleCleanup = async () => {
    try {
      const deletedCount = await performCleanup(90)
      setCleanupDialogOpen(false)
      setCleanupInfo(null)
      // Refresh cleanup check
      checkCleanup().then(setCleanupInfo)
      alert(`已清理 ${deletedCount} 条旧日志`)
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          操作日志与审计
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportLogs}
            disabled={isLoading}
          >
            导出日志
          </Button>
          {cleanupInfo?.needed && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<DeleteIcon />}
              onClick={() => setCleanupDialogOpen(true)}
            >
              清理旧日志
            </Button>
          )}
        </Box>
      </Box>

      {cleanupInfo?.needed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {cleanupInfo.reason}，建议清理90天前的旧日志
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            select
            label="操作类型"
            size="small"
            value={filters.type || ''}
            onChange={(e) => setFilter({ type: (e.target.value || null) as OperationType | null })}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">全部</MenuItem>
            {Object.entries(OPERATION_TYPE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="操作结果"
            size="small"
            value={filters.result || ''}
            onChange={(e) => setFilter({ result: (e.target.value || null) as 'success' | 'failure' | null })}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="success">成功</MenuItem>
            <MenuItem value="failure">失败</MenuItem>
          </TextField>

          <TextField
            label="开始日期"
            type="date"
            size="small"
            value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setFilter({ startDate: e.target.value ? new Date(e.target.value) : null })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="结束日期"
            type="date"
            size="small"
            value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setFilter({ endDate: e.target.value ? new Date(e.target.value) : null })}
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            size="small"
          >
            清除筛选
          </Button>
        </Box>
      </Paper>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              暂无操作日志
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>时间</TableCell>
                  <TableCell>操作</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>内容</TableCell>
                  <TableCell>结果</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                    </TableCell>
                    <TableCell>{log.operation}</TableCell>
                    <TableCell>{OPERATION_TYPE_LABELS[log.type as OperationType] || log.type}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.result === 'success' ? '成功' : '失败'}
                        color={log.result === 'success' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={Math.ceil(totalCount / pageSize)}
                page={currentPage + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </TableContainer>

      {/* Cleanup Dialog */}
      <Dialog open={cleanupDialogOpen} onClose={() => setCleanupDialogOpen(false)}>
        <DialogTitle>清理旧日志</DialogTitle>
        <DialogContent>
          <DialogContentText>
            将删除90天前的操作日志。此操作不可恢复，但不会影响最近90天的日志。
            <br />
            <br />
            当前日志总数: {cleanupInfo?.count || 0}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupDialogOpen(false)}>取消</Button>
          <Button onClick={handleCleanup} variant="contained" color="warning">
            确认清理
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
