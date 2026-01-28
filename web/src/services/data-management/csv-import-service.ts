/**
 * CSV Import Service
 * Handles CSV file import and validation
 */

import { createEntry } from '@/services/accounting/account-entry-service'
import type { AccountEntrySchema } from '@/types/schema'

export interface CSVImportResult {
  imported: number
  errors: string[]
  skipped: number
}

/**
 * Parse CSV content
 */
export function parseCSV(content: string): string[][] {
  const lines: string[][] = []
  let currentLine: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentLine.push(currentField.trim())
      currentField = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // Line separator
      if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim())
        currentField = ''
        if (currentLine.length > 0) {
          lines.push(currentLine)
          currentLine = []
        }
      }
      // Skip \r\n combination
      if (char === '\r' && nextChar === '\n') {
        i++
      }
    } else {
      currentField += char
    }
  }

  // Add last field and line
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim())
  }
  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Validate CSV structure
 */
export function validateCSVStructure(lines: string[][]): { valid: boolean; error?: string } {
  if (lines.length === 0) {
    return { valid: false, error: 'CSV文件为空' }
  }

  // Check header
  const header = lines[0]

  if (header.length < 3) {
    return { valid: false, error: 'CSV文件格式不正确：缺少必要的列' }
  }

  // Check if headers match (flexible matching)
  const headerMap: Record<number, string> = {}
  header.forEach((h, _i) => {
    const normalized = h.trim().toLowerCase()
    if (normalized.includes('日期') || normalized.includes('date')) {
      headerMap[0] = h
    } else if (normalized.includes('金额') || normalized.includes('amount')) {
      headerMap[1] = h
    } else if (normalized.includes('类别') || normalized.includes('category')) {
      headerMap[2] = h
    } else if (normalized.includes('备注') || normalized.includes('notes')) {
      headerMap[3] = h
    }
  })

  if (!headerMap[0] || !headerMap[1] || !headerMap[2]) {
    return { valid: false, error: 'CSV文件格式不正确：缺少必要的列（日期、金额、类别）' }
  }

  return { valid: true }
}

/**
 * Convert CSV row to account entry
 */
function csvRowToEntry(row: string[], headerMap: Record<number, number>): {
  valid: boolean
  entry?: Omit<AccountEntrySchema, 'id' | 'createdAt' | 'updatedAt'>
  error?: string
} {
  const dateIndex = headerMap[0]
  const amountIndex = headerMap[1]
  const categoryIndex = headerMap[2]
  const notesIndex = headerMap[3]

  if (dateIndex === undefined || amountIndex === undefined || categoryIndex === undefined) {
    return { valid: false, error: '缺少必要的列' }
  }

  // Parse date
  const dateStr = row[dateIndex]?.trim()
  if (!dateStr) {
    return { valid: false, error: '日期不能为空' }
  }

  // Try to parse date (support multiple formats)
  let date: Date
  try {
    // Try ISO 8601 first
    date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      // Try Chinese date format (YYYY/MM/DD or YYYY-MM-DD)
      const dateMatch = dateStr.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
      if (dateMatch) {
        date = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]))
      } else {
        return { valid: false, error: `日期格式无效: ${dateStr}` }
      }
    }
  } catch {
    return { valid: false, error: `日期格式无效: ${dateStr}` }
  }

  if (isNaN(date.getTime())) {
    return { valid: false, error: `日期格式无效: ${dateStr}` }
  }

  // Parse amount
  const amountStr = row[amountIndex]?.trim()
  if (!amountStr) {
    return { valid: false, error: '金额不能为空' }
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: `金额无效: ${amountStr}` }
  }

  // Parse category
  const category = row[categoryIndex]?.trim()
  if (!category) {
    return { valid: false, error: '类别不能为空' }
  }

  // Parse notes (optional)
  const notes = notesIndex !== undefined ? row[notesIndex]?.trim() || null : null

  return {
    valid: true,
    entry: {
      amount,
      date: date.toISOString(),
      category,
      notes,
    },
  }
}

/**
 * Import account entries from CSV
 */
export async function importFromCSV(content: string): Promise<CSVImportResult> {
  const result: CSVImportResult = {
    imported: 0,
    errors: [],
    skipped: 0,
  }

  // Parse CSV
  const lines = parseCSV(content)
  if (lines.length === 0) {
    result.errors.push('CSV文件为空')
    return result
  }

  // Validate structure
  const validation = validateCSVStructure(lines)
  if (!validation.valid) {
    result.errors.push(validation.error || 'CSV格式验证失败')
    return result
  }

  // Build header map
  const header = lines[0]
  const headerMap: Record<number, number> = {}
  header.forEach((h, i) => {
    const normalized = h.trim().toLowerCase()
    if (normalized.includes('日期') || normalized.includes('date')) {
      headerMap[0] = i
    } else if (normalized.includes('金额') || normalized.includes('amount')) {
      headerMap[1] = i
    } else if (normalized.includes('类别') || normalized.includes('category')) {
      headerMap[2] = i
    } else if (normalized.includes('备注') || normalized.includes('notes')) {
      headerMap[3] = i
    }
  })

  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]
    
    // Skip empty rows
    if (row.every((cell) => !cell.trim())) {
      result.skipped++
      continue
    }

    const entryResult = csvRowToEntry(row, headerMap)
    if (!entryResult.valid) {
      result.errors.push(`第${i + 1}行: ${entryResult.error}`)
      continue
    }

    try {
      const e = entryResult.entry!
      await createEntry({ ...e, notes: e.notes ?? undefined })
      result.imported++
    } catch (error) {
      result.errors.push(`第${i + 1}行: 导入失败 - ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return result
}
