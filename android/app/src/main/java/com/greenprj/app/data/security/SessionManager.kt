package com.greenprj.app.data.security

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Simple session manager for local password-based auth.
 *
 * 当前实现：
 * - 记录最近一次成功认证时间戳
 * - 提供 30 分钟超时判断
 */
@Singleton
class SessionManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun markAuthenticated() {
        val now = System.currentTimeMillis()
        prefs.edit().putLong(KEY_LAST_AUTH_TIME, now).apply()
    }

    fun clearSession() {
        prefs.edit().remove(KEY_LAST_AUTH_TIME).apply()
    }

    /**
     * 是否在给定分钟数内仍视为有效会话。
     * 默认 30 分钟。
     */
    fun isSessionValid(maxMinutes: Long = DEFAULT_SESSION_MINUTES): Boolean {
        val last = prefs.getLong(KEY_LAST_AUTH_TIME, 0L)
        if (last <= 0L) return false
        val now = System.currentTimeMillis()
        val diffMinutes = (now - last) / (60 * 1000)
        return diffMinutes < maxMinutes
    }

    companion object {
        private const val PREFS_NAME = "greenprj_session_prefs"
        private const val KEY_LAST_AUTH_TIME = "last_auth_time"
        private const val DEFAULT_SESSION_MINUTES = 30L
    }
}

