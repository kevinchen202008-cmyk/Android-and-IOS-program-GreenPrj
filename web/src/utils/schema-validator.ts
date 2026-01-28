/**
 * Schema Validation Utilities
 * Validates JSON data against schema definitions
 */

import {
  AccountEntrySchema,
  CategorySchema,
  BudgetSchema,
  OperationLogSchema,
  ExportFormatSchema,
} from '@/types/schema'
import { isValidISODate } from './database-helpers'

/**
 * Validation Error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Validate AccountEntrySchema
 */
export function validateAccountEntry(data: unknown): AccountEntrySchema {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('AccountEntry must be an object')
  }

  const entry = data as Record<string, unknown>

  // Validate id
  if (typeof entry.id !== 'string' || !isValidUUID(entry.id)) {
    throw new ValidationError('id must be a valid UUID', 'id', entry.id)
  }

  // Validate amount
  if (typeof entry.amount !== 'number' || entry.amount <= 0) {
    throw new ValidationError('amount must be a positive number', 'amount', entry.amount)
  }

  // Validate date
  if (typeof entry.date !== 'string' || !isValidISODate(entry.date)) {
    throw new ValidationError('date must be a valid ISO 8601 date string', 'date', entry.date)
  }

  // Validate category
  if (typeof entry.category !== 'string' || entry.category.length === 0) {
    throw new ValidationError('category must be a non-empty string', 'category', entry.category)
  }

  // Validate notes (optional)
  if (entry.notes !== undefined && entry.notes !== null && typeof entry.notes !== 'string') {
    throw new ValidationError('notes must be a string or null', 'notes', entry.notes)
  }

  // Validate createdAt
  if (typeof entry.createdAt !== 'string' || !isValidISODate(entry.createdAt)) {
    throw new ValidationError(
      'createdAt must be a valid ISO 8601 date string',
      'createdAt',
      entry.createdAt
    )
  }

  // Validate updatedAt
  if (typeof entry.updatedAt !== 'string' || !isValidISODate(entry.updatedAt)) {
    throw new ValidationError(
      'updatedAt must be a valid ISO 8601 date string',
      'updatedAt',
      entry.updatedAt
    )
  }

  return entry as unknown as AccountEntrySchema
}

/**
 * Validate CategorySchema
 */
export function validateCategory(data: unknown): CategorySchema {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('Category must be an object')
  }

  const category = data as Record<string, unknown>

  // Validate id
  if (typeof category.id !== 'string' || !isValidUUID(category.id)) {
    throw new ValidationError('id must be a valid UUID', 'id', category.id)
  }

  // Validate name
  if (typeof category.name !== 'string' || category.name.length === 0) {
    throw new ValidationError('name must be a non-empty string', 'name', category.name)
  }

  // Validate icon (optional)
  if (
    category.icon !== undefined &&
    category.icon !== null &&
    typeof category.icon !== 'string'
  ) {
    throw new ValidationError('icon must be a string or null', 'icon', category.icon)
  }

  // Validate color (optional)
  if (
    category.color !== undefined &&
    category.color !== null &&
    typeof category.color !== 'string'
  ) {
    throw new ValidationError('color must be a string or null', 'color', category.color)
  }

  // Validate createdAt
  if (typeof category.createdAt !== 'string' || !isValidISODate(category.createdAt)) {
    throw new ValidationError(
      'createdAt must be a valid ISO 8601 date string',
      'createdAt',
      category.createdAt
    )
  }

  return category as unknown as CategorySchema
}

/**
 * Validate BudgetSchema
 */
export function validateBudget(data: unknown): BudgetSchema {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('Budget must be an object')
  }

  const budget = data as Record<string, unknown>

  // Validate id
  if (typeof budget.id !== 'string' || !isValidUUID(budget.id)) {
    throw new ValidationError('id must be a valid UUID', 'id', budget.id)
  }

  // Validate type
  if (budget.type !== 'monthly' && budget.type !== 'yearly') {
    throw new ValidationError("type must be 'monthly' or 'yearly'", 'type', budget.type)
  }

  // Validate amount
  if (typeof budget.amount !== 'number' || budget.amount <= 0) {
    throw new ValidationError('amount must be a positive number', 'amount', budget.amount)
  }

  // Validate year
  if (typeof budget.year !== 'number' || budget.year < 2000 || !Number.isInteger(budget.year)) {
    throw new ValidationError('year must be an integer >= 2000', 'year', budget.year)
  }

  // Validate month
  if (budget.type === 'monthly') {
    if (budget.month === null || budget.month === undefined) {
      throw new ValidationError('month is required for monthly budget', 'month', budget.month)
    }
    if (
      typeof budget.month !== 'number' ||
      budget.month < 1 ||
      budget.month > 12 ||
      !Number.isInteger(budget.month)
    ) {
      throw new ValidationError('month must be an integer between 1 and 12', 'month', budget.month)
    }
  } else if (budget.type === 'yearly') {
    if (budget.month !== null && budget.month !== undefined) {
      throw new ValidationError('month must be null for yearly budget', 'month', budget.month)
    }
  }

  // Validate createdAt
  if (typeof budget.createdAt !== 'string' || !isValidISODate(budget.createdAt)) {
    throw new ValidationError(
      'createdAt must be a valid ISO 8601 date string',
      'createdAt',
      budget.createdAt
    )
  }

  // Validate updatedAt
  if (typeof budget.updatedAt !== 'string' || !isValidISODate(budget.updatedAt)) {
    throw new ValidationError(
      'updatedAt must be a valid ISO 8601 date string',
      'updatedAt',
      budget.updatedAt
    )
  }

  return budget as unknown as BudgetSchema
}

