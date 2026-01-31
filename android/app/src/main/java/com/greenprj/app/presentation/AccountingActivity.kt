package com.greenprj.app.presentation

import android.content.Intent
import android.speech.RecognizerIntent
import android.text.Editable
import android.text.TextWatcher
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.greenprj.app.R
import com.greenprj.app.data.local.entities.AccountEntryEntity
import com.greenprj.app.data.security.SessionManager
import com.greenprj.app.databinding.ActivityAccountingBinding
import com.greenprj.app.presentation.accounting.AccountingViewModel
import com.greenprj.app.presentation.accounting.EntryAdapter
import com.greenprj.app.presentation.accounting.FilterState
import com.greenprj.app.utils.OcrHelper
import com.greenprj.app.utils.SmsParseService
import com.greenprj.app.utils.VoiceParseService
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/**
 * 记账界面：手动录入、解析短信、语音输入、扫描发票（与 Web MVP 对齐），并展示账目列表。
 * 仅在有有效会话时由 MainActivity 启动；会话过期后需重新登录。
 */
@AndroidEntryPoint
class AccountingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAccountingBinding
    private val viewModel: AccountingViewModel by viewModels()

    @Inject
    lateinit var sessionManager: SessionManager

    private lateinit var entryAdapter: EntryAdapter
    private var categoryKeys: Array<String> = emptyArray()
    private var categoryLabels: Array<String> = emptyArray()
    private var editingEntryId: String? = null

    private val requestRecordAudio = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startVoiceInput() else Toast.makeText(this, getString(R.string.permission_denied_mic), Toast.LENGTH_SHORT).show()
    }

    private val pickImageForOcr = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            OcrHelper.recognizeFromUri(this, uri) { text ->
                val result = OcrHelper.parseRecognizedText(text)
                runOnUiThread {
                    result.amount?.let { binding.amountInput.setText(it.toString()) }
                    result.date?.let { binding.dateInput.setText(it) }
                    result.notes?.let { binding.notesInput.setText(it) }
                    if (result.amount != null || result.date != null || result.notes != null) {
                        Toast.makeText(this, "已从图片识别并填入", Toast.LENGTH_SHORT).show()
                    } else if (text.isNotBlank()) {
                        binding.notesInput.setText(text.take(200))
                        Toast.makeText(this, "未识别到金额，已填入文字", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "未能识别图片中的文字", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private val startVoiceForResult = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode != android.app.Activity.RESULT_OK || result.data == null) return@registerForActivityResult
        val data = result.data!!
        val results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
        val text = results?.firstOrNull()?.trim().orEmpty()
        if (text.isEmpty()) return@registerForActivityResult
        val parsed = VoiceParseService.parseVoiceText(text)
        parsed.amount?.let { binding.amountInput.setText(it.toString()) }
        parsed.category?.let { cat ->
            val idx = categoryKeys.indexOf(cat).let { if (it >= 0) it else categoryKeys.indexOf("other").coerceAtLeast(0) }
            binding.categorySpinner.setSelection(idx)
        }
        parsed.notes?.let { binding.notesInput.setText(it) }
        if (parsed.notes == null && text.isNotBlank()) binding.notesInput.setText(text)
        Toast.makeText(this, "已从语音解析并填入", Toast.LENGTH_SHORT).show()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (!sessionManager.isSessionValid()) {
            finish()
            return
        }
        binding = ActivityAccountingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        categoryKeys = resources.getStringArray(R.array.category_keys)
        categoryLabels = resources.getStringArray(R.array.category_labels)
        val categoryMap = categoryKeys.zip(categoryLabels).toMap()

        entryAdapter = EntryAdapter(
            categoryMap,
            onEdit = { entry -> startEdit(entry) },
            onDelete = { entry -> confirmDelete(entry) }
        )
        binding.entriesRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.entriesRecyclerView.adapter = entryAdapter

        val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE
        binding.dateInput.setText(LocalDate.now().format(dateFormatter))

        binding.categorySpinner.adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            categoryLabels
        ).apply { setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item) }

        val filterCategoryLabels = arrayOf(getString(R.string.filter_category_all)) + categoryLabels
        binding.filterCategorySpinner.adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            filterCategoryLabels
        ).apply { setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item) }

        binding.filterQueryInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                applyFilter()
            }
        })
        binding.filterCategorySpinner.setOnItemSelectedListener(object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) = applyFilter()
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        })
        binding.filterClearButton.setOnClickListener {
            viewModel.clearFilter()
            binding.filterQueryInput.text?.clear()
            binding.filterCategorySpinner.setSelection(0)
            updateFilterHint(FilterState())
        }

        binding.confirmEntryButton.setOnClickListener { submitForm(dateFormatter) }

        binding.parseSmsButton.setOnClickListener { showSmsParseDialog() }
        binding.voiceInputButton.setOnClickListener { requestRecordAudio.launch(android.Manifest.permission.RECORD_AUDIO) }
        binding.scanInvoiceButton.setOnClickListener { pickImageForOcr.launch("image/*") }

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.filteredEntries.collectLatest { list: List<AccountEntryEntity> ->
                    entryAdapter.submitList(list)
                }
            }
        }
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.currentFilter.collectLatest { filter ->
                    updateFilterHint(filter)
                }
            }
        }
    }

    private fun applyFilter() {
        val query = binding.filterQueryInput.text?.toString()?.trim().orEmpty()
        val pos = binding.filterCategorySpinner.selectedItemPosition
        val category = if (pos <= 0) null else categoryKeys.getOrNull(pos - 1)
        viewModel.setFilter(category, if (query.isEmpty()) null else query)
    }

    private fun updateFilterHint(filter: FilterState) {
        val hasFilter = filter.category != null || !filter.query.isNullOrBlank()
        binding.filterActiveHint.visibility = if (hasFilter) View.VISIBLE else View.GONE
        if (hasFilter) {
            val parts = mutableListOf<String>()
            filter.category?.let { key ->
                val label = categoryLabels.getOrNull(categoryKeys.indexOf(key)) ?: key
                parts.add("类别=$label")
            }
            filter.query?.let { parts.add("关键词=$it") }
            binding.filterActiveHint.text = "当前筛选: ${parts.joinToString(", ")}"
        }
    }

    private fun startEdit(entry: AccountEntryEntity) {
        editingEntryId = entry.id
        binding.amountInput.setText(entry.amount.toString())
        binding.dateInput.setText(entry.date.toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
        val index = categoryKeys.indexOf(entry.category).coerceAtLeast(0)
        binding.categorySpinner.setSelection(index)
        binding.notesInput.setText(entry.notes ?: "")
        binding.confirmEntryButton.setText(R.string.save_edit)
        binding.accountingStatusText.text = ""
    }

    private fun submitForm(dateFormatter: DateTimeFormatter) {
        val amountStr = binding.amountInput.text?.toString()?.trim().orEmpty()
        val dateStr = binding.dateInput.text?.toString()?.trim().orEmpty()
        val categoryIndex = binding.categorySpinner.selectedItemPosition
        val notes = binding.notesInput.text?.toString()?.trim().orEmpty()

        if (amountStr.isEmpty()) {
            binding.accountingStatusText.text = getString(R.string.amount_hint) + " 不能为空"
            return
        }
        val amount = amountStr.toDoubleOrNull()
        if (amount == null || amount <= 0) {
            binding.accountingStatusText.text = "请输入大于 0 的金额"
            return
        }
        if (dateStr.isEmpty()) {
            binding.accountingStatusText.text = getString(R.string.date_hint) + " 不能为空"
            return
        }
        val date = try {
            LocalDate.parse(dateStr, dateFormatter)
        } catch (e: Exception) {
            binding.accountingStatusText.text = "日期格式请使用 yyyy-MM-dd"
            return
        }
        if (categoryIndex < 0 || categoryIndex >= categoryKeys.size) {
            binding.accountingStatusText.text = "请选择类别"
            return
        }
        val category = categoryKeys[categoryIndex]

        binding.accountingStatusText.text = ""
        val id = editingEntryId
        lifecycleScope.launch {
            if (id != null) {
                viewModel.updateEntry(id, amount, date.atStartOfDay(), category, if (notes.isNotEmpty()) notes else null)
                editingEntryId = null
                binding.confirmEntryButton.setText(R.string.confirm_entry)
                Toast.makeText(this@AccountingActivity, "已更新", Toast.LENGTH_SHORT).show()
            } else {
                viewModel.createEntry(amount, date.atStartOfDay(), category, if (notes.isNotEmpty()) notes else null)
                Toast.makeText(this@AccountingActivity, "已保存", Toast.LENGTH_SHORT).show()
            }
            binding.amountInput.text?.clear()
            binding.dateInput.setText(LocalDate.now().format(dateFormatter))
            binding.notesInput.text?.clear()
        }
    }

    private fun confirmDelete(entry: AccountEntryEntity) {
        AlertDialog.Builder(this)
            .setTitle(R.string.delete_confirm_title)
            .setMessage(R.string.delete_confirm_message)
            .setPositiveButton(R.string.delete_confirm_ok) { _, _ ->
                lifecycleScope.launch {
                    viewModel.deleteEntryById(entry.id)
                    if (editingEntryId == entry.id) {
                        editingEntryId = null
                        binding.confirmEntryButton.setText(R.string.confirm_entry)
                        binding.amountInput.text?.clear()
                        binding.dateInput.setText(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE))
                        binding.notesInput.text?.clear()
                    }
                    Toast.makeText(this@AccountingActivity, "已删除", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton(R.string.delete_confirm_cancel, null)
            .show()
    }

    private fun showSmsParseDialog() {
        val edit = EditText(this).apply {
            setHint(R.string.sms_dialog_hint)
            minLines = 4
            setPadding(48, 32, 48, 32)
        }
        AlertDialog.Builder(this)
            .setTitle(R.string.sms_dialog_title)
            .setView(edit)
            .setPositiveButton(R.string.parse_button) { _, _ ->
                val text = edit.text?.toString()?.trim().orEmpty()
                if (text.isEmpty()) return@setPositiveButton
                val result = SmsParseService.parseSms(text)
                result.amount?.let { binding.amountInput.setText(it.toString()) }
                result.date?.let { binding.dateInput.setText(it) }
                result.category?.let { cat ->
                    val idx = categoryKeys.indexOf(cat).let { if (it >= 0) it else categoryKeys.indexOf("other").coerceAtLeast(0) }
                    binding.categorySpinner.setSelection(idx)
                }
                result.notes?.let { binding.notesInput.setText(it) }
                Toast.makeText(this, "已解析并填入", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton(R.string.delete_confirm_cancel, null)
            .show()
    }

    private fun startVoiceInput() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "zh-CN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "请说出金额和类别，例如：吃饭 30 元")
        }
        try {
            startVoiceForResult.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "当前设备不支持语音识别", Toast.LENGTH_SHORT).show()
        }
    }
}
