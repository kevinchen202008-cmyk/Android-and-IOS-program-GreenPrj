/**
 * Account Entry Factory
 * Generates test data for account entries using faker-like patterns
 */

import type { AccountEntrySchema } from '@/types/schema'
import { generateId, getCurrentTimestamp } from '@/utils/database-helpers'

const CATEGORIES = ['food', 'transportation', 'shopping', 'entertainment', 'housing', 'healthcare', 'education', 'other']

export interface AccountEntryFactoryOptions {
  amount?: number
  date?: string
  category?: string
  notes?: string
  id?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Generate a random amount between min and max
 */
function randomAmount(min: number = 10, max: number = 1000): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

/**
 * Generate a random date within the last 30 days
 */
function randomDate(): string {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

/**
 * Generate a random category
 */
function randomCategory(): string {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
}

/**
 * Generate random notes
 */
function randomNotes(): string {
  const notes = [
    '午餐',
    '交通费',
    '购物',
    '娱乐',
    '房租',
    '医疗',
    '教育',
    '其他消费',
  ]
  return notes[Math.floor(Math.random() * notes.length)]
}

/**
 * Create an account entry with factory defaults or overrides
 */
export function createAccountEntry(options: AccountEntryFactoryOptions = {}): AccountEntrySchema {
  const now = getCurrentTimestamp()
  
  return {
    id: options.id || generateId(),
    amount: options.amount ?? randomAmount(),
    date: options.date || randomDate(),
    category: options.category || randomCategory(),
    notes: options.notes !== undefined ? options.notes : randomNotes(),
    createdAt: options.createdAt || now,
    updatedAt: options.updatedAt || now,
  }
}

/**
 * Create multiple account entries
 */
export function createAccountEntries(count: number, options: AccountEntryFactoryOptions = {}): AccountEntrySchema[] {
  return Array.from({ length: count }, () => createAccountEntry(options))
}

/**
 * Create account entries for a specific date range
 */
export function createAccountEntriesForDateRange(
  startDate: string,
  endDate: string,
  count: number = 10
): AccountEntrySchema[] {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const range = end - start
  
  return Array.from({ length: count }, () => {
    const randomTime = start + Math.random() * range
    const date = new Date(randomTime).toISOString()
    return createAccountEntry({ date })
  })
}

/**
 * Create account entries for a specific category
 */
export function createAccountEntriesForCategory(
  category: string,
  count: number = 10
): AccountEntrySchema[] {
  return createAccountEntries(count, { category })
}
