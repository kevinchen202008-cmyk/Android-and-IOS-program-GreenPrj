import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  MenuItem,
} from '@mui/material'
import { parseSMSText, type SMSEntryInfo } from '@/services/recognition/sms-service'
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

export function SMSInputForm() {
  const navigate = useNavigate()
  const { createNewEntry, isLoading, error, clearError } = useAccountingStore()

  const [smsText, setSmsText] = useState('')
  const [parsedInfo, setParsedInfo] = useState<SMSEntryInfo | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')

  const handleParse = () => {
    if (!smsText.trim()) return

    clearError()
    const info = parseSMSText(smsText)
    setParsedInfo(info)

    // Pre-fill form
    if (info.amount) {
      setAmount(info.amount.toString())
    }
    if (info.date) {
      setDate(info.date.split('T')[0])
    }
    if (info.category) {
      setCategory(info.category)
    }
    if (info.merchant) {
      setNotes(info.merchant)
    } else if (info.notes) {
      setNotes(info.notes)
    }
  }

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

      // Reset form
      setSmsText('')
      setParsedInfo(null)
      setAmount('')
      setCategory('')
      setNotes('')
    } catch (err) {
      // Error handled by store
    }
  }

  const isValid = amount && parseFloat(amount) > 0 && date && category

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        短信解析
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {/* SMS Input Section */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="粘贴消费短信"
            multiline
            rows={4}
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            placeholder="例如：支付宝向XXX支付了100.50元..."
            disabled={isLoading}
          />
          <Button
            variant="outlined"
            onClick={handleParse}
            disabled={!smsText.trim() || isLoading}
            sx={{ mt: 2 }}
          >
            解析短信
          </Button>

          {parsedInfo && (
            <Alert severity="success" sx={{ mt: 2 }}>
              解析完成！请确认信息后点击"确认入账"
            </Alert>
          )}
        </Box>

        {/* Entry Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="金额"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                onChange={(e) => setDate(e.target.value)}
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
                onChange={(e) => setCategory(e.target.value)}
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
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                disabled={isLoading}
              />
            </Grid>

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
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isLoading}
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
