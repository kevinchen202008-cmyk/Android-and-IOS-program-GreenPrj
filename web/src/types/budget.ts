/**
 * Budget Types
 */

export type BudgetType = 'monthly' | 'yearly'

export interface BudgetSchema {
  id: string
  type: BudgetType
  year: number
  month?: number | null // Only for monthly budgets; null for yearly
  amount: number
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetInput {
  type: BudgetType
  year: number
  month?: number
  amount: number
}

export interface UpdateBudgetInput {
  amount: number
}

export interface BudgetStatus {
  budget: BudgetSchema
  actualAmount: number
  remainingAmount: number
  percentageUsed: number
  isExceeded: boolean
  isWarning: boolean // 80% threshold
}
