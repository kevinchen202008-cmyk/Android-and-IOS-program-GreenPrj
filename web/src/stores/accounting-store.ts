/**
 * Accounting Store (Zustand)
 * Manages account entry state
 */

import { create } from 'zustand'
import {
  createEntry,
  getAllEntries,
  updateEntry,
  deleteEntry,
  searchEntries,
  filterByCategory,
  filterByDateRange,
  type CreateEntryInput,
  type UpdateEntryInput,
} from '@/services/accounting/account-entry-service'
import type { AccountEntrySchema } from '@/types/schema'

interface AccountingState {
  entries: AccountEntrySchema[]
  isLoading: boolean
  error: string | null
  currentPage: number
  pageSize: number
  hasMore: boolean
  searchQuery: string
  selectedCategory: string | null
  dateRange: { start: string | null; end: string | null }

  // Actions
  loadEntries: (page?: number) => Promise<void>
  createNewEntry: (input: CreateEntryInput) => Promise<AccountEntrySchema>
  updateExistingEntry: (id: string, updates: UpdateEntryInput) => Promise<void>
  deleteExistingEntry: (id: string) => Promise<void>
  search: (query: string) => Promise<void>
  filterByCategory: (category: string | null) => Promise<void>
  filterByDateRange: (start: string | null, end: string | null) => Promise<void>
  clearFilters: () => Promise<void>
  clearError: () => void
}

export const useAccountingStore = create<AccountingState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,
  currentPage: 0,
  pageSize: 50,
  hasMore: true,
  searchQuery: '',
  selectedCategory: null,
  dateRange: { start: null, end: null },

  loadEntries: async (page = 0) => {
    set({ isLoading: true, error: null })
    try {
      const { pageSize } = get()
      const offset = page * pageSize
      const entries = await getAllEntries(pageSize, offset)

      set({
        entries: page === 0 ? entries : [...get().entries, ...entries],
        currentPage: page,
        hasMore: entries.length === pageSize,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载账目失败',
        isLoading: false,
      })
    }
  },

  createNewEntry: async (input: CreateEntryInput) => {
    set({ isLoading: true, error: null })
    try {
      const newEntry = await createEntry(input)
      set((state) => ({
        entries: [newEntry, ...state.entries], // Add to beginning (newest first)
        isLoading: false,
      }))
      return newEntry
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建账目失败',
        isLoading: false,
      })
      throw error
    }
  },

  updateExistingEntry: async (id: string, updates: UpdateEntryInput) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await updateEntry(id, updates)
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? updated : e)),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新账目失败',
        isLoading: false,
      })
      throw error
    }
  },

  deleteExistingEntry: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deleteEntry(id)
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除账目失败',
        isLoading: false,
      })
      throw error
    }
  },

  search: async (query: string) => {
    set({ isLoading: true, error: null, searchQuery: query })
    try {
      const entries = await searchEntries(query)
      set({
        entries,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '搜索失败',
        isLoading: false,
      })
    }
  },

  filterByCategory: async (category: string | null) => {
    set({ isLoading: true, error: null, selectedCategory: category })
    try {
      if (category) {
        const entries = await filterByCategory(category)
        set({ entries, isLoading: false })
      } else {
        // Load all entries if no category selected
        await get().loadEntries(0)
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '筛选失败',
        isLoading: false,
      })
    }
  },

  filterByDateRange: async (start: string | null, end: string | null) => {
    set({ isLoading: true, error: null, dateRange: { start, end } })
    try {
      if (start && end) {
        const entries = await filterByDateRange(start, end)
        set({ entries, isLoading: false })
      } else {
        // Load all entries if no date range
        await get().loadEntries(0)
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '筛选失败',
        isLoading: false,
      })
    }
  },

  clearFilters: async () => {
    set({
      searchQuery: '',
      selectedCategory: null,
      dateRange: { start: null, end: null },
    })
    await get().loadEntries(0)
  },

  clearError: () => {
    set({ error: null })
  },
}))
