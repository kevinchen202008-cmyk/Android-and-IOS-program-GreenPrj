package com.greenprj.app.utils

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.content.Context
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import java.util.regex.Pattern

/**
 * 发票/图片 OCR：与 Web 端 Tesseract 用途一致，从图片中识别文字并解析出金额、日期等。
 * 使用 ML Kit Text Recognition（Latin），适用于数字与常见符号。
 * 通过反射获取 Latin DEFAULT_OPTIONS，以兼容 play-services-mlkit-text-recognition 的包结构。
 */
object OcrHelper {

    data class OcrParseResult(
        val amount: Double? = null,
        val date: String? = null,
        val notes: String? = null
    )

    private val recognizer: TextRecognizer by lazy {
        val optionsClass = Class.forName("com.google.mlkit.vision.text.latin.TextRecognizerOptions")
        val defaultOptions = optionsClass.getField("DEFAULT_OPTIONS").get(null)
        val getClientMethod = TextRecognition::class.java.getMethod("getClient", Class.forName("com.google.mlkit.vision.text.TextRecognizerOptionsInterface"))
        @Suppress("UNCHECKED_CAST")
        getClientMethod.invoke(null, defaultOptions) as TextRecognizer
    }

    fun recognizeFromUri(context: Context, uri: Uri, onResult: (String) -> Unit) {
        try {
            val stream = context.contentResolver.openInputStream(uri) ?: run {
                onResult("")
                return
            }
            val bitmap = BitmapFactory.decodeStream(stream)
            stream.close()
            if (bitmap == null) {
                onResult("")
                return
            }
            recognizeFromBitmap(bitmap, onResult)
        } catch (e: Exception) {
            onResult("")
        }
    }

    fun recognizeFromBitmap(bitmap: Bitmap, onResult: (String) -> Unit) {
        val image = InputImage.fromBitmap(bitmap, 0)
        recognizer.process(image)
            .addOnSuccessListener { visionText ->
                onResult(visionText.text)
            }
            .addOnFailureListener {
                onResult("")
            }
    }

    /** 从识别出的整段文字中解析金额、日期、备注（与 Web 发票解析逻辑对齐） */
    fun parseRecognizedText(fullText: String): OcrParseResult {
        if (fullText.isBlank()) return OcrParseResult()
        val amountPatterns = listOf(
            Pattern.compile("(?:金额|合计|总价|￥|¥|元)\\s*[：:]?\\s*(\\d+\\.?\\d*)"),
            Pattern.compile("(\\d+\\.?\\d*)\\s*元"),
            Pattern.compile("(\\d+\\.?\\d*)")
        )
        var amount: Double? = null
        for (p in amountPatterns) {
            val m = p.matcher(fullText)
            if (m.find()) {
                val v = m.group(1)?.toDoubleOrNull()
                if (v != null && v > 0 && v < 1e8) {
                    amount = v
                    break
                }
            }
        }
        val datePattern = Pattern.compile("(\\d{4})[年\\-/](\\d{1,2})[月\\-/](\\d{1,2})")
        val dateMatcher = datePattern.matcher(fullText)
        var date: String? = null
        if (dateMatcher.find()) {
            date = "${dateMatcher.group(1)}-${dateMatcher.group(2)!!.padStart(2, '0')}-${dateMatcher.group(3)!!.padStart(2, '0')}"
        }
        val notes = fullText.trim().take(200).takeIf { it.isNotBlank() }
        return OcrParseResult(amount = amount, date = date, notes = notes)
    }
}
