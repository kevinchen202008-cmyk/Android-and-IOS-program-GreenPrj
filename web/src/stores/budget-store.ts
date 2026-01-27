/**
 * Budget Store (Zustand)
 * Manages budget state and operations
 */

import { create } from 'zustand'
import {
  createBudgetService,
  getBudgetByIdService,
  getCurrentMonthlyBudget,
  getCurrentYearlyBudget,
  getAllBudgetsService,
  updateBudgetService,
  deleteBudgetService,
  getCurrentBudgetStatuses,
  getBudgetStatus,
} from '@/services/budget/budget-service'
import type { BudgetSchema } from '@/types/schema'
import type { CreateBudgetInput, UpdateBudgetInput, BudgetStatus } from '@/types/budget'

interface BudgetState {
  // State
  budgets: BudgetSchema[]
  monthlyBudget: BudgetSchema | null
  yearlyBudget: BudgetSchema | null
  monthlyStatus: BudgetStatus | null
  yearlyStatus: BudgetStatus | null
  isLoading: boolean
  error: string | null

  // Actions
  loadBudgets: () => Promise<void>
  loadCurrentBudgets: () => Promise<void>
  loadBudgetStatuses: () => Promise<void>
  createBudget: (input: CreateBudgetInput) => Promise<void>
  updateBudget: (id: string, input: UpdateBudgetInput) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  refreshBudgets: () => Promise<void>
  clearError: () => void
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  monthlyBudget: null,
  yearlyBudget: null,
  monthlyStatus: null,
  yearlyStatus: null,
  isLoading: false,
  error: null,

  loadBudgets: async () => {
    set({ isLoading: true, error: null })
    try {
      const budgets = await getAllBudgetsService()
      set({ budgets, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载预算失败',
        isLoading: false,
      })
    }
  },

  loadCurrentBudgets: async () => {
    set({ isLoading: true, error: null })
    try {
      const [monthlyBudget, yearlyBudget] = await Promise.all([
        getCurrentMonthlyBudget(),
        getCurrentYearlyBudget(),
      ])
      set({ monthlyBudget, yearlyBudget, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载预算失败',
        isLoading: false,
      })
    }
  },

  loadBudgetStatuses: async () => {
    set({ isLoading: true, error: null })
    try {
      const { monthly, yearly } = await getCurrentBudgetStatuses()
      set({
        monthlyStatus: monthly,
        yearlyStatus: yearly,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载预算状态失败',
        isLoading: false,
      })
    }
  },

  createBudget: async (input: CreateBudgetInput) => {
    set({ isLoading: true, error: null })
    try {
      const newBudget = await createBudgetService(input)
      await get().refreshBudgets()
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建预算失败',
        isLoading: false,
      })
      throw error
    }
  },

  updateBudget: async (id: string, input: UpdateBudgetInput) => {
    set({ isLoading: true, error: null })
    try {
      await updateBudgetService(id, input)
      await get().refreshBudgets()
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新预算失败',
        isLoading: false,
      })
      throw error
    }
  },

  deleteBudget: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deleteBudgetService(id)
      await get().refreshBudgets()
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除预算失败',
        isLoading: false,
      })
      throw error
    }
  },

  refreshBudgets: async () => {
    await Promise.all([get().loadBudgets(), get().loadCurrentBudgets(), get().loadBudgetStatuses()])
  },

  clearError: () => {
    set({ error: null })
  },
}))
