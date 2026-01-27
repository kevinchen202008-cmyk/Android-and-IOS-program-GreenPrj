/**
 * JSON Schema Type Definitions
 * Unified data format for cross-platform compatibility
 */

/**
 * Account Entry Schema
 */
export interface AccountEntrySchema {
  id: string
  amount: number
  date: string // ISO 8601 format
  category: string
  notes?: string | null
  createdAt: string // ISO 8601 format
  updatedAt: string // ISO 8601 format
}

/**
 * Category Schema
 */
export interface CategorySchema {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  createdAt: string // ISO 8601 format
}

/**
 * Budget Schema
 */
export interface BudgetSchema {
  id: string
  type: 'monthly' | 'yearly'
  amount: number
  year: number
  month?: number | null // Required for monthly, null for yearly
  createdAt: string // ISO 8601 format
  updatedAt: string // ISO 8601 format
}

/**
 * Operation Log Schema
 */
export interface OperationLogSchema {
  id: string
  operation: string
  type: string
  content: string
  result: 'success' | 'failure'
  timestamp: string // ISO 8601 format
}

/**
 * Export Format Schema
 */
export interface ExportFormatSchema {
  version: string
  exportedAt: string // ISO 8601 format
  data: {
    accounts: AccountEntrySchema[]
    categories: CategorySchema[]
    budgets: BudgetSchema[]
    operationLogs: OperationLogSchema[]
  }
}
