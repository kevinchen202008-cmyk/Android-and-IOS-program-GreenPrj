import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export function EditEntryForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { entries, updateExistingEntry, isLoading, error, clearError, loadEntries } = useAccountingStore()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
\n+    let isCancelled = false\n+\n+    const loadEntry = async () => {\n+      try {\n+        // Load entries into the store\n+        await loadEntries(0)\n+        if (isCancelled) return\n+\n+        const { entries: currentEntries } = useAccountingStore.getState()\n+        const entry = currentEntries.find((e) => e.id === id)\n+\n+        if (entry) {\n+          setAmount(entry.amount.toString())\n+          setDate(entry.date.split('T')[0])\n+          setCategory(entry.category)\n+          setNotes(entry.notes || '')\n+          setLoading(false)\n+        } else {\n+          setLoading(false)\n+          // Entry not found, redirect to list\n+          navigate('/accounting')\n+        }\n+      } catch {\n+        if (!isCancelled) {\n+          setLoading(false)\n+        }\n+      }\n+    }\n+\n+    loadEntry()\n+\n+    return () => {\n+      isCancelled = true\n+    }\n+  }, [id, loadEntries, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!id) return

    try {
      await updateExistingEntry(id, {
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        category,
        notes: notes || undefined,
      })
      navigate('/accounting')
    } catch (err) {
      // Error is handled by store
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const isValid = amount && parseFloat(amount) > 0 && date && category

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        编辑账目
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
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
                  取消
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : '保存'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}
