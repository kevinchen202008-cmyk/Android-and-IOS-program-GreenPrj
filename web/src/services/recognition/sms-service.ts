/**
 * SMS Parsing Service
 * Parses consumption SMS messages to extract account entry information
 */

/**
 * Parse SMS text to extract account entry information
 * @param smsText - SMS message text
 * @returns Parsed account entry information
 */
export interface SMSEntryInfo {
  amount?: number
  date?: string
  merchant?: string
  category?: string
  notes?: string
}

/**
 * Common SMS patterns for consumption notifications
 */
const SMS_PATTERNS = [
  // Alipay patterns
  {
    pattern: /支付宝.*?(\d+\.?\d*)元.*?([^\n]+)/,
    extract: (match: RegExpMatchArray) => ({
      amount: parseFloat(match[1]),
      merchant: match[2]?.trim(),
    }),
  },
  // WeChat Pay patterns
  {
    pattern: /微信支付.*?(\d+\.?\d*)元.*?([^\n]+)/,
    extract: (match: RegExpMatchArray) => ({
      amount: parseFloat(match[1]),
      merchant: match[2]?.trim(),
    }),
  },
  // Bank card patterns
  {
    pattern: /尾号\d+.*?(\d+\.?\d*)元.*?([^\n]+)/,
    extract: (match: RegExpMatchArray) => ({
      amount: parseFloat(match[1]),
      merchant: match[2]?.trim(),
    }),
  },
  // Generic consumption pattern
  {
    pattern: /消费.*?(\d+\.?\d*).*?元/,
    extract: (match: RegExpMatchArray) => ({
      amount: parseFloat(match[1]),
      merchant: undefined as string | undefined,
    }),
  },
]

/**
 * Extract date from SMS text
 */
function extractDate(text: string): string | undefined {
  const datePatterns = [
    /(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})[日]?\s*(\d{1,2})[：:](\d{1,2})/,
    /(\d{1,2})[月\-/](\d{1,2})[日\-/]\s*(\d{1,2})[：:](\d{1,2})/,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      let year: string, month: string, day: string, hour: string, minute: string
      if (match[0].includes('年')) {
        year = match[1]
        month = match[2].padStart(2, '0')
        day = match[3].padStart(2, '0')
        hour = match[4].padStart(2, '0')
        minute = match[5].padStart(2, '0')
      } else {
        const now = new Date()
        year = now.getFullYear().toString()
        month = match[1].padStart(2, '0')
        day = match[2].padStart(2, '0')
        hour = match[3].padStart(2, '0')
        minute = match[4].padStart(2, '0')
      }
      return `${year}-${month}-${day}T${hour}:${minute}:00`
    }
  }

  // If no date found, use current date/time
  return new Date().toISOString()
}

/**
 * Infer category from merchant name
 */
function inferCategory(merchant: string): string {
  const merchantLower = merchant.toLowerCase()

  if (merchantLower.includes('餐厅') || merchantLower.includes('饭店') || merchantLower.includes('超市')) {
    return 'food'
  }
  if (merchantLower.includes('地铁') || merchantLower.includes('公交') || merchantLower.includes('出租车')) {
    return 'transportation'
  }
  if (merchantLower.includes('商场') || merchantLower.includes('商店')) {
    return 'shopping'
  }
  if (merchantLower.includes('电影院') || merchantLower.includes('KTV')) {
    return 'entertainment'
  }

  return 'other'
}

/**
 * Parse SMS text to extract account entry information
 * @param smsText - SMS message text
 * @returns Parsed account entry information
 */
export function parseSMSText(smsText: string): SMSEntryInfo {
  const info: SMSEntryInfo = {}

  // Try to match known patterns
  for (const { pattern, extract } of SMS_PATTERNS) {
    const match = smsText.match(pattern)
    if (match) {
      const extracted = extract(match)
      if (extracted.amount) {
        info.amount = extracted.amount
      }
      if (extracted.merchant) {
        info.merchant = extracted.merchant
        info.category = inferCategory(extracted.merchant)
      }
      break
    }
  }

  // Extract date
  info.date = extractDate(smsText) || new Date().toISOString()

  // Use SMS text as notes
  info.notes = smsText.trim()

  return info
}
