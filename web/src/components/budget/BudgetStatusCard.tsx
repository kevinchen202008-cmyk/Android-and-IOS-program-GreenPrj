import { Paper, Typography, Box, LinearProgress, Alert, Chip } from '@mui/material'
import { useBudgetStore } from '@/stores/budget-store'
import type { BudgetStatus } from '@/types/budget'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

interface BudgetStatusCardProps {
  status: BudgetStatus
  title: string
}

export function BudgetStatusCard({ status, title }: BudgetStatusCardProps) {
  const getStatusColor = () => {
    if (status.isExceeded) return 'error'
    if (status.isWarning) return 'warning'
    return 'success'
  }

  const getStatusIcon = () => {
    if (status.isExceeded) return <ErrorIcon />
    if (status.isWarning) return <WarningIcon />
    return <CheckCircleIcon />
  }

  const getStatusText = () => {
    if (status.isExceeded) return '已超支'
    if (status.isWarning) return '接近预算'
    return '正常'
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          size="small"
        />
      </Box>

      {status.isExceeded && (
        <Alert severity="error" sx={{ mb: 2 }}>
          已超支 ¥{Math.abs(status.remainingAmount).toFixed(2)}
        </Alert>
      )}

      {status.isWarning && !status.isExceeded && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          已使用 {status.percentageUsed.toFixed(1)}%，接近预算上限
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            预算金额
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            ¥{status.budget.amount.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            实际消费
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            ¥{status.actualAmount.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            剩余预算
          </Typography>
          <Typography
            variant="body2"
            fontWeight="bold"
            color={status.remainingAmount >= 0 ? 'success.main' : 'error.main'}
          >
            ¥{status.remainingAmount.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            使用比例
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {status.percentageUsed.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(status.percentageUsed, 100)}
          color={getStatusColor()}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
    </Paper>
  )
}
