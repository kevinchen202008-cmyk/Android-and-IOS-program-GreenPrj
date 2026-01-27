import { Paper, List, ListItem, ListItemText, Typography, Box, LinearProgress } from '@mui/material'
import { useStatisticsStore } from '@/stores/statistics-store'

const CATEGORY_LABELS: Record<string, string> = {
  food: '餐饮',
  transportation: '交通',
  shopping: '购物',
  entertainment: '娱乐',
  housing: '住房',
  healthcare: '医疗',
  education: '教育',
  other: '其他',
}

export function CategoryList() {
  const { summary } = useStatisticsStore()

  if (!summary || summary.categoryStatistics.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          暂无类别数据
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        类别统计
      </Typography>
      <List>
        {summary.categoryStatistics.map((stat, index) => (
          <ListItem key={stat.category}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">
                    {CATEGORY_LABELS[stat.category] || stat.category}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ¥{stat.total.toFixed(2)}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.percentage.toFixed(1)}% · {stat.count}笔
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.percentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
