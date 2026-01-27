import { useState, useRef, useEffect } from 'react'
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
  IconButton,
} from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'
import StopIcon from '@mui/icons-material/Stop'
import {
  startVoiceRecognition,
  stopVoiceRecognition,
  parseVoiceText,
  isSpeechRecognitionAvailable,
  type VoiceEntryInfo,
} from '@/services/recognition/voice-service'
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

export function VoiceInputForm() {
  const navigate = useNavigate()
  const { createNewEntry, isLoading, error, clearError } = useAccountingStore()

  const [isRecording, setIsRecording] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')
  const [recognizedInfo, setRecognizedInfo] = useState<VoiceEntryInfo | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        stopVoiceRecognition(recognitionRef.current)
      }
    }
  }, [])

  const handleStartRecording = () => {
    if (!isSpeechRecognitionAvailable()) {
      alert('您的浏览器不支持语音识别功能')
      return
    }

    setIsRecording(true)
    setRecognizedText('')
    setRecognizedInfo(null)

    const recognition = startVoiceRecognition(
      (text) => {
        setRecognizedText(text)
        const info = parseVoiceText(text)
        setRecognizedInfo(info)

        // Pre-fill form
        if (info.amount) {
          setAmount(info.amount.toString())
        }
        if (info.category) {
          setCategory(info.category)
        }
        if (info.notes) {
          setNotes(info.notes)
        }

        setIsRecording(false)
        if (recognitionRef.current) {
          stopVoiceRecognition(recognitionRef.current)
          recognitionRef.current = null
        }
      },
      (errorMsg) => {
        alert(errorMsg)
        setIsRecording(false)
        if (recognitionRef.current) {
          stopVoiceRecognition(recognitionRef.current)
          recognitionRef.current = null
        }
      }
    )

    recognitionRef.current = recognition
  }

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      stopVoiceRecognition(recognitionRef.current)
      recognitionRef.current = null
    }
    setIsRecording(false)
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
      setRecognizedText('')
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
        语音输入
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {!isSpeechRecognitionAvailable() && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {/* Voice Recording Section */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <IconButton
            color={isRecording ? 'error' : 'primary'}
            size="large"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={!isSpeechRecognitionAvailable() || isLoading}
            sx={{ fontSize: 64, width: 100, height: 100 }}
          >
            {isRecording ? <StopIcon sx={{ fontSize: 64 }} /> : <MicIcon sx={{ fontSize: 64 }} />}
          </IconButton>
          <Typography variant="body2" sx={{ mt: 2 }}>
            {isRecording ? '正在录音...' : '点击麦克风开始录音'}
          </Typography>

          {recognizedText && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                识别结果：
              </Typography>
              <Typography variant="body1">{recognizedText}</Typography>
            </Alert>
          )}

          {recognizedInfo && (
            <Alert severity="success" sx={{ mt: 2 }}>
              已解析信息，请确认后点击"确认入账"
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
