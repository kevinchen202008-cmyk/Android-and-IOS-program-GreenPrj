import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useAccountingStore } from '@/stores/accounting-store'
import { useNavigate } from 'react-router-dom'

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

export function EntryList() {
  const navigate = useNavigate()
  const {
    entries,
    isLoading,
    error,
    loadEntries,
    deleteExistingEntry,
    clearError,
    hasMore,
    currentPage,
    search,
    filterByCategory,
    filterByDateRange,
    clearFilters,
    searchQuery,
    selectedCategory,
    dateRange,
  } = useAccountingStore()

  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (!searchQuery && !selectedCategory && !dateRange.start && !dateRange.end) {
      loadEntries(0)
    }
  }, [loadEntries, searchQuery, selectedCategory, dateRange])

  useEffect(() => {
    setSearchInput(searchQuery)
    setCategoryFilter(selectedCategory || '')
    setStartDate(dateRange.start || '')
    setEndDate(dateRange.end || '')
  }, [searchQuery, selectedCategory, dateRange])

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这条账目吗？')) {
      try {
        await deleteExistingEntry(id)
      } catch (err) {
        // Error handled by store
      }
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadEntries(currentPage + 1)
    }
  }

  const handleSearch = (query: string) => {
    setSearchInput(query)
    if (query.trim()) {
      search(query)
    } else {
      clearFilters()
    }
  }

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category)
    if (category) {
      filterByCategory(category)
    } else {
      clearFilters()
    }
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setCategoryFilter('')
    setStartDate('')
    setEndDate('')
    clearFilters()
  }

  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          账目列表
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/accounting/create')}
          >
            新建账目
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon fontSize="small" />
          搜索和筛选
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索金额、类别、备注..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearch('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              select
              label="类别筛选"
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              <MenuItem value="">全部类别</MenuItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="开始日期"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="结束日期"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                if (startDate && e.target.value) {
                  filterByDateRange(startDate, e.target.value)
                }
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              disabled={!searchInput && !categoryFilter && !startDate && !endDate}
            >
              清除
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {isLoading && entries.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : entries.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            暂无账目记录
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/accounting/create')}
          >
            创建第一条账目
          </Button>
        </Paper>
      ) : (
        <>
          <Paper>
            <List>
              {entries.map((entry) => (
                <ListItem
                  key={entry.id}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => navigate(`/accounting/edit/${entry.id}`)}
                        sx={{ mr: 1 }}
                        title="编辑"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(entry.id)}
                        color="error"
                        title="删除"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" component="span">
                          {formatAmount(entry.amount)}
                        </Typography>
                        <Chip
                          label={CATEGORY_LABELS[entry.category] || entry.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(entry.date)}
                        </Typography>
                        {entry.notes && (
                          <Typography variant="body2" color="text.secondary">
                            {entry.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : '加载更多'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
