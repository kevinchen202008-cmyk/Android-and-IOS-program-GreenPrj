/**
 * Database Helper Utilities
 * Common utilities for database operations
 */

/**
 * Generate a unique ID for database entries (UUID v4)
 * @returns UUID string
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get current timestamp in ISO 8601 format
 * @returns ISO 8601 timestamp string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Validate ISO 8601 date string
 * @param dateString - Date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Format date to ISO 8601 string
 * @param date - Date object or string
 * @returns ISO 8601 formatted string
 */
export function formatToISO(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString()
  }
  return date.toISOString()
}
