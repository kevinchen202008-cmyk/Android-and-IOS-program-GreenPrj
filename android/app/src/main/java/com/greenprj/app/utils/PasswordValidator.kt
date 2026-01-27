package com.greenprj.app.utils

/**
 * Password Validation Utilities
 * Validates password strength according to requirements
 */

/**
 * Password validation result
 */
data class PasswordValidationResult(
    val isValid: Boolean,
    val errors: List<String>
)

/**
 * Validate password strength
 * Requirements:
 * - Minimum 6 characters
 * - Supports letters, numbers, special characters
 * @param password Password to validate
 * @return Validation result with errors
 */
fun validatePasswordStrength(password: String): PasswordValidationResult {
    val errors = mutableListOf<String>()

    // Check minimum length
    if (password.length < 6) {
        errors.add("密码长度至少为6个字符")
    }

    // Password is valid if it meets minimum length
    // (We accept letters, numbers, and special characters, so no additional checks needed)

    return PasswordValidationResult(
        isValid = errors.isEmpty(),
        errors = errors
    )
}

/**
 * Check if two passwords match
 * @param password First password
 * @param confirmPassword Confirmation password
 * @return true if passwords match
 */
fun passwordsMatch(password: String, confirmPassword: String): Boolean {
    return password == confirmPassword
}
