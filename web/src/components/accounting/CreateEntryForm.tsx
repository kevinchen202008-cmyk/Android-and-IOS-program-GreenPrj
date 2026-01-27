import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material'
import { useAccountingStore } from '@/stores/accounting-store'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { value: 'food', label: '餐饮' },
  { value: 'transportation', label: '交通' },
  { value: 'shopping', label: '购物' },
  { value: 'entertainment', label: '娱乐' },
  { value: 'housing', label: '住房' },
  { value: 'healthcare', label: '医疗' },
  { value: 'education', label: '教育' },
  { value: 'other', label: '其他' },
]

export function CreateEntryForm() {
  const navigate = useNavigate()
  const { createNewEntry, isLoading, error, clearError } = useAccountingStore()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await createNewEntry({
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        category,
        notes: notes || undefined,
      })

      // Show success and reset form
      setAmount('')
      setCategory('')
      setNotes('')
      setShowPreview(false)

      // Option to navigate to list or stay to create another
      // For now, we'll stay on the form
    } catch (err) {
      // Error is handled by store
    }
  }

  const handlePreview = () => {
    if (amount && date && category) {
      setShowPreview(true)
    }
  }

  const isValid = amount && parseFloat(amount) > 0 && date && category

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        手动记账
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/accounting/scan')}
          >
            发票扫描
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/accounting/voice')}
          >
            语音输入
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/accounting/sms')}
          >
            短信解析
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="金额"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setShowPreview(false)
                }}
                required
                inputProps={{ min: 0, step: 0.01 }}
                helperText="金额必须大于0"
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="日期"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setShowPreview(false)
                }}
                required
                InputLabelProps={{ shrink: true }}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="类别"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setShowPreview(false)
                }}
                required
                disabled={isLoading}
              >
                {CATEGORIES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="备注（可选）"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                  setShowPreview(false)
                }}
                multiline
                rows={3}
                disabled={isLoading}
              />
            </Grid>

            {showPreview && isValid && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    预览
                  </Typography>
                  <Typography variant="body2">
                    金额: ¥{parseFloat(amount).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    日期: {new Date(date).toLocaleDateString('zh-CN')}
                  </Typography>
                  <Typography variant="body2">
                    类别: {CATEGORIES.find((c) => c.value === category)?.label}
                  </Typography>
                  {notes && (
                    <Typography variant="body2">备注: {notes}</Typography>
                  )}
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/accounting')}
                  disabled={isLoading}
                >
                  返回列表
                </Button>
                <Button
                  variant="outlined"
                  onClick={handlePreview}
                  disabled={!isValid || isLoading}
                >
                  预览
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isLoading}
                  sx={{ minWidth: 120 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : '确认入账'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}
