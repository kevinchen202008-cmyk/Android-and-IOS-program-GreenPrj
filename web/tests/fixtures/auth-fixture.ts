/**
 * Authentication Fixture
 * Provides test utilities for authentication setup and teardown
 */

import { getDatabase } from '@/services/database'
import { hashPassword } from '@/services/security'
import { createSession } from '@/services/auth/session-manager'
import { setEncryptionPassword, clearEncryptionPassword } from '@/services/security/encryption-session'

const TEST_PASSWORD = 'TestPassword123!'

/**
 * Setup: Create a test user with password
 */
export async function setupTestUser(): Promise<void> {
  const db = await getDatabase()
  const passwordHash = await hashPassword(TEST_PASSWORD)
  await db.put('settings', passwordHash, 'password_hash')
}

/**
 * Setup: Create an authenticated session
 */
export async function setupAuthenticatedSession(): Promise<void> {
  await setupTestUser()
  createSession('test-user')
  // 为测试环境设置内存中的加密口令，避免在 session/localStorage 中存明文密码
  setEncryptionPassword(TEST_PASSWORD)
}

/**
 * Teardown: Clear authentication data
 */
export async function teardownAuth(): Promise<void> {
  const db = await getDatabase()
  await db.delete('settings', 'password_hash')
  
  // Clear session from localStorage
  localStorage.removeItem('greenprj_session')
  clearEncryptionPassword()
}

/**
 * Get test password for login
 */
export function getTestPassword(): string {
  return TEST_PASSWORD
}
