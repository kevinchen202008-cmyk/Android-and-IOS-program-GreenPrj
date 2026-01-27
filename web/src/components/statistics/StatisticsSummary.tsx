import { Paper, Grid, Typography, Box, Chip } from '@mui/material'
import { useStatisticsStore } from '@/stores/statistics-store'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ListIcon from '@mui/icons-material/List'

export function StatisticsSummary() {
  const { summary, isLoading } = useStatisticsStore()

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          加载中...
        </Typography>
      </Paper>
    )
  }

  if (!summary) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          暂无统计数据
        </Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="div" gutterBottom>
            ¥{summary.totalAmount.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            总消费
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ListIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="div" gutterBottom>
            {summary.totalCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            账目数量
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="div" gutterBottom>
            ¥{summary.averageAmount.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            平均消费
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  )
}
