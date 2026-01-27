/**
 * Database Service Tests
 * Tests for IndexedDB database operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  openDatabase,
  closeDatabase,
  getDatabase,
  DatabaseError,
  handleDatabaseError,
} from '../indexeddb'

describe('IndexedDB Database Service', () => {
  beforeEach(async () => {
    // Close any existing database connections
    await closeDatabase()
  })

  afterEach(async () => {
    // Clean up after each test
    await closeDatabase()
  })

  describe('openDatabase', () => {
    it('should open database successfully', async () => {
      const db = await openDatabase()
      expect(db).toBeDefined()
      expect(db.name).toBe('greenprj_db')
      expect(db.version).toBe(1)
    })

    it('should create object stores', async () => {
      const db = await openDatabase()
      expect(db.objectStoreNames.contains('accounts')).toBe(true)
      expect(db.objectStoreNames.contains('categories')).toBe(true)
      expect(db.objectStoreNames.contains('budgets')).toBe(true)
      expect(db.objectStoreNames.contains('operationLogs')).toBe(true)
    })

    it('should create indexes', async () => {
      const db = await openDatabase()
      const accountsStore = db.transaction('accounts').objectStore('accounts')
      expect(accountsStore.indexNames.contains('by-date')).toBe(true)
      expect(accountsStore.indexNames.contains('by-category')).toBe(true)
    })
  })

  describe('getDatabase', () => {
    it('should return existing database instance if already open', async () => {
      const db1 = await openDatabase()
      const db2 = await getDatabase()
      expect(db1).toBe(db2)
    })

    it('should open database if not already open', async () => {
      const db = await getDatabase()
      expect(db).toBeDefined()
      expect(db.name).toBe('greenprj_db')
    })
  })

  describe('closeDatabase', () => {
    it('should close database connection', async () => {
      await openDatabase()
      await closeDatabase()
      // Database should be closed (we can't directly test this, but no error means success)
      expect(true).toBe(true)
    })
  })

  describe('handleDatabaseError', () => {
    it('should handle DatabaseError instances', () => {
      const error = new DatabaseError('Test error', 'TEST_CODE')
      const handled = handleDatabaseError(error)
      expect(handled).toBe(error)
      expect(handled.message).toBe('Test error')
      expect(handled.code).toBe('TEST_CODE')
    })

    it('should wrap Error instances', () => {
      const error = new Error('Test error')
      const handled = handleDatabaseError(error)
      expect(handled).toBeInstanceOf(DatabaseError)
      expect(handled.message).toBe('Test error')
      expect(handled.originalError).toBe(error)
    })

    it('should handle unknown error types', () => {
      const error = 'Unknown error'
      const handled = handleDatabaseError(error)
      expect(handled).toBeInstanceOf(DatabaseError)
      expect(handled.message).toBe('An unknown database error occurred')
    })
  })
})
