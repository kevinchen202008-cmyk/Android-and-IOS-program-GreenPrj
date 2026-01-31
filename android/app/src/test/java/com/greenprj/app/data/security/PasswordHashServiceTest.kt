package com.greenprj.app.data.security

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * 认证相关逻辑的单元测试：密码哈希与校验。
 */
class PasswordHashServiceTest {

    @Test
    fun hashPassword_and_verifyPassword_match() {
        val password = "testPassword123"
        val hash = PasswordHashService.hashPassword(password)
        assertTrue(PasswordHashService.verifyPassword(password, hash))
    }

    @Test
    fun verifyPassword_wrongPassword_returnsFalse() {
        val hash = PasswordHashService.hashPassword("correct")
        assertFalse(PasswordHashService.verifyPassword("wrong", hash))
    }

    @Test
    fun hashPassword_differentSalts_eachCall() {
        val h1 = PasswordHashService.hashPassword("same")
        val h2 = PasswordHashService.hashPassword("same")
        assertTrue(h1 != h2)
        assertTrue(PasswordHashService.verifyPassword("same", h1))
        assertTrue(PasswordHashService.verifyPassword("same", h2))
    }
}
