/**
 * Account Entry Service
 * Business logic for account entry operations
 */

import { accountEntryRepository } from '@/repositories/account-entry-repository'
import type { AccountEntrySchema } from '@/types/schema'
import { validateAccountEntry } from '@/utils/schema-validator'
import { logSuccess, logFailure } from '@/services/audit'

export interface CreateEntryInput {
  amount: number
  date: string // ISO 8601 format
  category: string
  notes?: string
}

export interface UpdateEntryInput {
  amount?: number
  date?: string
  category?: string
  notes?: string
}

/**
 * Validate entry input
 */
function validateEntryInput(input: CreateEntryInput): void {
  if (!input.amount || input.amount <= 0) {
    throw new Error('金额必须大于0')
  }

  if (!input.date) {
    throw new Error('日期不能为空')
  }

  // Validate ISO 8601 date
  const date = new Date(input.date)
  if (isNaN(date.getTime())) {
    throw new Error('日期格式无效')
  }

  if (!input.category || input.category.trim().length === 0) {
    throw new Error('类别不能为空')
  }
}

/**
 * Create a new account entry
 */
export async function createEntry(input: CreateEntryInput): Promise<AccountEntrySchema> {
  try {
    validateEntryInput(input)

    const entry = await accountEntryRepository.createEntry({
      amount: input.amount,
      date: input.date,
      category: input.category.trim(),
      notes: input.notes?.trim() || null,
    })

    // Validate created entry
    validateAccountEntry(entry)

    // Log operation
    await logSuccess(
      '创建账目',
      'CREATE_ENTRY',
      `创建账目: ¥${entry.amount}, ${entry.category}, ${entry.date}`
    )

    return entry
  } catch (error) {
    // Log failure
    await logFailure(
      '创建账目',
      'CREATE_ENTRY',
      `创建账目失败: ${input.amount}, ${input.category}`,
      error instanceof Error ? error.message : String(error)
    )
    throw error
  }
}

/**
 * Get account entry by ID
 */
export async function getEntryById(id: string): Promise<AccountEntrySchema | null> {
  return await accountEntryRepository.getEntryById(id)
}

/**
 * Get all account entries with pagination
 */
export async function getAllEntries(limit: number = 50, offset: number = 0): Promise<AccountEntrySchema[]> {
  return await accountEntryRepository.getAllEntries(limit, offset)
}

/**
 * Update account entry
 */
export async function updateEntry(id: string, updates: UpdateEntryInput): Promise<AccountEntrySchema> {
  // Validate updates if provided
  if (updates.amount !== undefined && updates.amount <= 0) {
    throw new Error('金额必须大于0')
  }

  if (updates.date !== undefined) {
    const date = new Date(updates.date)
    if (isNaN(date.getTime())) {
      throw new Error('日期格式无效')
    }
  }

  if (updates.category !== undefined && updates.category.trim().length === 0) {
    throw new Error('类别不能为空')
  }

  type RepoUpdates = Partial<Omit<AccountEntrySchema, 'id' | 'createdAt'>>
  const repoUpdates: RepoUpdates = {}
  if (updates.amount !== undefined) repoUpdates.amount = updates.amount
  if (updates.date !== undefined) repoUpdates.date = updates.date
  if (updates.category !== undefined) repoUpdates.category = updates.category.trim()
  if (updates.notes !== undefined) repoUpdates.notes = updates.notes.trim() || null

  try {
    const updated = await accountEntryRepository.updateEntry(id, repoUpdates)
    validateAccountEntry(updated)

    // Log operation
    await logSuccess(
      '更新账目',
      'UPDATE_ENTRY',
      `更新账目 ${id}: ${JSON.stringify(updates)}`
    )

    return updated
  } catch (error) {
    // Log failure
    await logFailure(
      '更新账目',
      'UPDATE_ENTRY',
      `更新账目失败: ${id}`,
      error instanceof Error ? error.message : String(error)
    )
    throw error
  }
}

/**
 * Delete account entry
 */
export async function deleteEntry(id: string): Promise<void> {
  try {
    // Get entry info before deletion for logging
    const entry = await accountEntryRepository.getEntryById(id)
    
    await accountEntryRepository.deleteEntry(id)

    // Log operation
    if (entry) {
      await logSuccess(
        '删除账目',
        'DELETE_ENTRY',
        `删除账目: ¥${entry.amount}, ${entry.category}, ${entry.date}`
      )
    }
  } catch (error) {
    // Log failure
    await logFailure(
      '删除账目',
      'DELETE_ENTRY',
      `删除账目失败: ${id}`,
      error instanceof Error ? error.message : String(error)
    )
    throw error
  }
}

/**
 * Search entries
 */
export async function searchEntries(query: string): Promise<AccountEntrySchema[]> {
  if (!query || query.trim().length === 0) {
    return await getAllEntries()
  }
  return await accountEntryRepository.searchEntries(query.trim())
}

/**
 * Filter entries by category
 */
export async function filterByCategory(category: string): Promise<AccountEntrySchema[]> {
  return await accountEntryRepository.filterByCategory(category)
}

/**
 * Filter entries by date range
 */
export async function filterByDateRange(startDate: string, endDate: string): Promise<AccountEntrySchema[]> {
  return await accountEntryRepository.filterByDateRange(startDate, endDate)
}
