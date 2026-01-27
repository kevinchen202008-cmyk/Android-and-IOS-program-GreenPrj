/**
 * Statistics Service
 * Calculates consumption statistics by time and category dimensions
 */

import { getAllEntries } from '@/services/accounting/account-entry-service'
import type { AccountEntrySchema } from '@/types/schema'
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isWithinInterval,
  format,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

export type TimeDimension = 'day' | 'week' | 'month' | 'year'

export interface TimeStatistics {
  period: string
  total: number
  count: number
  entries: AccountEntrySchema[]
}

export interface CategoryStatistics {
  category: string
  total: number
  percentage: number
  count: number
  entries: AccountEntrySchema[]
}

export interface StatisticsSummary {
  totalAmount: number
  totalCount: number
  averageAmount: number
  timeStatistics: TimeStatistics[]
  categoryStatistics: CategoryStatistics[]
}

/**
 * Get time range for a given date and dimension
 */
function getTimeRange(date: Date, dimension: TimeDimension): { start: Date; end: Date } {
  switch (dimension) {
    case 'day':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      }
    case 'week':
      return {
        start: startOfWeek(date, { locale: zhCN }),
        end: endOfWeek(date, { locale: zhCN }),
      }
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      }
    case 'year':
      return {
        start: startOfYear(date),
        end: endOfYear(date),
      }
  }
}

/**
 * Format period label for display
 */
function formatPeriodLabel(date: Date, dimension: TimeDimension): string {
  switch (dimension) {
    case 'day':
      return format(date, 'yyyy-MM-dd', { locale: zhCN })
    case 'week':
      return format(date, 'yyyy年MM月第w周', { locale: zhCN })
    case 'month':
      return format(date, 'yyyy年MM月', { locale: zhCN })
    case 'year':
      return format(date, 'yyyy年', { locale: zhCN })
  }
}

/**
 * Calculate statistics by time dimension
 */
export async function getTimeStatistics(
  dimension: TimeDimension,
  startDate?: Date,
  endDate?: Date
): Promise<TimeStatistics[]> {
  const allEntries = await getAllEntries(10000, 0) // Get all entries for statistics

  // Filter by date range if provided
  let filteredEntries = allEntries
  if (startDate && endDate) {
    filteredEntries = allEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return isWithinInterval(entryDate, { start: startDate, end: endDate })
    })
  }

  // Group entries by time period
  const periodMap = new Map<string, AccountEntrySchema[]>()

  filteredEntries.forEach((entry) => {
    const entryDate = new Date(entry.date)
    const { start } = getTimeRange(entryDate, dimension)
    const periodKey = formatPeriodLabel(start, dimension)

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, [])
    }
    periodMap.get(periodKey)!.push(entry)
  })

  // Calculate statistics for each period
  const statistics: TimeStatistics[] = []
  periodMap.forEach((entries, period) => {
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0)
    statistics.push({
      period,
      total,
      count: entries.length,
      entries,
    })
  })

  // Sort by period (newest first for day/week, oldest first for month/year)
  if (dimension === 'day' || dimension === 'week') {
    statistics.sort((a, b) => b.period.localeCompare(a.period))
  } else {
    statistics.sort((a, b) => a.period.localeCompare(b.period))
  }

  return statistics
}

/**
 * Calculate statistics by category
 */
export async function getCategoryStatistics(
  startDate?: Date,
  endDate?: Date
): Promise<CategoryStatistics[]> {
  const allEntries = await getAllEntries(10000, 0)

  // Filter by date range if provided
  let filteredEntries = allEntries
  if (startDate && endDate) {
    filteredEntries = allEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return isWithinInterval(entryDate, { start: startDate, end: endDate })
    })
  }

  // Calculate total for percentage calculation
  const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0)

  // Group entries by category
  const categoryMap = new Map<string, AccountEntrySchema[]>()

  filteredEntries.forEach((entry) => {
    if (!categoryMap.has(entry.category)) {
      categoryMap.set(entry.category, [])
    }
    categoryMap.get(entry.category)!.push(entry)
  })

  // Calculate statistics for each category
  const statistics: CategoryStatistics[] = []
  categoryMap.forEach((entries, category) => {
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0)
    const percentage = totalAmount > 0 ? (total / totalAmount) * 100 : 0

    statistics.push({
      category,
      total,
      percentage,
      count: entries.length,
      entries,
    })
  })

  // Sort by total (highest first)
  statistics.sort((a, b) => b.total - a.total)

  return statistics
}

/**
 * Get comprehensive statistics summary
 */
export async function getStatisticsSummary(
  dimension: TimeDimension = 'month',
  startDate?: Date,
  endDate?: Date
): Promise<StatisticsSummary> {
  const allEntries = await getAllEntries(10000, 0)

  // Filter by date range if provided
  let filteredEntries = allEntries
  if (startDate && endDate) {
    filteredEntries = allEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return isWithinInterval(entryDate, { start: startDate, end: endDate })
    })
  }

  const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0)
  const totalCount = filteredEntries.length
  const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0

  const timeStatistics = await getTimeStatistics(dimension, startDate, endDate)
  const categoryStatistics = await getCategoryStatistics(startDate, endDate)

  return {
    totalAmount,
    totalCount,
    averageAmount,
    timeStatistics,
    categoryStatistics,
  }
}

/**
 * Get daily statistics for a specific date range
 */
export async function getDailyStatistics(startDate: Date, endDate: Date): Promise<TimeStatistics[]> {
  return await getTimeStatistics('day', startDate, endDate)
}

/**
 * Get weekly statistics for a specific date range
 */
export async function getWeeklyStatistics(startDate: Date, endDate: Date): Promise<TimeStatistics[]> {
  return await getTimeStatistics('week', startDate, endDate)
}

/**
 * Get monthly statistics for a specific date range
 */
export async function getMonthlyStatistics(startDate: Date, endDate: Date): Promise<TimeStatistics[]> {
  return await getTimeStatistics('month', startDate, endDate)
}

/**
 * Get yearly statistics for a specific date range
 */
export async function getYearlyStatistics(startDate: Date, endDate: Date): Promise<TimeStatistics[]> {
  return await getTimeStatistics('year', startDate, endDate)
}
