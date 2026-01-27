import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Paper, Typography, Box } from '@mui/material'
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

export function TrendChart() {
  const { summary, selectedDimension } = useStatisticsStore()

  const chartData = useMemo(() => {
    if (!summary) return []

    return summary.timeStatistics.map((stat) => ({
      period: stat.period,
      total: stat.total,
      count: stat.count,
    }))
  }, [summary])

  if (!summary || chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          暂无数据
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        消费趋势
      </Typography>
      <Box sx={{ width: '100%', height: 400, mt: 2 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`¥${value.toFixed(2)}`, '消费金额']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#1976d2"
              strokeWidth={2}
              name="消费金额"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
