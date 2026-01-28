/**
 * Operation Log Service
 * Business logic for operation logging and audit
 */

import { operationLogRepository } from '@/repositories/operation-log-repository'
import type { OperationLogSchema } from '@/types/schema'

export type OperationType =
  | 'CREATE_ENTRY'
  | 'UPDATE_ENTRY'
  | 'DELETE_ENTRY'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA'
  | 'DELETE_ALL_DATA'
  | 'CHANGE_PASSWORD'
  | 'CREATE_BUDGET'
  | 'UPDATE_BUDGET'
  | 'DELETE_BUDGET'

export interface CreateLogInput {
  operation: string
  type: OperationType
  content: string
  result: 'success' | 'failure'
  error?: string
}

/**
 * Log an operation (non-blocking)
 * Logging failures don't block user operations
 */
export async function logOperation(input: CreateLogInput): Promise<void> {
  try {
    await operationLogRepository.createLog({
      operation: input.operation,
      type: input.type,
      content: input.content,
      result: input.result,
    })
  } catch (error) {
    // Logging failures don't block operations
    console.error('Failed to log operation:', error)
  }
}

/**
 * Log successful operation
 */
export async function logSuccess(
  operation: string,
  type: OperationType,
  content: string
): Promise<void> {
  await logOperation({
    operation,
    type,
    content,
    result: 'success',
  })
}

/**
 * Log failed operation
 */
export async function logFailure(
  operation: string,
  type: OperationType,
  content: string,
  error: string
): Promise<void> {
  await logOperation({
    operation,
    type,
    content,
    result: 'failure',
    error,
  })
}

/**
 * Get all operation logs
 */
export async function getAllLogs(limit: number = 1000, offset: number = 0): Promise<OperationLogSchema[]> {
  return await operationLogRepository.getAllLogs(limit, offset)
}

/**
 * Get logs by operation type
 */
export async function getLogsByType(
  type: OperationType,
  limit: number = 1000,
  offset: number = 0
): Promise<OperationLogSchema[]> {
  return await operationLogRepository.getLogsByType(type, limit, offset)
}

/**
 * Get logs by result
 */
export async function getLogsByResult(
  result: 'success' | 'failure',
  limit: number = 1000,
  offset: number = 0
): Promise<OperationLogSchema[]> {
  return await operationLogRepository.getLogsByResult(result, limit, offset)
}

/**
 * Get logs by date range
 */
export async function getLogsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 1000,
  offset: number = 0
): Promise<OperationLogSchema[]> {
  return await operationLogRepository.getLogsByDateRange(startDate, endDate, limit, offset)
}

/**
 * Get log count
 */
export async function getLogCount(): Promise<number> {
  return await operationLogRepository.getLogCount()
}

/**
 * Clean up old logs (older than specified days)
 */
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
  return await operationLogRepository.deleteOldLogs(daysToKeep)
}

/**
 * Check if log cleanup is needed
 */
export async function shouldCleanupLogs(): Promise<{ needed: boolean; count: number; reason?: string }> {
  const count = await getLogCount()
  const MAX_LOGS = 10000
  const MAX_SIZE_MB = 50

  if (count > MAX_LOGS) {
    return {
      needed: true,
      count,
      reason: `日志数量超过${MAX_LOGS}条`,
    }
  }

  // Estimate size (rough calculation: ~500 bytes per log entry)
  const estimatedSizeMB = (count * 500) / (1024 * 1024)
  if (estimatedSizeMB > MAX_SIZE_MB) {
    return {
      needed: true,
      count,
      reason: `日志大小超过${MAX_SIZE_MB}MB`,
    }
  }

  return { needed: false, count }
}
