/**
 * Unit Tests: Operation Log Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  logOperation,
  logSuccess,
  logFailure,
  getAllLogs,
  getLogsByType,
  getLogsByResult,
  getLogCount,
  cleanupOldLogs,
  shouldCleanupLogs,
  type OperationType,
} from '@/services/audit/operation-log-service'

vi.mock('@/repositories/operation-log-repository', () => ({
  operationLogRepository: {
    createLog: vi.fn().mockResolvedValue(undefined),
    getAllLogs: vi.fn().mockResolvedValue([]),
    getLogsByType: vi.fn().mockResolvedValue([]),
    getLogsByResult: vi.fn().mockResolvedValue([]),
    getLogsByDateRange: vi.fn().mockResolvedValue([]),
    getLogCount: vi.fn().mockResolvedValue(0),
    deleteOldLogs: vi.fn().mockResolvedValue(0),
  },
}))

describe('Operation Log Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logOperation', () => {
    it('calls repository createLog with correct input', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      await logOperation({
        operation: '创建账目',
        type: 'CREATE_ENTRY',
        content: 'test',
        result: 'success',
      })
      expect(operationLogRepository.createLog).toHaveBeenCalledWith({
        operation: '创建账目',
        type: 'CREATE_ENTRY',
        content: 'test',
        result: 'success',
      })
    })

    it('does not throw when repository fails', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      const orig = console.error
      try {
        console.error = vi.fn()
        ;(operationLogRepository.createLog as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('db error'))
        await expect(logOperation({
          operation: 'x',
          type: 'CREATE_ENTRY',
          content: 'x',
          result: 'failure',
        })).resolves.toBeUndefined()
      } finally {
        console.error = orig
      }
    })
  })

  describe('logSuccess', () => {
    it('calls logOperation with result success', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      await logSuccess('导出数据', 'EXPORT_DATA', 'exported 10 entries')
      expect(operationLogRepository.createLog).toHaveBeenCalledWith({
        operation: '导出数据',
        type: 'EXPORT_DATA',
        content: 'exported 10 entries',
        result: 'success',
      })
    })
  })

  describe('logFailure', () => {
    it('calls logOperation with result failure', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      await logFailure('导入数据', 'IMPORT_DATA', 'import failed', 'Invalid JSON')
      expect(operationLogRepository.createLog).toHaveBeenCalledWith({
        operation: '导入数据',
        type: 'IMPORT_DATA',
        content: 'import failed',
        result: 'failure',
      })
    })
  })

  describe('getAllLogs', () => {
    it('delegates to repository with default limit and offset', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      await getAllLogs()
      expect(operationLogRepository.getAllLogs).toHaveBeenCalledWith(1000, 0)
    })

    it('passes custom limit and offset', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      await getAllLogs(50, 10)
      expect(operationLogRepository.getAllLogs).toHaveBeenCalledWith(50, 10)
    })
  })

  describe('getLogsByType', () => {
    it('delegates to repository', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      await getLogsByType('DELETE_ENTRY', 100, 5)
      expect(operationLogRepository.getLogsByType).toHaveBeenCalledWith('DELETE_ENTRY', 100, 5)
    })
  })

  describe('getLogsByResult', () => {
    it('delegates to repository', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      await getLogsByResult('failure', 200, 0)
      expect(operationLogRepository.getLogsByResult).toHaveBeenCalledWith('failure', 200, 0)
    })
  })

  describe('getLogCount', () => {
    it('delegates to repository', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      ;(operationLogRepository.getLogCount as ReturnType<typeof vi.fn>).mockResolvedValue(42)
      const count = await getLogCount()
      expect(count).toBe(42)
    })
  })

  describe('cleanupOldLogs', () => {
    it('delegates to repository with default 90 days', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      ;(operationLogRepository.deleteOldLogs as ReturnType<typeof vi.fn>).mockResolvedValue(5)
      const deleted = await cleanupOldLogs()
      expect(operationLogRepository.deleteOldLogs).toHaveBeenCalledWith(90)
      expect(deleted).toBe(5)
    })

    it('passes custom daysToKeep', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      await cleanupOldLogs(30)
      expect(operationLogRepository.deleteOldLogs).toHaveBeenCalledWith(30)
    })
  })

  describe('shouldCleanupLogs', () => {
    it('returns needed false when count under threshold', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      ;(operationLogRepository.getLogCount as ReturnType<typeof vi.fn>).mockResolvedValue(100)
      const result = await shouldCleanupLogs()
      expect(result.needed).toBe(false)
      expect(result.count).toBe(100)
    })

    it('returns needed true when count over 10000', async () => {
      const { operationLogRepository } = await import('@/repositories/operation-log-repository')
      ;(operationLogRepository.getLogCount as ReturnType<typeof vi.fn>).mockResolvedValue(15000)
      const result = await shouldCleanupLogs()
      expect(result.needed).toBe(true)
      expect(result.reason).toContain('10000')
    })
  })
})
