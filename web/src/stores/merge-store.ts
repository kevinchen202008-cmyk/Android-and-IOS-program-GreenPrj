/**
 * Merge Store (Zustand)
 * Manages account book merge operations
 */

import { create } from 'zustand'
import { downloadExportFile } from '@/services/merge/export-service'
import {
  parseImportFile,
  validateImportData,
  type MergeResult,
  type DuplicateEntry,
} from '@/services/merge/import-service'
import type { ExportFormatSchema } from '@/types/schema'

interface MergeState {
  // State
  isExporting: boolean
  isImporting: boolean
  importPreview: ExportFormatSchema | null
  mergeResult: MergeResult | null
  error: string | null

  // Actions
  exportAccountBook: () => Promise<void>
  previewImport: (fileContent: string) => Promise<void>
  importAccountBook: (
    options?: {
      skipDuplicates?: boolean
      resolveConflicts?: (duplicate: DuplicateEntry) => 'keep-existing' | 'keep-imported' | 'keep-both'
    }
  ) => Promise<void>
  clearPreview: () => void
  clearError: () => void
}

export const useMergeStore = create<MergeState>((set, get) => ({
  isExporting: false,
  isImporting: false,
  importPreview: null,
  mergeResult: null,
  error: null,

  exportAccountBook: async () => {
    set({ isExporting: true, error: null })
    try {
      await downloadExportFile()
      set({ isExporting: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '导出失败',
        isExporting: false,
      })
    }
  },

  previewImport: async (fileContent: string) => {
    set({ error: null })
    try {
      const data = parseImportFile(fileContent)
      const validation = validateImportData(data)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
      set({ importPreview: data })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '预览失败',
        importPreview: null,
      })
    }
  },

  importAccountBook: async (options = {}) => {
    const { importPreview } = get()
    if (!importPreview) {
      set({ error: '请先选择要导入的文件' })
      return
    }

    set({ isImporting: true, error: null })
    try {
      // Import from service (not recursive call)
      const { importAccountBook: importService } = await import('@/services/merge/import-service')
      const result = await importService(importPreview, options)
      set({ mergeResult: result, isImporting: false, importPreview: null })
      
      // Refresh statistics and budgets after import
      import('@/stores/statistics-store').then(({ useStatisticsStore }) => {
        const statsStore = useStatisticsStore.getState()
        if (statsStore.summary) {
          statsStore.refreshStatistics()
        }
      })
      import('@/stores/budget-store').then(({ useBudgetStore }) => {
        const budgetStore = useBudgetStore.getState()
        if (budgetStore.monthlyStatus || budgetStore.yearlyStatus) {
          budgetStore.loadBudgetStatuses()
        }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '导入失败',
        isImporting: false,
      })
    }
  },

  clearPreview: () => {
    set({ importPreview: null, mergeResult: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
