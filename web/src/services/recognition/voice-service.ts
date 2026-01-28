/**
 * Voice Recognition Service
 * Uses Web Speech API for voice input recognition
 */

/**
 * Check if speech recognition is available
 */
export function isSpeechRecognitionAvailable(): boolean {
  return (
    'webkitSpeechRecognition' in window ||
    'SpeechRecognition' in window
  )
}

/**
 * Recognize speech from audio
 * @param onResult - Callback for recognition results
 * @param onError - Callback for errors
 * @returns Speech recognition instance
 */
export function startVoiceRecognition(
  onResult: (text: string) => void,
  onError: (error: string) => void
): SpeechRecognition | null {
  if (!isSpeechRecognitionAvailable()) {
    onError('浏览器不支持语音识别')
    return null
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    onError(`语音识别错误: ${event.error}`)
  }

  recognition.onend = () => {
    // Recognition ended
  }

  recognition.start()
  return recognition
}

/**
 * Stop voice recognition
 */
export function stopVoiceRecognition(recognition: SpeechRecognition | null): void {
  if (recognition) {
    recognition.stop()
  }
}

/**
 * Parse voice input to extract account entry information
 * @param text - Recognized voice text
 * @returns Parsed account entry information
 */
export interface VoiceEntryInfo {
  amount?: number
  category?: string
  notes?: string
}

export function parseVoiceText(text: string): VoiceEntryInfo {
  const info: VoiceEntryInfo = {}

  // Extract amount
  const amountPatterns = [
    /(\d+\.?\d*)\s*元/,
    /(\d+\.?\d*)\s*块/,
    /金额[：:]\s*(\d+\.?\d*)/,
    /花了\s*(\d+\.?\d*)/,
  ]

  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      const amount = parseFloat(match[1])
      if (!isNaN(amount) && amount > 0) {
        info.amount = amount
        break
      }
    }
  }

  // Extract category (common categories in Chinese)
  const categoryMap: Record<string, string> = {
    餐饮: 'food',
    吃饭: 'food',
    交通: 'transportation',
    打车: 'transportation',
    购物: 'shopping',
    买: 'shopping',
    娱乐: 'entertainment',
    电影: 'entertainment',
    住房: 'housing',
    房租: 'housing',
    医疗: 'healthcare',
    看病: 'healthcare',
    教育: 'education',
    学习: 'education',
  }

  for (const [chinese, english] of Object.entries(categoryMap)) {
    if (text.includes(chinese)) {
      info.category = english
      break
    }
  }

  // Use full text as notes if no specific parsing
  if (!info.notes) {
    info.notes = text.trim()
  }

  return info
}
