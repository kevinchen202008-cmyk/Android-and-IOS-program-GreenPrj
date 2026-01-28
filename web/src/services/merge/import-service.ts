/**
 * Import Service
 * Handles account book import from JSON format
 */

import { createEntry } from '@/services/accounting/account-entry-service'
import { createBudgetService } from '@/services/budget/budget-service'
import { getAllEntries } from '@/services/accounting/account-entry-service'
import type { ExportFormatSchema, AccountEntrySchema } from '@/types/schema'
import type { CreateBudgetInput } from '@/types/budget'
import { logSuccess, logFailure } from '@/services/audit'

export interface DuplicateEntry {
  existing: AccountEntrySchema
  imported: AccountEntrySchema
  similarity: number // 0-1, 1 = exact duplicate
}

export interface MergeResult {
  imported: number
  duplicates: number
  conflicts: DuplicateEntry[]
  errors: string[]
}

/**
 * Check if two entries are duplicates
 * Criteria: same date, same amount, same category
 */
export function isDuplicateEntry(
  entry1: AccountEntrySchema,
  entry2: AccountEntrySchema
): boolean {
  return (
    entry1.date === entry2.date &&
    entry1.amount === entry2.amount &&
    entry1.category === entry2.category
  )
}

/**
 * Calculate similarity between two entries (0-1)
 */
export function calculateSimilarity(
  entry1: AccountEntrySchema,
  entry2: AccountEntrySchema
): number {
  let score = 0
  let factors = 0

  // Date match (exact)
  if (entry1.date === entry2.date) {
    score += 0.4
  }
  factors += 0.4

  // Amount match (exact)
  if (entry1.amount === entry2.amount) {
    score += 0.4
  }
  factors += 0.4

  // Category match
  if (entry1.category === entry2.category) {
    score += 0.2
  }
  factors += 0.2

  return factors > 0 ? score / factors : 0
}

/**
 * Find duplicate entries
 */
export function findDuplicates(
  existingEntries: AccountEntrySchema[],
  importedEntries: AccountEntrySchema[]
): DuplicateEntry[] {
  const duplicates: DuplicateEntry[] = []

  for (const imported of importedEntries) {
    for (const existing of existingEntries) {
      if (isDuplicateEntry(existing, imported)) {
        const similarity = calculateSimilarity(existing, imported)
        duplicates.push({
          existing,
          imported,
          similarity,
        })
        break // One duplicate per imported entry
      }
    }
  }

  return duplicates
}

/**
 * Validate import data
 */
export function validateImportData(data: ExportFormatSchema): { valid: boolean; error?: string } {
  if (!data.version) {
    return { valid: false, error: '导出文件缺少版本信息' }
  }

  if (!data.exportedAt) {
    return { valid: false, error: '导出文件缺少导出时间信息' }
  }

  if (!data.data) {
    return { valid: false, error: '导出文件缺少数据内容' }
  }

  // Validate accounts
  if (data.data.accounts) {
    for (const account of data.data.accounts) {
      if (!account.id || !account.date || account.amount === undefined || !account.category) {
        return { valid: false, error: '账目数据格式不正确' }
      }
    }
  }

  // Validate budgets
  if (data.data.budgets) {
    for (const budget of data.data.budgets) {
      if (!budget.id || !budget.type || budget.amount === undefined || !budget.year) {
        return { valid: false, error: '预算数据格式不正确' }
      }
    }
  }

  return { valid: true }
}

/**
 * Import account book from JSON data
 */
export async function importAccountBook(
  data: ExportFormatSchema,
  options: {
    skipDuplicates?: boolean
    resolveConflicts?: (duplicate: DuplicateEntry) => 'keep-existing' | 'keep-imported' | 'keep-both'
  } = {}
): Promise<MergeResult> {
  const { skipDuplicates = false, resolveConflicts } = options

  // Validate data
  const validation = validateImportData(data)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const result: MergeResult = {
    imported: 0,
    duplicates: 0,
    conflicts: [],
    errors: [],
  }

  // Get existing entries
  const existingEntries = await getAllEntries(10000, 0)

  // Process accounts
  if (data.data.accounts && data.data.accounts.length > 0) {
    // Find duplicates
    const duplicates = findDuplicates(existingEntries, data.data.accounts)

    for (const entry of data.data.accounts) {
      // Check if it's a duplicate
      const duplicate = duplicates.find((d) => d.imported.id === entry.id)

      if (duplicate) {
        if (skipDuplicates) {
          result.duplicates++
          continue
        }

        // Check if it's a conflict (same date/amount/category but different details)
        const isConflict =
          duplicate.existing.notes !== entry.notes ||
          duplicate.existing.createdAt !== entry.createdAt

        if (isConflict) {
          result.conflicts.push(duplicate)
          
          // Resolve conflict if handler provided
          if (resolveConflicts) {
            const resolution = resolveConflicts(duplicate)
            if (resolution === 'keep-imported') {
              try {
                // Delete existing entry first, then create imported entry
                const { deleteEntry } = await import('@/services/accounting/account-entry-service')
                await deleteEntry(duplicate.existing.id)
                await createEntry({
                  amount: entry.amount,
                  date: entry.date,
                  category: entry.category,
                  notes: entry.notes ?? undefined,
                })
                result.imported++
              } catch (error) {
                result.errors.push(`导入账目失败: ${error}`)
              }
            } else if (resolution === 'keep-both') {
              // Create imported entry (keep both existing and imported)
              try {
                await createEntry({
                  amount: entry.amount,
                  date: entry.date,
                  category: entry.category,
                  notes: entry.notes ?? undefined,
                })
                result.imported++
              } catch (error) {
                result.errors.push(`导入账目失败: ${error}`)
              }
            } else {
              // keep-existing: do nothing
              result.duplicates++
            }
          } else {
            // No conflict resolver, skip
            result.duplicates++
          }
        } else {
          // Exact duplicate, skip
          result.duplicates++
        }
      } else {
        // Not a duplicate, import
        try {
          await createEntry({
            amount: entry.amount,
            date: entry.date,
            category: entry.category,
            notes: entry.notes ?? undefined,
          })
          result.imported++
        } catch (error) {
          result.errors.push(`导入账目失败: ${error}`)
        }
      }
    }
  }

  // Process budgets
  if (data.data.budgets && data.data.budgets.length > 0) {
    for (const budget of data.data.budgets) {
      try {
        const budgetInput: CreateBudgetInput = {
          type: budget.type,
          year: budget.year,
          month: budget.month || undefined,
          amount: budget.amount,
        }
        await createBudgetService(budgetInput)
      } catch (error) {
        // Budget might already exist, skip error
        result.errors.push(`导入预算失败: ${error}`)
      }
    }
  }

  // Log operation
  if (result.errors.length === 0) {
    await logSuccess(
      '导入数据',
      'IMPORT_DATA',
      `导入账本数据: ${result.imported}条账目, ${result.duplicates}条重复, ${data.data.budgets?.length || 0}条预算`
    )
  } else {
    await logFailure(
      '导入数据',
      'IMPORT_DATA',
      `导入账本数据部分失败: ${result.imported}条成功, ${result.errors.length}条错误`,
      result.errors.join('; ')
    )
  }

  return result
}

/**
 * Parse JSON file content
 */
export function parseImportFile(content: string): ExportFormatSchema {
  try {
    const data = JSON.parse(content)
    return data as ExportFormatSchema
  } catch (error) {
    throw new Error('JSON文件格式不正确')
  }
}
