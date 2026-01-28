/**
 * Operation Log Store (Zustand)
 * Manages operation log state and viewing
 */

import { create } from 'zustand'
import {
  getAllLogs,
  getLogsByType,
  getLogsByResult,
  getLogsByDateRange,
  getLogCount,
  cleanupOldLogs,
  shouldCleanupLogs,
  type OperationType,
} from '@/services/audit/operation-log-service'
import type { OperationLogSchema } from '@/types/schema'

interface OperationLogState {
  // State
  logs: OperationLogSchema[]
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  filters: {
    type: OperationType | null
    result: 'success' | 'failure' | null
    startDate: Date | null
    endDate: Date | null
  }

  // Actions
  loadLogs: (page?: number) => Promise<void>
  setFilter: (filter: Partial<OperationLogState['filters']>) => Promise<void>
  clearFilters: () => Promise<void>
  refreshLogs: () => Promise<void>
  checkCleanup: () => Promise<{ needed: boolean; count: number; reason?: string }>
  performCleanup: (daysToKeep?: number) => Promise<number>
  clearError: () => void
}

export const useOperationLogStore = create<OperationLogState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 0,
  pageSize: 50,
  filters: {
    type: null,
    result: null,
    startDate: null,
    endDate: null,
  },

  loadLogs: async (page = 0) => {
    set({ isLoading: true, error: null })
    try {
      const { pageSize, filters } = get()
      const offset = page * pageSize

      let logs: OperationLogSchema[]
      let totalCount: number

      // Apply filters
      if (filters.type) {
        logs = await getLogsByType(filters.type, pageSize, offset)
        totalCount = await getLogCount() // Approximate count
      } else if (filters.result) {
        logs = await getLogsByResult(filters.result, pageSize, offset)
        totalCount = await getLogCount() // Approximate count
      } else if (filters.startDate && filters.endDate) {
        logs = await getLogsByDateRange(filters.startDate, filters.endDate, pageSize, offset)
        totalCount = await getLogCount() // Approximate count
      } else {
        logs = await getAllLogs(pageSize, offset)
        totalCount = await getLogCount()
      }

      set({
        logs: page === 0 ? logs : [...get().logs, ...logs],
        currentPage: page,
        totalCount,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载日志失败',
        isLoading: false,
      })
    }
  },

  setFilter: async (filter) => {
    set((state) => ({
      filters: { ...state.filters, ...filter },
    }))
    await get().loadLogs(0)
  },

  clearFilters: async () => {
    set({
      filters: {
        type: null,
        result: null,
        startDate: null,
        endDate: null,
      },
    })
    await get().loadLogs(0)
  },

  refreshLogs: async () => {
    await get().loadLogs(get().currentPage)
  },

  checkCleanup: async () => {
    return await shouldCleanupLogs()
  },

  performCleanup: async (daysToKeep = 90) => {
    set({ isLoading: true, error: null })
    try {
      const deletedCount = await cleanupOldLogs(daysToKeep)
      await get().refreshLogs()
      set({ isLoading: false })
      return deletedCount
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '清理日志失败',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
