/**
 * Authentication Fixture
 * Provides test utilities for authentication setup and teardown
 */

import { getDatabase } from '@/services/database'
import { hashPassword } from '@/services/security'
import { createSession } from '@/services/auth/session-manager'

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
  const session = createSession('test-user')
  // Store password in session for encryption (MVP approach)
  // @ts-ignore - temporary storage for MVP encryption
  session.password = TEST_PASSWORD
  localStorage.setItem('greenprj_session', JSON.stringify(session))
}

/**
 * Teardown: Clear authentication data
 */
export async function teardownAuth(): Promise<void> {
  const db = await getDatabase()
  await db.delete('settings', 'password_hash')
  
  // Clear session from localStorage
  localStorage.removeItem('greenprj_session')
}

/**
 * Get test password for login
 */
export function getTestPassword(): string {
  return TEST_PASSWORD
}
