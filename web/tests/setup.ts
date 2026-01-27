/**
 * Test Setup File
 * Global test configuration and mocks
 */

import 'fake-indexeddb/auto'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage only when no window (Node); jsdom provides real localStorage
if (typeof window === 'undefined' && typeof globalThis !== 'undefined') {
  const g = globalThis as any
  g.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
}

// Mock window.matchMedia (only if window exists)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
