package com.greenprj.app.data.security

import android.util.Base64
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * Data Encryption Service
 * Uses AES-256-GCM encryption with PBKDF2 key derivation
 */
object EncryptionService {
    private const val ALGORITHM = "AES/GCM/NoPadding"
    private const val KEY_ALGORITHM = "AES"
    private const val KEY_SIZE = 256
    private const val GCM_TAG_LENGTH = 128
    private const val IV_LENGTH = 12
    private const val SALT_LENGTH = 16
    private const val PBKDF2_ITERATIONS = 100000

    /**
     * Derive encryption key from password using PBKDF2
     * @param password User password
     * @param salt Salt for key derivation
     * @return Derived secret key
     */
    private fun deriveKey(password: String, salt: ByteArray): SecretKey {
        val keySpec = javax.crypto.spec.PBEKeySpec(
            password.toCharArray(),
            salt,
            PBKDF2_ITERATIONS,
            KEY_SIZE
        )
        val keyFactory = javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val keyBytes = keyFactory.generateSecret(keySpec).encoded
        return SecretKeySpec(keyBytes, KEY_ALGORITHM)
    }

    /**
     * Encrypt data using AES-256-GCM
     * @param data Data to encrypt
     * @param password User password for key derivation
     * @return Encrypted data with salt and IV (Base64 encoded)
     */
    fun encryptData(data: String, password: String): EncryptedData {
        try {
            // Generate salt and IV
            val salt = ByteArray(SALT_LENGTH).apply {
                SecureRandom().nextBytes(this)
            }
            val iv = ByteArray(IV_LENGTH).apply {
                SecureRandom().nextBytes(this)
            }

            // Derive key
            val key = deriveKey(password, salt)

            // Encrypt
            val cipher = Cipher.getInstance(ALGORITHM)
            val parameterSpec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
            cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec)
            val encrypted = cipher.doFinal(data.toByteArray(Charsets.UTF_8))

            // Encode to Base64
            return EncryptedData(
                encrypted = Base64.encodeToString(encrypted, Base64.NO_WRAP),
                salt = Base64.encodeToString(salt, Base64.NO_WRAP),
                iv = Base64.encodeToString(iv, Base64.NO_WRAP)
            )
        } catch (e: Exception) {
            throw SecurityException("Encryption failed: ${e.message}", e)
        }
    }

    /**
     * Decrypt data using AES-256-GCM
     * @param encryptedData Encrypted data with salt and IV
     * @param password User password for key derivation
     * @return Decrypted data
     */
    fun decryptData(encryptedData: EncryptedData, password: String): String {
        try {
            // Decode from Base64
            val encrypted = Base64.decode(encryptedData.encrypted, Base64.NO_WRAP)
            val salt = Base64.decode(encryptedData.salt, Base64.NO_WRAP)
            val iv = Base64.decode(encryptedData.iv, Base64.NO_WRAP)

            // Derive key
            val key = deriveKey(password, salt)

            // Decrypt
            val cipher = Cipher.getInstance(ALGORITHM)
            val parameterSpec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
            cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec)
            val decrypted = cipher.doFinal(encrypted)

            return String(decrypted, Charsets.UTF_8)
        } catch (e: Exception) {
            throw SecurityException("Decryption failed: ${e.message}", e)
        }
    }

    /**
     * Encrypted data container
     */
    data class EncryptedData(
        val encrypted: String,
        val salt: String,
        val iv: String
    )
}
