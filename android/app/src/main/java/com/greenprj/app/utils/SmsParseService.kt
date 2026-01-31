package com.greenprj.app.utils

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.regex.Pattern

/**
 * 短信解析：与 Web 端 sms-service 规则一致，从短信文本中解析出金额、日期、类别、备注。
 * 用于「粘贴/输入短信内容并解析」后预填记账表单。
 */
object SmsParseService {

    data class SmsParseResult(
        val amount: Double? = null,
        val date: String? = null,
        val category: String? = null,
        val notes: String? = null
    )

    private val alipayPattern = Pattern.compile("支付宝.*?(\\d+\\.?\\d*)元.*?([^\\n]+)")
    private val wechatPattern = Pattern.compile("微信支付.*?(\\d+\\.?\\d*)元.*?([^\\n]+)")
    private val bankPattern = Pattern.compile("尾号\\d+.*?(\\d+\\.?\\d*)元.*?([^\\n]+)")
    private val consumePattern = Pattern.compile("消费.*?(\\d+\\.?\\d*).*?元")

    private fun extractAmountAndMerchant(text: String): Pair<Double?, String?> {
        var matcher = alipayPattern.matcher(text)
        if (matcher.find()) return Pair(matcher.group(1)?.toDoubleOrNull(), matcher.group(2)?.trim())
        matcher = wechatPattern.matcher(text)
        if (matcher.find()) return Pair(matcher.group(1)?.toDoubleOrNull(), matcher.group(2)?.trim())
        matcher = bankPattern.matcher(text)
        if (matcher.find()) return Pair(matcher.group(1)?.toDoubleOrNull(), matcher.group(2)?.trim())
        matcher = consumePattern.matcher(text)
        if (matcher.find()) return Pair(matcher.group(1)?.toDoubleOrNull(), null)
        return Pair(null, null)
    }

    private fun extractDate(text: String): String? {
        val fullDate = Pattern.compile("(\\d{4})[年\\-/](\\d{1,2})[月\\-/](\\d{1,2})[日]?\\s*(\\d{1,2})[：:](\\d{1,2})")
        var m = fullDate.matcher(text)
        if (m.find()) {
            val year = m.group(1)
            val month = m.group(2)!!.padStart(2, '0')
            val day = m.group(3)!!.padStart(2, '0')
            return "$year-$month-$day"
        }
        val shortDate = Pattern.compile("(\\d{1,2})[月\\-/](\\d{1,2})[日\\-/]")
        m = shortDate.matcher(text)
        if (m.find()) {
            val year = LocalDate.now().year
            val month = m.group(1)!!.padStart(2, '0')
            val day = m.group(2)!!.padStart(2, '0')
            return "$year-$month-$day"
        }
        return null
    }

    private fun inferCategory(merchant: String): String {
        val lower = merchant.lowercase()
        if (lower.contains("餐厅") || lower.contains("饭店") || lower.contains("超市")) return "food"
        if (lower.contains("地铁") || lower.contains("公交") || lower.contains("出租车")) return "transport"
        if (lower.contains("商场") || lower.contains("商店")) return "shopping"
        if (lower.contains("电影院") || lower.contains("ktv")) return "other"
        return "other"
    }

    fun parseSms(smsText: String): SmsParseResult {
        val trimmed = smsText.trim()
        val (amount, merchant) = extractAmountAndMerchant(trimmed)
        val date = extractDate(trimmed) ?: LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        val category = merchant?.let { inferCategory(it) }
        val notes = merchant ?: trimmed.takeIf { it.isNotBlank() }
        return SmsParseResult(
            amount = amount,
            date = date,
            category = category,
            notes = notes
        )
    }
}
