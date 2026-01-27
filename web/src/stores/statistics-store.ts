/**
 * Statistics Store (Zustand)
 * Manages statistics state and calculations
 */

import { create } from 'zustand'
import {
  getStatisticsSummary,
  getTimeStatistics,
  getCategoryStatistics,
  type TimeDimension,
  type StatisticsSummary,
  type TimeStatistics,
  type CategoryStatistics,
} from '@/services/statistics/statistics-service'

interface StatisticsState {
  // State
  summary: StatisticsSummary | null
  isLoading: boolean
  error: string | null
  selectedDimension: TimeDimension
  dateRange: { start: Date | null; end: Date | null }

  // Actions
  loadStatistics: (dimension?: TimeDimension, startDate?: Date, endDate?: Date) => Promise<void>
  setDimension: (dimension: TimeDimension) => Promise<void>
  setDateRange: (start: Date | null, end: Date | null) => Promise<void>
  refreshStatistics: () => Promise<void>
  clearError: () => void
}

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  summary: null,
  isLoading: false,
  error: null,
  selectedDimension: 'month',
  dateRange: { start: null, end: null },

  loadStatistics: async (dimension = 'month', startDate, endDate) => {
    set({ isLoading: true, error: null, selectedDimension: dimension })

    try {
      const summary = await getStatisticsSummary(dimension, startDate, endDate)
      set({
        summary,
        isLoading: false,
        dateRange: { start: startDate || null, end: endDate || null },
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载统计失败',
        isLoading: false,
      })
    }
  },

  setDimension: async (dimension: TimeDimension) => {
    const { dateRange } = get()
    await get().loadStatistics(dimension, dateRange.start || undefined, dateRange.end || undefined)
  },

  setDateRange: async (start: Date | null, end: Date | null) => {
    const { selectedDimension } = get()
    await get().loadStatistics(selectedDimension, start || undefined, end || undefined)
  },

  refreshStatistics: async () => {
    const { selectedDimension, dateRange } = get()
    await get().loadStatistics(
      selectedDimension,
      dateRange.start || undefined,
      dateRange.end || undefined
    )
  },

  clearError: () => {
    set({ error: null })
  },
}))
