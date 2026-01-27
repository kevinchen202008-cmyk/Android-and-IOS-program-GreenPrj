/**
 * Unit Tests: Account Entry Service
 * Tests business logic for account entry operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createEntry,
  getEntryById,
  getAllEntries,
  updateEntry,
  deleteEntry,
  searchEntries,
  filterByCategory,
  filterByDateRange,
} from '@/services/accounting/account-entry-service'
import { setupTestDatabase, clearDatabase } from '../../fixtures/database-fixture'
import { setupAuthenticatedSession, teardownAuth } from '../../fixtures/auth-fixture'
import { createAccountEntry } from '../../factories/account-entry-factory'

describe('Account Entry Service', () => {
  beforeEach(async () => {
    await setupTestDatabase()
    await setupAuthenticatedSession()
  })

  afterEach(async () => {
    await clearDatabase()
    await teardownAuth()
  })

  describe('createEntry', () => {
    it('should create entry with valid data', async () => {
      const entry = await createEntry({
        amount: 100.50,
        date: new Date().toISOString(),
        category: 'food',
        notes: 'Test entry',
      })

      expect(entry.id).toBeDefined()
      expect(entry.amount).toBe(100.50)
      expect(entry.category).toBe('food')
      expect(entry.notes).toBe('Test entry')
    })

    it('should throw error for invalid amount', async () => {
      await expect(
        createEntry({
          amount: -10,
          date: new Date().toISOString(),
          category: 'food',
        })
      ).rejects.toThrow('金额必须大于0')
    })

    it('should throw error for missing category', async () => {
      await expect(
        createEntry({
          amount: 100,
          date: new Date().toISOString(),
          category: '',
        })
      ).rejects.toThrow('类别不能为空')
    })
  })

  describe('getEntryById', () => {
    it('should return entry by id', async () => {
      const created = await createEntry({
        amount: 100,
        date: new Date().toISOString(),
        category: 'food',
      })

      const retrieved = await getEntryById(created.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.amount).toBe(100)
    })

    it('should return null for non-existent id', async () => {
      const retrieved = await getEntryById('non-existent-id')
      expect(retrieved).toBeNull()
    })
  })

  describe('getAllEntries', () => {
    it('should return all entries with pagination', async () => {
      // Create multiple entries
      for (let i = 0; i < 5; i++) {
        await createEntry({
          amount: 100 + i,
          date: new Date().toISOString(),
          category: 'food',
        })
      }

      const entries = await getAllEntries(10, 0)
      expect(entries.length).toBe(5)
    })

    it('should respect limit', async () => {
      // Create more entries than limit
      for (let i = 0; i < 10; i++) {
        await createEntry({
          amount: 100 + i,
          date: new Date().toISOString(),
          category: 'food',
        })
      }

      const entries = await getAllEntries(5, 0)
      expect(entries.length).toBe(5)
    })
  })

  describe('updateEntry', () => {
    it('should update entry', async () => {
      const created = await createEntry({
        amount: 100,
        date: new Date().toISOString(),
        category: 'food',
      })

      const updated = await updateEntry(created.id, {
        amount: 200,
        category: 'shopping',
      })

      expect(updated.amount).toBe(200)
      expect(updated.category).toBe('shopping')
    })
  })

  describe('deleteEntry', () => {
    it('should delete entry', async () => {
      const created = await createEntry({
        amount: 100,
        date: new Date().toISOString(),
        category: 'food',
      })

      await deleteEntry(created.id)

      const retrieved = await getEntryById(created.id)
      expect(retrieved).toBeNull()
    })
  })

  describe('searchEntries', () => {
    it('should search entries by query', async () => {
      await createEntry({
        amount: 100,
        date: new Date().toISOString(),
        category: 'food',
        notes: '午餐',
      })

      const results = await searchEntries('午餐')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].notes).toContain('午餐')
    })
  })

  describe('filterByCategory', () => {
    it('should filter entries by category', async () => {
      await createEntry({
        amount: 100,
        date: new Date().toISOString(),
        category: 'food',
      })
      await createEntry({
        amount: 200,
        date: new Date().toISOString(),
        category: 'shopping',
      })

      const results = await filterByCategory('food')
      expect(results.every(e => e.category === 'food')).toBe(true)
    })
  })

  describe('filterByDateRange', () => {
    it('should filter entries by date range', async () => {
      const startDate = new Date('2026-01-01').toISOString()
      const endDate = new Date('2026-01-31').toISOString()

      await createEntry({
        amount: 100,
        date: new Date('2026-01-15').toISOString(),
        category: 'food',
      })

      const results = await filterByDateRange(startDate, endDate)
      expect(results.length).toBeGreaterThan(0)
    })
  })
})
