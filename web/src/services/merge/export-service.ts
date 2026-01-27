/**
 * Export Service
 * Handles account book export to JSON format
 */

import { getAllEntries } from '@/services/accounting/account-entry-service'
import { getAllBudgets } from '@/services/budget/budget-service'
import type { ExportFormatSchema } from '@/types/schema'

const EXPORT_VERSION = '1.0.0'

/**
 * Export all account book data to JSON format
 */
export async function exportAccountBook(): Promise<ExportFormatSchema> {
  // Get all data
  const accounts = await getAllEntries(10000, 0)
  const budgets = await getAllBudgets()
  
  // Categories are predefined, so we'll export them as well
  const categories = [
    { id: 'food', name: '餐饮', createdAt: new Date().toISOString() },
    { id: 'transportation', name: '交通', createdAt: new Date().toISOString() },
    { id: 'shopping', name: '购物', createdAt: new Date().toISOString() },
    { id: 'entertainment', name: '娱乐', createdAt: new Date().toISOString() },
    { id: 'housing', name: '住房', createdAt: new Date().toISOString() },
    { id: 'healthcare', name: '医疗', createdAt: new Date().toISOString() },
    { id: 'education', name: '教育', createdAt: new Date().toISOString() },
    { id: 'other', name: '其他', createdAt: new Date().toISOString() },
  ]

  const exportData: ExportFormatSchema = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      accounts,
      categories,
      budgets,
      operationLogs: [], // Operation logs not implemented yet
    },
  }

  return exportData
}

/**
 * Download export data as JSON file
 */
export async function downloadExportFile(): Promise<void> {
  const exportData = await exportAccountBook()
  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `greenprj_export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