/**
 * Validate OperationLogSchema
 */
export function validateOperationLog(data: unknown): OperationLogSchema {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('OperationLog must be an object')
  }

  const log = data as Record<string, unknown>

  // Validate id
  if (typeof log.id !== 'string' || !isValidUUID(log.id)) {
    throw new ValidationError('id must be a valid UUID', 'id', log.id)
  }

  // Validate operation
  if (typeof log.operation !== 'string' || log.operation.length === 0) {
    throw new ValidationError('operation must be a non-empty string', 'operation', log.operation)
  }

  // Validate type
  if (typeof log.type !== 'string' || log.type.length === 0) {
    throw new ValidationError('type must be a non-empty string', 'type', log.type)
  }

  // Validate content
  if (typeof log.content !== 'string') {
    throw new ValidationError('content must be a string', 'content', log.content)
  }

  // Validate result
  if (log.result !== 'success' && log.result !== 'failure') {
    throw new ValidationError("result must be 'success' or 'failure'", 'result', log.result)
  }

  // Validate timestamp
  if (typeof log.timestamp !== 'string' || !isValidISODate(log.timestamp)) {
    throw new ValidationError(
      'timestamp must be a valid ISO 8601 date string',
      'timestamp',
      log.timestamp
    )
  }

  return log as unknown as OperationLogSchema
}

/**
 * Validate ExportFormatSchema
 */
export function validateExportFormat(data: unknown): ExportFormatSchema {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('ExportFormat must be an object')
  }

  const exportData = data as Record<string, unknown>

  // Validate version
  if (typeof exportData.version !== 'string' || exportData.version.length === 0) {
    throw new ValidationError('version must be a non-empty string', 'version', exportData.version)
  }

  // Validate exportedAt
  if (typeof exportData.exportedAt !== 'string' || !isValidISODate(exportData.exportedAt)) {
    throw new ValidationError(
      'exportedAt must be a valid ISO 8601 date string',
      'exportedAt',
      exportData.exportedAt
    )
  }

  // Validate data
  if (typeof exportData.data !== 'object' || exportData.data === null) {
    throw new ValidationError('data must be an object', 'data', exportData.data)
  }

  const dataObj = exportData.data as Record<string, unknown>

  // Validate accounts array
  if (!Array.isArray(dataObj.accounts)) {
    throw new ValidationError('data.accounts must be an array', 'data.accounts', dataObj.accounts)
  }
  dataObj.accounts.forEach((entry, index) => {
    try {
      validateAccountEntry(entry)
    } catch (error) {
      throw new ValidationError(
        `Invalid account entry at index ${index}: ${error instanceof Error ? error.message : String(error)}`,
        `data.accounts[${index}]`,
        entry
      )
    }
  })

  // Validate categories array
  if (!Array.isArray(dataObj.categories)) {
    throw new ValidationError(
      'data.categories must be an array',
      'data.categories',
      dataObj.categories
    )
  }
  dataObj.categories.forEach((category, index) => {
    try {
      validateCategory(category)
    } catch (error) {
      throw new ValidationError(
        `Invalid category at index ${index}: ${error instanceof Error ? error.message : String(error)}`,
        `data.categories[${index}]`,
        category
      )
    }
  })

  // Validate budgets array
  if (!Array.isArray(dataObj.budgets)) {
    throw new ValidationError('data.budgets must be an array', 'data.budgets', dataObj.budgets)
  }
  dataObj.budgets.forEach((budget, index) => {
    try {
      validateBudget(budget)
    } catch (error) {
      throw new ValidationError(
        `Invalid budget at index ${index}: ${error instanceof Error ? error.message : String(error)}`,
        `data.budgets[${index}]`,
        budget
      )
    }
  })

  // Validate operationLogs array
  if (!Array.isArray(dataObj.operationLogs)) {
    throw new ValidationError(
      'data.operationLogs must be an array',
      'data.operationLogs',
      dataObj.operationLogs
    )
  }
  dataObj.operationLogs.forEach((log, index) => {
    try {
      validateOperationLog(log)
    } catch (error) {
      throw new ValidationError(
        `Invalid operation log at index ${index}: ${error instanceof Error ? error.message : String(error)}`,
        `data.operationLogs[${index}]`,
        log
      )
    }
  })

  return exportData as unknown as ExportFormatSchema
}
