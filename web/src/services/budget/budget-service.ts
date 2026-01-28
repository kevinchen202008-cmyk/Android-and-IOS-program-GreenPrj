/**
 * Budget Service
 * Business logic for budget management
 */

import {
  createBudget,
  getBudgetById,
  getMonthlyBudget,
  getYearlyBudget,
  getAllBudgets,
  updateBudget,
  deleteBudget,
} from '@/repositories/budget-repository'
import { getAllEntries } from '@/services/accounting/account-entry-service'
import type { BudgetSchema } from '@/types/schema'
import type { CreateBudgetInput, UpdateBudgetInput, BudgetStatus } from '@/types/budget'
import { startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns'
import { logSuccess, logFailure } from '@/services/audit'

/**
 * Validate budget input
 */
export function validateBudgetInput(input: CreateBudgetInput): { valid: boolean; error?: string } {
  if (input.amount <= 0) {
    return { valid: false, error: '预算金额必须大于0' }
  }

  if (input.type === 'monthly' && !input.month) {
    return { valid: false, error: '月度预算必须指定月份' }
  }

  if (input.month && (input.month < 1 || input.month > 12)) {
    return { valid: false, error: '月份必须在1-12之间' }
  }

  return { valid: true }
}

/**
 * Create a new budget
 */
export async function createBudgetService(input: CreateBudgetInput): Promise<BudgetSchema> {
  const validation = validateBudgetInput(input)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Check if budget already exists
  if (input.type === 'monthly' && input.month) {
    const existing = await getMonthlyBudget(input.year, input.month)
    if (existing) {
      throw new Error(`该月份已存在预算，请先修改或删除现有预算`)
    }
  } else if (input.type === 'yearly') {
    const existing = await getYearlyBudget(input.year)
    if (existing) {
      throw new Error(`该年度已存在预算，请先修改或删除现有预算`)
    }
  }

  try {
    const budget = await createBudget(input)
    await logSuccess(
      '创建预算',
      'CREATE_BUDGET',
      `创建${input.type === 'monthly' ? '月度' : '年度'}预算: ¥${input.amount}, ${input.year}年${input.month ? `${input.month}月` : ''}`
    )
    return budget
  } catch (error) {
    await logFailure(
      '创建预算',
      'CREATE_BUDGET',
      `创建预算失败: ${input.type}, ${input.year}`,
      error instanceof Error ? error.message : String(error)
    )
    throw error
  }
}

/**
 * Get budget by ID
 */
export async function getBudgetByIdService(id: string): Promise<BudgetSchema | null> {
  return await getBudgetById(id)
}

/**
 * Get monthly budget for current month
 */
export async function getCurrentMonthlyBudget(): Promise<BudgetSchema | null> {
  const now = new Date()
  return await getMonthlyBudget(now.getFullYear(), now.getMonth() + 1)
}

/**
 * Get yearly budget for current year
 */
export async function getCurrentYearlyBudget(): Promise<BudgetSchema | null> {
  const now = new Date()
  return await getYearlyBudget(now.getFullYear())
}

/**
 * Get all budgets
 */
export async function getAllBudgetsService(): Promise<BudgetSchema[]> {
  return await getAllBudgets()
}

/**
 * Export getAllBudgets for backward compatibility
 */
export { getAllBudgetsService as getAllBudgets }

/**
 * Update budget
 */
export async function updateBudgetService(id: string, input: UpdateBudgetInput): Promise<BudgetSchema> {
  if (input.amount <= 0) {
    throw new Error('预算金额必须大于0')
  }

  try {
    const budget = await updateBudget(id, input)
    await logSuccess(
      '更新预算',
      'UPDATE_BUDGET',
      `更新预算 ${id}: ¥${input.amount}`
    )
    return budget
  } catch (error) {
    await logFailure(
      '更新预算',
      'UPDATE_BUDGET',
      `更新预算失败: ${id}`,
      error instanceof Error ? error.message : String(error)
    )
    throw error
  }
}

/**
 * Delete budget
 */
export async function deleteBudgetService(id: string): Promise<void> {
  try {
    const budget = await getBudgetById(id)
    await deleteBudget(id)
    if (budget) {
      await logSuccess(
        '删除预算',
        'DELETE_BUDGET',
        `删除预算: ¥${budget.amount}, ${budget.year}年${budget.month ? `${budget.month}月` : ''}`
      )
    }
  } catch (error) {
    await logFailure(
      '删除预算',
      'DELETE_BUDGET',
      `删除预算失败: ${id}`,
      error instanceof Error ? error.message : String(error)
    )
    throw error
  }
}

/**
 * Calculate actual consumption for a budget period
 */
export async function calculateActualConsumption(budget: BudgetSchema): Promise<number> {
  const allEntries = await getAllEntries(10000, 0)

  let startDate: Date
  let endDate: Date

  if (budget.type === 'monthly' && budget.month) {
    startDate = startOfMonth(new Date(budget.year, budget.month - 1, 1))
    endDate = endOfMonth(new Date(budget.year, budget.month - 1, 1))
  } else {
    startDate = startOfYear(new Date(budget.year, 0, 1))
    endDate = endOfYear(new Date(budget.year, 11, 31))
  }

  const filteredEntries = allEntries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return isWithinInterval(entryDate, { start: startDate, end: endDate })
  })

  return filteredEntries.reduce((sum, entry) => sum + entry.amount, 0)
}

/**
 * Get budget status (with actual consumption)
 */
export async function getBudgetStatus(budget: BudgetSchema): Promise<BudgetStatus> {
  const actualAmount = await calculateActualConsumption(budget)
  const remainingAmount = budget.amount - actualAmount
  const percentageUsed = (actualAmount / budget.amount) * 100
  const isExceeded = actualAmount > budget.amount
  const isWarning = percentageUsed >= 80 && !isExceeded

  return {
    budget,
    actualAmount,
    remainingAmount,
    percentageUsed,
    isExceeded,
    isWarning,
  }
}

/**
 * Get current budget statuses (monthly and yearly)
 */
export async function getCurrentBudgetStatuses(): Promise<{
  monthly: BudgetStatus | null
  yearly: BudgetStatus | null
}> {
  const monthlyBudget = await getCurrentMonthlyBudget()
  const yearlyBudget = await getCurrentYearlyBudget()

  const monthly = monthlyBudget ? await getBudgetStatus(monthlyBudget) : null
  const yearly = yearlyBudget ? await getBudgetStatus(yearlyBudget) : null

  return { monthly, yearly }
}
