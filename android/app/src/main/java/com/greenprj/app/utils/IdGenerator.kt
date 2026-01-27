package com.greenprj.app.utils

import java.util.UUID

/**
 * ID Generator Utility
 * Generates unique IDs for database entities
 */
object IdGenerator {
    /**
     * Generate a unique ID
     * @return Unique ID string
     */
    fun generateId(): String {
        return UUID.randomUUID().toString()
    }

    /**
     * Generate a timestamp-based ID
     * @return Timestamp-based unique ID string
     */
    fun generateTimestampId(): String {
        return "${System.currentTimeMillis()}-${UUID.randomUUID().toString().substring(0, 8)}"
    }
}
