package com.greenprj.app.presentation.merge

import android.net.Uri
import android.os.Bundle
import android.view.View
import android.text.TextWatcher
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.flowWithLifecycle
import androidx.lifecycle.lifecycleScope
import com.greenprj.app.R
import com.greenprj.app.databinding.ActivityMergeBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.io.OutputStreamWriter
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@AndroidEntryPoint
class MergeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMergeBinding
    private val viewModel: MergeViewModel by viewModels()

    private var pendingExportJson: String? = null

    private val createDocumentLauncher = registerForActivityResult(
        ActivityResultContracts.CreateDocument("application/json")
    ) { uri: Uri? ->
        uri ?: return@registerForActivityResult
        val json = pendingExportJson
        pendingExportJson = null
        if (json.isNullOrEmpty()) return@registerForActivityResult
        runCatching {
            contentResolver.openOutputStream(uri)?.use { out ->
                OutputStreamWriter(out, Charsets.UTF_8).use { writer ->
                    writer.write(json)
                }
            }
            Toast.makeText(this, getString(R.string.merge_export_button) + " 已保存", Toast.LENGTH_SHORT).show()
        }.onFailure {
            Toast.makeText(this, "保存失败: ${it.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private val openDocumentLauncher = registerForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri ?: return@registerForActivityResult
        runCatching {
            contentResolver.openInputStream(uri)?.use { input ->
                val json = input.bufferedReader(Charsets.UTF_8).readText()
                viewModel.importFromJson(json)
            } ?: Toast.makeText(this, "无法读取文件", Toast.LENGTH_SHORT).show()
        }.onFailure {
            Toast.makeText(this, "读取文件失败: ${it.message}", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMergeBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        binding.exportButton.setOnClickListener {
            viewModel.exportToJson { json ->
                pendingExportJson = json
                val name = String.format(
                    getString(R.string.merge_export_filename),
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss", Locale.getDefault()))
                )
                createDocumentLauncher.launch(name)
            }
        }

        binding.importButton.setOnClickListener {
            openDocumentLauncher.launch(arrayOf("application/json", "text/plain"))
        }

        binding.deleteAllButton.setOnClickListener { showDeleteConfirmDialog() }

        lifecycleScope.launch {
            viewModel.isExporting
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { exporting ->
                    binding.exportButton.isEnabled = !exporting
                    binding.exportButton.text = if (exporting) getString(R.string.merge_exporting) else getString(R.string.merge_export_button)
                }
        }
        lifecycleScope.launch {
            viewModel.isImporting
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { importing ->
                    binding.importButton.isEnabled = !importing
                    binding.importButton.text = if (importing) getString(R.string.merge_importing) else getString(R.string.merge_import_button)
                }
        }
        lifecycleScope.launch {
            viewModel.message
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { msg ->
                    if (!msg.isNullOrEmpty()) {
                        binding.mergeMessage.visibility = View.VISIBLE
                        binding.mergeMessage.text = msg
                        binding.mergeMessage.setTextColor(ContextCompat.getColor(this@MergeActivity, android.R.color.holo_green_dark))
                        viewModel.clearMessage()
                    } else {
                        binding.mergeMessage.visibility = View.GONE
                    }
                }
        }
        lifecycleScope.launch {
            viewModel.importResult
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { result ->
                    if (result != null) {
                        binding.importResultText.visibility = View.VISIBLE
                        binding.importResultText.text = "新增 %d 条，跳过重复 %d 条".format(result.imported, result.duplicates) +
                            if (result.errors.isEmpty()) "" else "\n错误: ${result.errors.joinToString("；")}"
                        viewModel.clearImportResult()
                    }
                }
        }
        lifecycleScope.launch {
            viewModel.isDeleting
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { deleting ->
                    binding.deleteAllButton.isEnabled = !deleting
                    binding.deleteAllButton.text = if (deleting) getString(R.string.merge_deleting) else getString(R.string.merge_delete_button)
                }
        }
        lifecycleScope.launch {
            viewModel.deleteCompleted
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { result ->
                    if (result != null) {
                        Toast.makeText(this@MergeActivity, getString(R.string.merge_delete_success), Toast.LENGTH_SHORT).show()
                        viewModel.clearDeleteCompleted()
                        finish()
                    }
                }
        }
    }

    private fun showDeleteConfirmDialog() {
        val editText = EditText(this).apply {
            hint = getString(R.string.merge_delete_dialog_confirm_hint)
            setPadding(48, 32, 48, 32)
        }
        val dialog = AlertDialog.Builder(this)
            .setTitle(R.string.merge_delete_dialog_title)
            .setMessage(getString(R.string.merge_delete_dialog_warning))
            .setView(editText)
            .setPositiveButton(getString(android.R.string.ok), null)
            .setNegativeButton(getString(R.string.delete_confirm_cancel), null)
            .create()
        dialog.setOnShowListener {
            val ok = dialog.getButton(AlertDialog.BUTTON_POSITIVE)
            ok.isEnabled = editText.text.toString() == getString(R.string.merge_delete_confirm_phrase)
            ok.setTextColor(ContextCompat.getColor(this, android.R.color.holo_red_dark))
            editText.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    ok.isEnabled = s?.toString() == getString(R.string.merge_delete_confirm_phrase)
                }
                override fun afterTextChanged(s: android.text.Editable?) {}
            })
            ok.setOnClickListener {
                if (editText.text.toString() == getString(R.string.merge_delete_confirm_phrase)) {
                    dialog.dismiss()
                    viewModel.deleteAllData()
                }
            }
        }
        dialog.show()
    }
}
