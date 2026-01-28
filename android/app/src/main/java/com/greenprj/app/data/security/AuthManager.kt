package com.greenprj.app.data.security

import com.greenprj.app.utils.PasswordValidationResult
import com.greenprj.app.utils.passwordsMatch
import com.greenprj.app.utils.validatePasswordStrength
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Handles local password setup, validation and login.
 *
 * 使用 bcrypt 进行密码哈希，哈希值通过 AuthPreferences 保存在本地 SharedPreferences 中。
 */
@Singleton
class AuthManager @Inject constructor(
    private val authPreferences: AuthPreferences
) {

    fun isPasswordSet(): Boolean = authPreferences.isPasswordSet()

    fun setupPassword(password: String, confirmPassword: String): SetupResult {
        val validation: PasswordValidationResult = validatePasswordStrength(password)
        if (!validation.isValid) {
            return SetupResult.InvalidPassword(validation.errors)
        }

        if (!passwordsMatch(password, confirmPassword)) {
            return SetupResult.PasswordsDoNotMatch
        }

        val hash = PasswordHashService.hashPassword(password)
        authPreferences.setPasswordHash(hash)
        return SetupResult.Success
    }

    fun login(password: String): LoginResult {
        val storedHash = authPreferences.getPasswordHash()
        if (storedHash.isNullOrBlank()) {
            return LoginResult.PasswordNotSet
        }

        val isValid = try {
            PasswordHashService.verifyPassword(password, storedHash)
        } catch (e: SecurityException) {
            return LoginResult.Error(e.message ?: "密码校验失败")
        }

        return if (isValid) {
            LoginResult.Success
        } else {
            LoginResult.InvalidCredentials
        }
    }

    sealed interface SetupResult {
        data object Success : SetupResult
        data object PasswordsDoNotMatch : SetupResult
        data class InvalidPassword(val errors: List<String>) : SetupResult
    }

    sealed interface LoginResult {
        data object Success : LoginResult
        data object PasswordNotSet : LoginResult
        data object InvalidCredentials : LoginResult
        data class Error(val message: String) : LoginResult
    }
}

