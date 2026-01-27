/**
 * Data Deletion Service
 * Handles secure deletion of all account data
 */

import { getDatabase } from '@/services/database'
import { getAllEntries } from '@/services/accounting/account-entry-service'
import { getAllBudgets } from '@/services/budget/budget-service'
import { accountEntryRepository } from '@/repositories/account-entry-repository'
import { deleteBudget } from '@/repositories/budget-repository'

/**
 * Delete all account entries
 */
export async function deleteAllEntries(): Promise<void> {
  const entries = await getAllEntries(10000, 0)
  for (const entry of entries) {
    await accountEntryRepository.deleteEntry(entry.id)
  }
}

/**
 * Delete all budgets
 */
export async function deleteAllBudgets(): Promise<void> {
  const budgets = await getAllBudgets()
  for (const budget of budgets) {
    await deleteBudget(budget.id)
  }
}

/**
 * Delete all account data (entries, budgets, etc.)
 * Note: This does NOT delete password or session data
 */
export async function deleteAllData(): Promise<void> {
  await Promise.all([deleteAllEntries(), deleteAllBudgets()])
}

/**
 * Clear all data including database stores
 * WARNING: This is a destructive operation
 */
export async function clearAllData(): Promise<void> {
  const db = await getDatabase()
  
  // Clear all object stores
  const stores = ['accounts', 'budgets', 'categories']
  
  for (const storeName of stores) {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    await store.clear()
  }
}
