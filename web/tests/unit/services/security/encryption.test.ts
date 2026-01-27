/**
 * Unit Tests: Encryption Service
 * Tests data encryption and decryption (P0 - Security Critical)
 */

import { describe, it, expect } from 'vitest'
import { encryptData, decryptData } from '@/services/security/encryption'

describe('Encryption Service', () => {
  const testPassword = 'TestPassword123!'
  const testData = JSON.stringify({
    amount: 100.50,
    category: 'food',
    notes: 'Sensitive data',
  })

  describe('encryptData', () => {
    it('should encrypt data and return encrypted, salt, and iv', async () => {
      const result = await encryptData(testData, testPassword)

      expect(result.encrypted).toBeDefined()
      expect(result.salt).toBeDefined()
      expect(result.iv).toBeDefined()
      expect(result.encrypted).not.toBe(testData)
    })

    it('should produce different encrypted output for same data', async () => {
      const result1 = await encryptData(testData, testPassword)
      const result2 = await encryptData(testData, testPassword)

      // Encrypted data should be different (due to random salt/iv)
      expect(result1.encrypted).not.toBe(result2.encrypted)
      expect(result1.salt).not.toBe(result2.salt)
      expect(result1.iv).not.toBe(result2.iv)
    })
  })

  describe('decryptData', () => {
    it('should decrypt encrypted data correctly', async () => {
      const encrypted = await encryptData(testData, testPassword)
      const decrypted = await decryptData(encrypted, testPassword)

      expect(decrypted).toBe(testData)
    })

    it('should fail to decrypt with wrong password', async () => {
      const encrypted = await encryptData(testData, testPassword)

      await expect(
        decryptData(encrypted, 'WrongPassword')
      ).rejects.toThrow()
    })

    it('should fail to decrypt with corrupted data', async () => {
      const encrypted = await encryptData(testData, testPassword)

      await expect(
        decryptData(
          {
            encrypted: 'corrupted',
            salt: encrypted.salt,
            iv: encrypted.iv,
          },
          testPassword
        )
      ).rejects.toThrow()
    })
  })

  describe('encryption round-trip', () => {
    it('should encrypt and decrypt complex data structures', async () => {
      const complexData = JSON.stringify({
        id: 'test-id',
        amount: 1234.56,
        date: '2026-01-26T00:00:00Z',
        category: 'shopping',
        notes: 'Test notes with special chars: !@#$%^&*()',
        nested: {
          field: 'value',
          array: [1, 2, 3],
        },
      })

      const encrypted = await encryptData(complexData, testPassword)
      const decrypted = await decryptData(encrypted, testPassword)

      expect(decrypted).toBe(complexData)
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(complexData))
    })
  })
})
