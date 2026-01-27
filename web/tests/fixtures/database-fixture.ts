/**
 * Database Fixture
 * Provides test utilities for database setup and teardown
 */

import { getDatabase, closeDatabase } from '@/services/database'

/**
 * Setup: Clear all data from database
 */
export async function clearDatabase(): Promise<void> {
  const db = await getDatabase()
  const stores = ['accounts', 'categories', 'budgets', 'operationLogs', 'settings']
  
  for (const storeName of stores) {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    await store.clear()
  }
}

/**
 * Teardown: Close database connection
 */
export async function teardownDatabase(): Promise<void> {
  await closeDatabase()
}

/**
 * Setup: Initialize clean database for testing
 */
export async function setupTestDatabase(): Promise<void> {
  await clearDatabase()
}
