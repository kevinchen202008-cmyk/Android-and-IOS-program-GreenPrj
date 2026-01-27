/**
 * CSV Export Service
 * Handles account book export to CSV format
 */

import { getAllEntries } from '@/services/accounting/account-entry-service'
import type { AccountEntrySchema } from '@/types/schema'

/**
 * Convert account entries to CSV format
 */
export function entriesToCSV(entries: AccountEntrySchema[]): string {
  // CSV Headers
  const headers = ['日期', '金额', '类别', '备注']
  
  // CSV Rows
  const rows = entries.map((entry) => {
    const date = new Date(entry.date).toLocaleDateString('zh-CN')
    const amount = entry.amount.toString()
    const category = entry.category
    const notes = entry.notes || ''
    
    // Escape CSV special characters (quotes, commas, newlines)
    const escapeCSV = (value: string): string => {
      if (value.includes('"') || value.includes(',') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }
    
    return [date, amount, escapeCSV(category), escapeCSV(notes)].join(',')
  })
  
  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n')
}

/**
 * Export account entries to CSV file
 */
export async function exportToCSV(): Promise<void> {
  const entries = await getAllEntries(10000, 0)
  const csvContent = entriesToCSV(entries)
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel compatibility
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `greenprj_export_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
