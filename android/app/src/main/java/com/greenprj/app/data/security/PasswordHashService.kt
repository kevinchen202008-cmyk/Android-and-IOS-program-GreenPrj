package com.greenprj.app.data.security

import org.mindrot.jbcrypt.BCrypt

/**
 * Password Hashing Service
 * Uses bcrypt for password hashing (cost factor 12)
 */
object PasswordHashService {
    private const val BCRYPT_COST_FACTOR = 12

    /**
     * Hash a password using bcrypt
     * @param password Plain text password
     * @return Hashed password
     */
    fun hashPassword(password: String): String {
        return try {
            BCrypt.hashpw(password, BCrypt.gensalt(BCRYPT_COST_FACTOR))
        } catch (e: Exception) {
            throw SecurityException("Password hashing failed: ${e.message}", e)
        }
    }

    /**
     * Verify a password against a hash
     * @param password Plain text password
     * @param hash Hashed password to compare against
     * @return true if password matches, false otherwise
     */
    fun verifyPassword(password: String, hash: String): Boolean {
        return try {
            BCrypt.checkpw(password, hash)
        } catch (e: Exception) {
            throw SecurityException("Password verification failed: ${e.message}", e)
        }
    }
}
