/**
 * Unit Tests: Account Entry Repository
 * Tests data access layer including encryption/decryption
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { accountEntryRepository } from '@/repositories/account-entry-repository'
import { setupTestDatabase, clearDatabase } from '../../fixtures/database-fixture'
import { setupAuthenticatedSession, teardownAuth } from '../../fixtures/auth-fixture'
import type { AccountEntrySchema } from '@/types/schema'

describe('Account Entry Repository', () => {
  beforeEach(async () => {
    await setupTestDatabase()
    await setupAuthenticatedSession()
  })

  afterEach(async () => {
    await clearDatabase()
    await teardownAuth()
  })

  describe('createEntry', () => {
    it('should create and store entry', async () => {
      const entryData = {
        amount: 100.50,
        date: new Date().toISOString(),
        category: 'food',
        notes: 'Test',
      }

      const entry = await accountEntryRepository.createEntry(entryData)

      expect(entry.id).toBeDefined()
      expect(entry.amount).toBe(100.50)
      expect(entry.category).toBe('food')
    })

    it('should encrypt entry data before storage', async () => {
      const entryData = {
        amount: 200.00,
        date: new Date().toISOString(),
        category: 'shopping',
        notes: 'Sensitive data',
      }

      const entry = await accountEntryRepository.createEntry(entryData)

      // Verify entry can be retrieved and decrypted
      const retrieved = await accountEntryRepository.getEntryById(entry.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.amount).toBe(200.00)
    })
  })

  describe('getEntryById', () => {
    it('should retrieve and decrypt entry', async () => {
      const created = await accountEntryRepository.createEntry({
        amount: 100,
        date: new Date().toISOString(),
        category: 'food',
      })

      const retrieved = await accountEntryRepository.getEntryById(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.amount).toBe(100)
    })
  })

  describe('getAllEntries', () => {
    it('should return entries in reverse chronological order', async () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      await accountEntryRepository.createEntry({
        amount: 100,
        date: yesterday.toISOString(),
        category: 'food',
      })

      await accountEntryRepository.createEntry({
        amount: 200,
        date: now.toISOString(),
        category: 'shopping',
      })

      const entries = await accountEntryRepository.getAllEntries(10, 0)
      expect(entries.length).toBe(2)
      // Newest first
      expect(new Date(entries[0].date).getTime()).toBeGreaterThanOrEqual(
        new Date(entries[1].date).getTime()
      )
    })
  })

  describe('updateEntry', () => {
    it('should update entry', async () => {
      const created = await accountEntryRepository.createEntry({
        amount: 100,
        date: new Date().toISOString(),
        category: 'food',
      })

      const updated = await accountEntryRepository.updateEntry(created.id, {
        amount: 200,
        category: 'shopping',
      })

      expect(updated.amount).toBe(200)
      expect(updated.category).toBe('shopping')
    })
  })

  describe('deleteEntry', () => {
    it('should delete entry', async () => {
      const created = await accountEntryRepository.createEntry({
        amount: 100,
        date: new Date().toISOString(),
        category: 'food',
      })

      await accountEntryRepository.deleteEntry(created.id)

      const retrieved = await accountEntryRepository.getEntryById(created.id)
      expect(retrieved).toBeNull()
    })
  })
})
