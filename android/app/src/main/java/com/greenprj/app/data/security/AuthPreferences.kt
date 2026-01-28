package com.greenprj.app.data.security

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Simple auth preferences storage.
 *
 * 当前阶段仅在本地保存密码哈希，不同步到云端，也不存储明文密码。
 */
@Singleton
class AuthPreferences @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getPasswordHash(): String? = prefs.getString(KEY_PASSWORD_HASH, null)

    fun setPasswordHash(hash: String) {
        prefs.edit().putString(KEY_PASSWORD_HASH, hash).apply()
    }

    fun clearPassword() {
        prefs.edit().remove(KEY_PASSWORD_HASH).apply()
    }

    fun isPasswordSet(): Boolean = getPasswordHash() != null

    companion object {
        private const val PREFS_NAME = "greenprj_auth_prefs"
        private const val KEY_PASSWORD_HASH = "password_hash"
    }
}

