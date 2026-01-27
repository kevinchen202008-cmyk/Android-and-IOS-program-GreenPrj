/**
 * Password Validation Utilities
 * Validates password strength according to requirements
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 6 characters
 * - Supports letters, numbers, special characters
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []

  // Check minimum length
  if (password.length < 6) {
    errors.push('密码长度至少为6个字符')
  }

  // Password is valid if it meets minimum length
  // (We accept letters, numbers, and special characters, so no additional checks needed)

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Check if two passwords match
 * @param password - First password
 * @param confirmPassword - Confirmation password
 * @returns true if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword
}
