/**
 * Authentication Service
 * Handles password setup, login, and password change
 */

import { hashPassword, verifyPassword } from '../security'
import { createSession, clearSession, getSession } from './session-manager'
import { setEncryptionPassword, clearEncryptionPassword } from '../security/encryption-session'
import { validatePasswordStrength, passwordsMatch } from '@/utils/password-validator'
import { getDatabase } from '../database'
import { logSuccess } from '@/services/audit'

/**
 * Check if password is set
 */
export async function isPasswordSet(): Promise<boolean> {
  const db = await getDatabase()
  const passwordHash = await db.get('settings', 'password_hash')
  return passwordHash !== undefined
}

/**
 * Set password (initial setup)
 * @param password - New password
 * @param confirmPassword - Password confirmation
 * @throws Error if validation fails
 */
export async function setPassword(password: string, confirmPassword: string): Promise<void> {
  // Validate password strength
  const validation = validatePasswordStrength(password)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Check if passwords match
  if (!passwordsMatch(password, confirmPassword)) {
    throw new Error('密码不匹配')
  }

  // Check if password already exists
  const exists = await isPasswordSet()
  if (exists) {
    throw new Error('密码已设置，请使用修改密码功能')
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Store password hash
  const db = await getDatabase()
  await db.put('settings', passwordHash, 'password_hash')

  // 创建会话并在内存中保存加密口令（不写入 localStorage）
  createSession('user')
  setEncryptionPassword(password)
}

/**
 * Login with password
 * @param password - User password
 * @throws Error if password is incorrect
 */
export async function login(password: string): Promise<void> {
  // Get stored password hash
  const db = await getDatabase()
  const storedHash = await db.get('settings', 'password_hash')

  if (!storedHash) {
    throw new Error('密码未设置')
  }

  // Verify password
  const isValid = await verifyPassword(password, storedHash as string)
  if (!isValid) {
    throw new Error('密码错误')
  }

  // Create session and set in-memory encryption password
  createSession('user')
  setEncryptionPassword(password)
}

/**
 * Change password
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @param confirmPassword - New password confirmation
 * @throws Error if validation fails
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> {
  // Verify current password
  const db = await getDatabase()
  const storedHash = await db.get('settings', 'password_hash')

  if (!storedHash) {
    throw new Error('密码未设置')
  }

  const isValid = await verifyPassword(currentPassword, storedHash as string)
  if (!isValid) {
    throw new Error('当前密码错误')
  }

  // Validate new password strength
  const validation = validatePasswordStrength(newPassword)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Check if passwords match
  if (!passwordsMatch(newPassword, confirmPassword)) {
    throw new Error('新密码不匹配')
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword)

  // Update password hash
  await db.put('settings', newPasswordHash, 'password_hash')

  // Log operation
  await logSuccess('修改密码', 'CHANGE_PASSWORD', '用户修改了密码')

  // Clear session (user needs to login again)
  clearSession()
  clearEncryptionPassword()
}

/**
 * Logout
 */
export function logout(): void {
  clearSession()
  clearEncryptionPassword()
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null
}
