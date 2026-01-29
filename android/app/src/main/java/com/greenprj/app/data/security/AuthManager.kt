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
    private val authPreferences: AuthPreferences,
    private val sessionManager: SessionManager
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
        // 设置密码本身不自动登录，仍需显式登录一次
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
            sessionManager.markAuthenticated()
            LoginResult.Success
        } else {
            LoginResult.InvalidCredentials
        }
    }

    fun changePassword(
        currentPassword: String,
        newPassword: String,
        confirmNewPassword: String
    ): ChangePasswordResult {
        val storedHash = authPreferences.getPasswordHash()
        if (storedHash.isNullOrBlank()) {
            return ChangePasswordResult.PasswordNotSet
        }

        val currentValid = try {
            PasswordHashService.verifyPassword(currentPassword, storedHash)
        } catch (e: SecurityException) {
            return ChangePasswordResult.Error(e.message ?: "当前密码校验失败")
        }

        if (!currentValid) {
            return ChangePasswordResult.InvalidCurrentPassword
        }

        val validation: PasswordValidationResult = validatePasswordStrength(newPassword)
        if (!validation.isValid) {
            return ChangePasswordResult.InvalidNewPassword(validation.errors)
        }

        if (!passwordsMatch(newPassword, confirmNewPassword)) {
            return ChangePasswordResult.PasswordsDoNotMatch
        }

        val newHash = PasswordHashService.hashPassword(newPassword)
        authPreferences.setPasswordHash(newHash)
        sessionManager.markAuthenticated()
        return ChangePasswordResult.Success
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

    sealed interface ChangePasswordResult {
        data object Success : ChangePasswordResult
        data object PasswordNotSet : ChangePasswordResult
        data object InvalidCurrentPassword : ChangePasswordResult
        data object PasswordsDoNotMatch : ChangePasswordResult
        data class InvalidNewPassword(val errors: List<String>) : ChangePasswordResult
        data class Error(val message: String) : ChangePasswordResult
    }
}

