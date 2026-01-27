import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Paper, Typography, Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'
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

const COLORS = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#0288d1', '#7b1fa2', '#c2185b', '#5d4037']

export function CategoryChart() {
  const { summary } = useStatisticsStore()
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')

  const chartData = useMemo(() => {
    if (!summary) return []

    return summary.categoryStatistics.map((stat) => ({
      name: CATEGORY_LABELS[stat.category] || stat.category,
      value: stat.total,
      percentage: stat.percentage,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">类别分布</Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(_, value) => value && setChartType(value)}
          size="small"
        >
          <ToggleButton value="pie">饼图</ToggleButton>
          <ToggleButton value="bar">柱状图</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ width: '100%', height: 400, mt: 2 }}>
        <ResponsiveContainer>
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `¥${value.toFixed(2)} (${props.payload.percentage.toFixed(1)}%)`,
                  name,
                ]}
              />
            </PieChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `¥${value.toFixed(2)} (${props.payload.percentage.toFixed(1)}%)`,
                  '消费金额',
                ]}
              />
              <Legend />
              <Bar dataKey="value" fill="#1976d2" name="消费金额">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
