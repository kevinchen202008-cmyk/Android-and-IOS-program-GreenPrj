package com.greenprj.app.utils

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * 认证相关逻辑的单元测试：密码校验工具。
 */
class PasswordValidatorTest {

    @Test
    fun validatePasswordStrength_shortPassword_returnsInvalid() {
        val result = validatePasswordStrength("12345")
        assertFalse(result.isValid)
        assertTrue(result.errors.any { it.contains("6") })
    }

    @Test
    fun validatePasswordStrength_minLength6_returnsValid() {
        val result = validatePasswordStrength("123456")
        assertTrue(result.isValid)
        assertTrue(result.errors.isEmpty())
    }

    @Test
    fun validatePasswordStrength_longPassword_returnsValid() {
        val result = validatePasswordStrength("mySecureP@ss1")
        assertTrue(result.isValid)
    }

    @Test
    fun passwordsMatch_same_returnsTrue() {
        assertTrue(passwordsMatch("hello", "hello"))
    }

    @Test
    fun passwordsMatch_different_returnsFalse() {
        assertFalse(passwordsMatch("hello", "world"))
    }
}
