/**
 * Account Entry Repository
 * Handles data encryption/decryption and database operations for account entries
 */

import { getDatabase } from '@/services/database'
import { encryptData, decryptData } from '@/services/security'
import { getEncryptionPassword } from '@/services/security/encryption-session'
import { generateId, getCurrentTimestamp } from '@/utils/database-helpers'
import type { AccountEntrySchema } from '@/types/schema'

/**
 * 获取用于加密的会话口令
 * 从内存中的 encryption-session 获取，而不是从 session/localStorage 读取明文密码。
 */
async function getUserPassword(): Promise<string> {
  const password = getEncryptionPassword()
  if (!password) {
    // 保持与之前逻辑兼容：抛出错误，外层会走到「加密不可用，按明文存储」的 fallback。
    throw new Error('Encryption password not available')
  }
  return password
}

/**
 * Account Entry Repository
 */
export class AccountEntryRepository {
  /**
   * Create a new account entry
   * @param entry - Account entry data (will be encrypted)
   */
  async createEntry(entry: Omit<AccountEntrySchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountEntrySchema> {
    const db = await getDatabase()
    const now = getCurrentTimestamp()
    const id = generateId()

    const entryData: AccountEntrySchema = {
      id,
      ...entry,
      createdAt: now,
      updatedAt: now,
    }

    // Encrypt entry data before storage
    try {
      const password = await getUserPassword()
      const encrypted = await encryptData(JSON.stringify(entryData), password)
      
      // Store encrypted data
      const encryptedEntry = {
        id,
        encrypted: encrypted.encrypted,
        salt: encrypted.salt,
        iv: encrypted.iv,
        createdAt: now,
        updatedAt: now,
      }
      await db.put('accounts', encryptedEntry)
      
      // Return decrypted entry for immediate use
      return entryData
    } catch (error) {
      // If encryption fails (e.g., password not available), store unencrypted for MVP
      // TODO: Remove this fallback in production
      console.warn('Encryption not available, storing unencrypted:', error)
      const toStore = { ...entryData, notes: entryData.notes ?? undefined }
      await db.put('accounts', toStore)
      return entryData
    }
    return entryData
  }

  /**
   * Get account entry by ID
   * @param id - Entry ID
   */
  async getEntryById(id: string): Promise<AccountEntrySchema | null> {
    const db = await getDatabase()
    const entry = await db.get('accounts', id)
    
    if (!entry) {
      return null
    }

    // Check if entry is encrypted
    if ('encrypted' in entry && 'salt' in entry && 'iv' in entry) {
      // Decrypt entry data
      try {
        const password = await getUserPassword()
        const decrypted = await decryptData(
          {
            encrypted: entry.encrypted as string,
            salt: entry.salt as string,
            iv: entry.iv as string,
          },
          password
        )
        return JSON.parse(decrypted) as AccountEntrySchema
      } catch (error) {
        console.error('Decryption failed:', error)
        throw new Error('无法解密账目数据')
      }
    }
    
    // Entry is not encrypted (legacy data or encryption disabled)
    return entry as AccountEntrySchema
  }

  /**
   * Get all account entries
   * @param limit - Maximum number of entries to return
   * @param offset - Offset for pagination
   */
  async getAllEntries(limit: number = 50, offset: number = 0): Promise<AccountEntrySchema[]> {
    const db = await getDatabase()
    const rawAll = (await db.getAll('accounts')) as unknown[]

    // Decrypt entries
    const entries: AccountEntrySchema[] = []
    for (const rawEntry of rawAll) {
      try {
        if (typeof rawEntry === 'object' && rawEntry !== null && 'encrypted' in rawEntry && 'salt' in rawEntry && 'iv' in rawEntry) {
          const password = await getUserPassword()
          const enc = rawEntry as { encrypted: string; salt: string; iv: string }
          const decrypted = await decryptData(
            { encrypted: enc.encrypted, salt: enc.salt, iv: enc.iv },
            password
          )
          entries.push(JSON.parse(decrypted) as AccountEntrySchema)
        } else {
          entries.push(rawEntry as AccountEntrySchema)
        }
      } catch (error) {
        console.error('Failed to decrypt entry:', error)
        // Skip corrupted entries
      }
    }

    // Sort by date descending (newest first), then apply offset/limit
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return entries.slice(offset, offset + limit)
  }

  /**
   * Update account entry
   * @param id - Entry ID
   * @param updates - Fields to update
   */
  async updateEntry(
    id: string,
    updates: Partial<Omit<AccountEntrySchema, 'id' | 'createdAt'>>
  ): Promise<AccountEntrySchema> {
    const existingDecrypted = await this.getEntryById(id)
    if (!existingDecrypted) {
      throw new Error('Entry not found')
    }

    const updated: AccountEntrySchema = {
      ...existingDecrypted,
      ...updates,
      updatedAt: getCurrentTimestamp(),
    }

    // Encrypt before storage
    try {
      const password = await getUserPassword()
      const encrypted = await encryptData(JSON.stringify(updated), password)
      const encryptedEntry = {
        id: updated.id,
        encrypted: encrypted.encrypted,
        salt: encrypted.salt,
        iv: encrypted.iv,
        createdAt: existingDecrypted.createdAt,
        updatedAt: updated.updatedAt,
      }
      await (await getDatabase()).put('accounts', encryptedEntry)
    } catch (error) {
      console.warn('Encryption not available, storing unencrypted:', error)
      const toStore = { ...updated, notes: updated.notes ?? undefined }
      await (await getDatabase()).put('accounts', toStore)
    }
    return updated
  }

  /**
   * Delete account entry
   * @param id - Entry ID
   */
  async deleteEntry(id: string): Promise<void> {
    const db = await getDatabase()
    await db.delete('accounts', id)
  }

  /**
   * Search entries by query
   * @param query - Search query
   */
  async searchEntries(query: string): Promise<AccountEntrySchema[]> {
    const allEntries = await this.getAllEntries(1000, 0) // Get all for search
    const lowerQuery = query.toLowerCase()
    
    return allEntries.filter((entry) => {
      return (
        entry.amount.toString().includes(lowerQuery) ||
        entry.category.toLowerCase().includes(lowerQuery) ||
        (entry.notes && entry.notes.toLowerCase().includes(lowerQuery))
      )
    })
  }

  /**
   * Filter entries by category
   * @param category - Category to filter by
   */
  async filterByCategory(category: string): Promise<AccountEntrySchema[]> {
    const allEntries = await this.getAllEntries(1000, 0)
    return allEntries.filter((entry) => entry.category === category)
  }

  /**
   * Filter entries by date range
   * @param startDate - Start date (ISO 8601)
   * @param endDate - End date (ISO 8601)
   */
  async filterByDateRange(startDate: string, endDate: string): Promise<AccountEntrySchema[]> {
    const allEntries = await this.getAllEntries(1000, 0)
    return allEntries.filter((entry) => {
      return entry.date >= startDate && entry.date <= endDate
    })
  }
}

// Export singleton instance
export const accountEntryRepository = new AccountEntryRepository()
