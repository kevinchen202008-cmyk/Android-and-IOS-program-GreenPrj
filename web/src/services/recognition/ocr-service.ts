/**
 * OCR Service
 * Uses Tesseract.js for invoice/bill scanning and text recognition
 */

import { createWorker } from 'tesseract.js'

let worker: Tesseract.Worker | null = null

/**
 * Initialize OCR worker
 */
async function getWorker(): Promise<Tesseract.Worker> {
  if (!worker) {
    worker = await createWorker('chi_sim+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      },
    })
  }
  return worker
}

/**
 * Extract text from image using OCR
 * @param imageFile - Image file (File object or image URL)
 * @returns Recognized text
 */
export async function recognizeText(imageFile: File | string): Promise<string> {
  try {
    const ocrWorker = await getWorker()
    const { data } = await ocrWorker.recognize(imageFile)
    return data.text
  } catch (error) {
    throw new Error(`OCR识别失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Parse invoice information from OCR text
 * @param text - OCR recognized text
 * @returns Parsed invoice information
 */
export interface InvoiceInfo {
  amount?: number
  date?: string
  merchant?: string
  items?: string[]
}

export function parseInvoiceText(text: string): InvoiceInfo {
  const info: InvoiceInfo = {}

  // Extract amount (look for patterns like ¥100.50, 100.50元, etc.)
  const amountPatterns = [
    /[¥￥]\s*(\d+\.?\d*)/,
    /(\d+\.?\d*)\s*元/,
    /金额[：:]\s*(\d+\.?\d*)/,
    /总计[：:]\s*(\d+\.?\d*)/,
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

  // Extract date (look for date patterns)
  const datePatterns = [
    /(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})[日]?/,
    /(\d{1,2})[月\-/](\d{1,2})[日\-/](\d{4})/,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      let year: string, month: string, day: string
      if (match[0].includes('年')) {
        // Chinese format: 2026年1月26日
        year = match[1]
        month = match[2].padStart(2, '0')
        day = match[3].padStart(2, '0')
      } else {
        // US format: 1/26/2026
        month = match[1].padStart(2, '0')
        day = match[2].padStart(2, '0')
        year = match[3]
      }
      info.date = `${year}-${month}-${day}`
      break
    }
  }

  // Extract merchant name (look for common patterns)
  const merchantPatterns = [
    /商户[：:]\s*([^\n]+)/,
    /商店[：:]\s*([^\n]+)/,
    /^([^\n]+?)(?:\s|$)/, // First line might be merchant name
  ]

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.merchant = match[1].trim()
      break
    }
  }

  return info
}

/**
 * Recognize invoice from image file
 * @param imageFile - Image file
 * @returns Parsed invoice information
 */
export async function recognizeInvoice(imageFile: File): Promise<InvoiceInfo> {
  const text = await recognizeText(imageFile)
  return parseInvoiceText(text)
}

/**
 * Cleanup OCR worker
 */
export async function cleanupOCR(): Promise<void> {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}
