package com.greenprj.app.utils

import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * 核心记账相关逻辑的单元测试：ID 生成（用于账目等实体）。
 */
class IdGeneratorTest {

    @Test
    fun generateId_returnsNonEmpty() {
        val id = IdGenerator.generateId()
        assertTrue(id.isNotBlank())
    }

    @Test
    fun generateId_returnsUnique() {
        val id1 = IdGenerator.generateId()
        val id2 = IdGenerator.generateId()
        assertNotEquals(id1, id2)
    }

    @Test
    fun generateTimestampId_returnsNonEmpty() {
        val id = IdGenerator.generateTimestampId()
        assertTrue(id.isNotBlank())
        assertTrue(id.contains("-"))
    }
}
