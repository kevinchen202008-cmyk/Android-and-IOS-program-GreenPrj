import { useState, useRef } from 'react'
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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { recognizeInvoice, type InvoiceInfo } from '@/services/recognition/ocr-service'
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

export function InvoiceScanForm() {
  const navigate = useNavigate()
  const { createNewEntry, isLoading, error, clearError } = useAccountingStore()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [recognizedInfo, setRecognizedInfo] = useState<InvoiceInfo | null>(null)
  const [recognizing, setRecognizing] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setRecognizedInfo(null)
    }
  }

  const handleRecognize = async () => {
    if (!imageFile) return

    setRecognizing(true)
    clearError()

    try {
      const info = await recognizeInvoice(imageFile)
      setRecognizedInfo(info)

      // Pre-fill form with recognized information
      if (info.amount) {
        setAmount(info.amount.toString())
      }
      if (info.date) {
        setDate(info.date)
      }
      if (info.merchant) {
        setNotes(info.merchant)
      }
    } catch (err) {
      // Error handled by service
    } finally {
      setRecognizing(false)
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
      setImageFile(null)
      setImagePreview(null)
      setRecognizedInfo(null)
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
        发票扫描
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {/* Image Upload Section */}
        <Box sx={{ mb: 3 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={recognizing || isLoading}
          >
            选择图片
          </Button>

          {imagePreview && (
            <Box sx={{ mt: 2 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 4 }}
              />
              <Button
                variant="contained"
                onClick={handleRecognize}
                disabled={recognizing || isLoading}
                sx={{ mt: 2 }}
              >
                {recognizing ? <CircularProgress size={24} /> : '识别发票'}
              </Button>
            </Box>
          )}

          {recognizedInfo && (
            <Alert severity="success" sx={{ mt: 2 }}>
              识别完成！请确认信息后点击"确认入账"
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
