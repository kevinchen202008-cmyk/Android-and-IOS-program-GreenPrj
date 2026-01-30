package com.greenprj.app.presentation

import android.graphics.Color
import android.os.Bundle
import androidx.core.content.ContextCompat
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.data.PieData
import com.github.mikephil.charting.data.PieDataSet
import com.github.mikephil.charting.data.PieEntry
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.github.mikephil.charting.formatter.PercentFormatter
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

        setupCharts()

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.stats.collectLatest { state ->
                    binding.totalAmountText.text = getString(R.string.amount_display_format, state.totalAmount.toFloat())
                    binding.emptyHintText.visibility = if (state.isEmpty) View.VISIBLE else View.GONE
                    breakdownAdapter.submitList(state.categoryBreakdown)
                    updateTrendChart(binding.trendBarChart, state.trendPoints)
                    updatePieChart(binding.categoryPieChart, state.categoryBreakdown)
                }
            }
        }
    }

    private fun setupCharts() {
        binding.trendBarChart.description.isEnabled = false
        binding.trendBarChart.setDrawGridBackground(false)
        binding.trendBarChart.xAxis.position = XAxis.XAxisPosition.BOTTOM
        binding.trendBarChart.axisRight.isEnabled = false
        binding.trendBarChart.legend.isEnabled = false

        binding.categoryPieChart.description.isEnabled = false
        binding.categoryPieChart.legend.isEnabled = true
        binding.categoryPieChart.setUsePercentValues(true)
    }

    private fun updateTrendChart(barChart: BarChart, points: List<com.greenprj.app.presentation.statistics.TrendPoint>) {
        val entries = points.mapIndexed { index, p -> BarEntry(index.toFloat(), p.value) }
        val dataSet = BarDataSet(entries, "").apply {
            color = ContextCompat.getColor(this@StatisticsActivity, android.R.color.holo_blue_dark)
            valueTextSize = 10f
        }
        barChart.data = BarData(dataSet)
        barChart.xAxis.valueFormatter = IndexAxisValueFormatter(points.map { it.label })
        barChart.xAxis.granularity = 1f
        barChart.xAxis.setAvoidFirstLastClipping(true)
        barChart.invalidate()
        barChart.animateY(300)
    }

    private fun updatePieChart(pieChart: PieChart, breakdown: List<com.greenprj.app.presentation.statistics.CategoryStat>) {
        if (breakdown.isEmpty()) {
            pieChart.data = null
            pieChart.invalidate()
            return
        }
        val categoryLabels = resources.getStringArray(R.array.category_labels)
        val categoryKeys = resources.getStringArray(R.array.category_keys)
        val labelMap = categoryKeys.zip(categoryLabels.toList()).toMap()
        val entries = breakdown.map { stat ->
            PieEntry(stat.amount.toFloat(), labelMap[stat.categoryKey] ?: stat.categoryKey)
        }
        val colors = listOf(
            Color.parseColor("#4CAF50"),
            Color.parseColor("#2196F3"),
            Color.parseColor("#FF9800"),
            Color.parseColor("#9C27B0")
        )
        val dataSet = PieDataSet(entries, "").apply {
            this.colors = colors
            valueTextSize = 12f
            valueFormatter = PercentFormatter(pieChart)
        }
        pieChart.data = PieData(dataSet)
        pieChart.invalidate()
        pieChart.animateY(300)
    }
}
