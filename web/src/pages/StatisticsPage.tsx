import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Grid,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useStatisticsStore } from '@/stores/statistics-store'
import { StatisticsSummary } from '@/components/statistics/StatisticsSummary'
import { TrendChart } from '@/components/statistics/TrendChart'
import { CategoryChart } from '@/components/statistics/CategoryChart'
import { CategoryList } from '@/components/statistics/CategoryList'
import type { TimeDimension } from '@/services/statistics/statistics-service'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export function StatisticsPage() {
  const {
    summary,
    isLoading,
    error,
    selectedDimension,
    loadStatistics,
    refreshStatistics,
    setDimension,
    clearError,
  } = useStatisticsStore()

  const [tabValue, setTabValue] = useState(0)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    loadStatistics('month')
  }, [loadStatistics])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleDimensionChange = (dimension: TimeDimension) => {
    setDimension(dimension)
  }

  const handleDateRangeFilter = () => {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    loadStatistics(selectedDimension, start, end)
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    loadStatistics(selectedDimension)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          统计与报表
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refreshStatistics}
          disabled={isLoading}
        >
          刷新
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ mb: 3 }}>
        <StatisticsSummary />
      </Box>

      {/* Time Dimension Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          时间维度
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={selectedDimension === 'day' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleDimensionChange('day')}
          >
            日
          </Button>
          <Button
            variant={selectedDimension === 'week' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleDimensionChange('week')}
          >
            周
          </Button>
          <Button
            variant={selectedDimension === 'month' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleDimensionChange('month')}
          >
            月
          </Button>
          <Button
            variant={selectedDimension === 'year' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleDimensionChange('year')}
          >
            年
          </Button>
        </Box>

        {/* Date Range Filter */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="开始日期"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="结束日期"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" size="small" onClick={handleDateRangeFilter}>
            筛选
          </Button>
          <Button variant="outlined" size="small" onClick={handleClearFilter}>
            清除
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="统计视图">
          <Tab label="趋势图表" />
          <Tab label="类别分布" />
          <Tab label="类别列表" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TrendChart />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <CategoryChart />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <CategoryList />
          )}
        </TabPanel>
      </Paper>
    </Container>
  )
}
