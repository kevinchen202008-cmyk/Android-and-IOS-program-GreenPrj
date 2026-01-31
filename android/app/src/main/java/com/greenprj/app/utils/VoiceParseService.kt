package com.greenprj.app.utils

import java.util.regex.Pattern

/**
 * 语音识别结果解析：与 Web 端 voice-service 规则一致，从识别文本中解析出金额、类别、备注。
 * 用于「语音输入」后预填记账表单。
 */
object VoiceParseService {

    data class VoiceParseResult(
        val amount: Double? = null,
        val category: String? = null,
        val notes: String? = null
    )

    private val amountPatterns = listOf(
        Pattern.compile("(\\d+\\.?\\d*)\\s*元"),
        Pattern.compile("(\\d+\\.?\\d*)\\s*块"),
        Pattern.compile("金额[：:]\\s*(\\d+\\.?\\d*)"),
        Pattern.compile("花了\\s*(\\d+\\.?\\d*)")
    )

    private val categoryKeywords = mapOf(
        "餐饮" to "food", "吃饭" to "food",
        "交通" to "transport", "打车" to "transport",
        "购物" to "shopping", "买" to "shopping",
        "娱乐" to "other", "电影" to "other",
        "住房" to "other", "房租" to "other",
        "医疗" to "other", "看病" to "other",
        "教育" to "other", "学习" to "other"
    )

    fun parseVoiceText(text: String): VoiceParseResult {
        val trimmed = text.trim()
        var amount: Double? = null
        for (p in amountPatterns) {
            val m = p.matcher(trimmed)
            if (m.find()) {
                val v = m.group(1)?.toDoubleOrNull()
                if (v != null && v > 0) {
                    amount = v
                    break
                }
            }
        }
        var category: String? = null
        for ((keyword, key) in categoryKeywords) {
            if (trimmed.contains(keyword)) {
                category = key
                break
            }
        }
        val notes = trimmed.takeIf { it.isNotBlank() }
        return VoiceParseResult(amount = amount, category = category, notes = notes)
    }
}
