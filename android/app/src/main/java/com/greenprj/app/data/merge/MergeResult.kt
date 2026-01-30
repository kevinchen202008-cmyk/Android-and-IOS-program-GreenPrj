package com.greenprj.app.data.merge

/**
 * 导入结果：与 Web 端 MergeResult 对齐
 */
data class MergeResult(
    val imported: Int,
    val duplicates: Int,
    val errors: List<String>
)

/**
 * 删除所有数据结果（用于提示）
 */
data class DeleteAllResult(
    val entriesDeleted: Int,
    val budgetsDeleted: Int
)
