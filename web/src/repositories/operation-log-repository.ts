/**
 * Operation Log Repository
 * Handles data encryption/decryption and database operations for operation logs
 */

import { getDatabase } from '@/services/database'
import { encryptData, decryptData } from '@/services/security'
import { getEncryptionPassword } from '@/services/security/encryption-session'
import { generateId, getCurrentTimestamp } from '@/utils/database-helpers'
import type { OperationLogSchema } from '@/types/schema'

/**
 * 获取用于加密的会话口令
 */
async function getUserPassword(): Promise<string> {
  const password = getEncryptionPassword()
  if (!password) {
    throw new Error('Encryption password not available')
  }
  return password
}

/**
 * Operation Log Repository
 */
export class OperationLogRepository {
  /**
   * Create a new operation log entry
   * @param log - Operation log data (will be encrypted)
   */
  async createLog(log: Omit<OperationLogSchema, 'id' | 'timestamp'>): Promise<OperationLogSchema> {
    const db = await getDatabase()
    const now = getCurrentTimestamp()
    const id = generateId()

    const logData: OperationLogSchema = {
      id,
      ...log,
      timestamp: now,
    }

    // Encrypt log data before storage
    try {
      const password = await getUserPassword()
      const encrypted = await encryptData(JSON.stringify(logData), password)
      
      // Store encrypted data
      const encryptedLog = {
        id,
        encrypted: encrypted.encrypted,
        salt: encrypted.salt,
        iv: encrypted.iv,
        operation: undefined,
        type: undefined,
        content: undefined,
        result: undefined,
        timestamp: now,
      }
      await db.put('operationLogs', encryptedLog)
      return logData
    } catch (error) {
      console.warn('Encryption not available, storing unencrypted:', error)
      // Fallback: store unencrypted (for development/testing)
      await db.put('operationLogs', logData)
      return logData
    }
  }

  /**
   * Get all operation logs (decrypted)
   * @param limit - Maximum number of logs to retrieve
   * @param offset - Number of logs to skip
   */
  async getAllLogs(limit: number = 1000, offset: number = 0): Promise<OperationLogSchema[]> {
    const db = await getDatabase()
    const allLogs = await db.getAll('operationLogs')
    
    // Decrypt logs
    const decryptedLogs: OperationLogSchema[] = []
    for (const log of allLogs) {
      if ('encrypted' in log && 'salt' in log && 'iv' in log) {
        try {
          const password = await getUserPassword()
          const decrypted = await decryptData(
            {
              encrypted: log.encrypted as string,
              salt: log.salt as string,
              iv: log.iv as string,
            },
            password
          )
          decryptedLogs.push(JSON.parse(decrypted) as OperationLogSchema)
        } catch (error) {
          console.error('Failed to decrypt log:', error)
          // Skip encrypted logs that can't be decrypted
        }
      } else {
        decryptedLogs.push(log as OperationLogSchema)
      }
    }

    // Sort by timestamp (newest first)
    decryptedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply pagination
    return decryptedLogs.slice(offset, offset + limit)
  }

  /**
   * Get logs filtered by operation type
   */
  async getLogsByType(type: string, limit: number = 1000, offset: number = 0): Promise<OperationLogSchema[]> {
    const allLogs = await this.getAllLogs(10000, 0)
    return allLogs.filter((log) => log.type === type).slice(offset, offset + limit)
  }

  /**
   * Get logs filtered by result
   */
  async getLogsByResult(result: 'success' | 'failure', limit: number = 1000, offset: number = 0): Promise<OperationLogSchema[]> {
    const allLogs = await this.getAllLogs(10000, 0)
    return allLogs.filter((log) => log.result === result).slice(offset, offset + limit)
  }

  /**
   * Get logs filtered by date range
   */
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 1000,
    offset: number = 0
  ): Promise<OperationLogSchema[]> {
    const allLogs = await this.getAllLogs(10000, 0)
    return allLogs
      .filter((log) => {
        const logDate = new Date(log.timestamp)
        return logDate >= startDate && logDate <= endDate
      })
      .slice(offset, offset + limit)
  }

  /**
   * Get total count of logs
   */
  async getLogCount(): Promise<number> {
    const db = await getDatabase()
    const allLogs = await db.getAll('operationLogs')
    return allLogs.length
  }

  /**
   * Delete logs older than specified days
   */
  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const db = await getDatabase()
    const allLogs = await db.getAll('operationLogs')
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    let deletedCount = 0
    for (const log of allLogs) {
      let logDate: Date
      
      if ('encrypted' in log && 'salt' in log && 'iv' in log) {
        try {
          const password = await getUserPassword()
          const decrypted = await decryptData(
            {
              encrypted: log.encrypted as string,
              salt: log.salt as string,
              iv: log.iv as string,
            },
            password
          )
          const logData = JSON.parse(decrypted) as OperationLogSchema
          logDate = new Date(logData.timestamp)
        } catch (error) {
          // Skip if can't decrypt
          continue
        }
      } else {
        logDate = new Date((log as OperationLogSchema).timestamp)
      }

      if (logDate < cutoffDate) {
        await db.delete('operationLogs', log.id)
        deletedCount++
      }
    }

    return deletedCount
  }

  /**
   * Delete all logs (for testing/cleanup)
   */
  async deleteAllLogs(): Promise<void> {
    const db = await getDatabase()
    const allLogs = await db.getAll('operationLogs')
    for (const log of allLogs) {
      await db.delete('operationLogs', log.id)
    }
  }
}

export const operationLogRepository = new OperationLogRepository()
