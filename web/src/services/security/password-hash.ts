/**
 * Password Hashing Service
 * Uses bcryptjs for password hashing (cost factor 12)
 */

import bcrypt from 'bcryptjs'

const BCRYPT_COST_FACTOR = 12

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_COST_FACTOR)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch (error) {
    throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    throw new Error(`Password verification failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
