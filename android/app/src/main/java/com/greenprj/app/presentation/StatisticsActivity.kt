package com.greenprj.app.presentation

import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.greenprj.app.R
import com.greenprj.app.data.security.SessionManager
import com.greenprj.app.databinding.ActivityStatisticsBinding
import com.greenprj.app.presentation.statistics.CategoryBreakdownAdapter
import com.greenprj.app.presentation.statistics.StatisticsPeriod
import com.greenprj.app.presentation.statistics.StatisticsViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * 统计页：按时间维度（今日/本周/本月/本年）显示消费合计与类别占比。
 * 仅在有有效会话时由 MainActivity 启动。
 */
@AndroidEntryPoint
class StatisticsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityStatisticsBinding
    private val viewModel: StatisticsViewModel by viewModels()

    @Inject
    lateinit var sessionManager: SessionManager

    private lateinit var breakdownAdapter: CategoryBreakdownAdapter
    private var categoryLabels: Array<String> = emptyArray()
    private var categoryKeys: Array<String> = emptyArray()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (!sessionManager.isSessionValid()) {
            finish()
            return
        }
        binding = ActivityStatisticsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        categoryKeys = resources.getStringArray(R.array.category_keys)
        categoryLabels = resources.getStringArray(R.array.category_labels)
        val categoryMap = categoryKeys.zip(categoryLabels).toMap()

        breakdownAdapter = CategoryBreakdownAdapter(categoryMap)
        binding.categoryRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.categoryRecyclerView.adapter = breakdownAdapter

        val periodLabels = arrayOf(
            getString(R.string.statistics_period_today),
            getString(R.string.statistics_period_week),
            getString(R.string.statistics_period_month),
            getString(R.string.statistics_period_year)
        )
        binding.periodSpinner.adapter = android.widget.ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            periodLabels
        ).apply { setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item) }
        binding.periodSpinner.setSelection(StatisticsPeriod.MONTH.ordinal)
        binding.periodSpinner.setOnItemSelectedListener(object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                viewModel.setPeriod(StatisticsPeriod.entries[position])
            }
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        })

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.stats.collectLatest { state ->
                    binding.totalAmountText.text = getString(R.string.amount_display_format, state.totalAmount.toFloat())
                    binding.emptyHintText.visibility = if (state.isEmpty) View.VISIBLE else View.GONE
                    breakdownAdapter.submitList(state.categoryBreakdown)
                }
            }
        }
    }
}
