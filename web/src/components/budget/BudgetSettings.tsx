import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useBudgetStore } from '@/stores/budget-store'
import type { BudgetType } from '@/types/budget'

export function BudgetSettings() {
  const {
    monthlyBudget,
    yearlyBudget,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    loadCurrentBudgets,
    clearError,
  } = useBudgetStore()

  const [monthlyAmount, setMonthlyAmount] = useState<string>('')
  const [yearlyAmount, setYearlyAmount] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<{ id: string; type: BudgetType; amount: number } | null>(null)
  const [editAmount, setEditAmount] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    loadCurrentBudgets()
  }, [loadCurrentBudgets])

  useEffect(() => {
    if (monthlyBudget) {
      setMonthlyAmount(monthlyBudget.amount.toString())
    }
    if (yearlyBudget) {
      setYearlyAmount(yearlyBudget.amount.toString())
    }
  }, [monthlyBudget, yearlyBudget])

  const handleCreateMonthlyBudget = async () => {
    try {
      clearError()
      setSuccessMessage('')
      await createBudget({
        type: 'monthly',
        year: selectedYear,
        month: selectedMonth,
        amount: parseFloat(monthlyAmount),
      })
      setSuccessMessage('月度预算设置成功')
      setMonthlyAmount('')
    } catch (err) {
      // Error handled by store
    }
  }

  const handleCreateYearlyBudget = async () => {
    try {
      clearError()
      setSuccessMessage('')
      await createBudget({
        type: 'yearly',
        year: selectedYear,
        amount: parseFloat(yearlyAmount),
      })
      setSuccessMessage('年度预算设置成功')
      setYearlyAmount('')
    } catch (err) {
      // Error handled by store
    }
  }

  const handleEdit = (budget: { id: string; type: BudgetType; amount: number }) => {
    setEditingBudget(budget)
    setEditAmount(budget.amount.toString())
    setEditDialogOpen(true)
  }

  const handleUpdateBudget = async () => {
    if (!editingBudget) return

    try {
      clearError()
      setSuccessMessage('')
      await updateBudget(editingBudget.id, { amount: parseFloat(editAmount) })
      setSuccessMessage('预算更新成功')
      setEditDialogOpen(false)
      setEditingBudget(null)
      setEditAmount('')
    } catch (err) {
      // Error handled by store
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除此预算吗？')) return

    try {
      clearError()
      setSuccessMessage('')
      await deleteBudget(id)
      setSuccessMessage('预算删除成功')
    } catch (err) {
      // Error handled by store
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        预算设置
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Monthly Budget */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              月度预算
            </Typography>
            {monthlyBudget ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1">
                    {monthlyBudget.year}年{monthlyBudget.month}月: ¥{monthlyBudget.amount.toFixed(2)}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit({ id: monthlyBudget.id, type: 'monthly', amount: monthlyBudget.amount })}
                      title="编辑"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(monthlyBudget.id)}
                      title="删除"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="年份"
                    type="number"
                    size="small"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    select
                    label="月份"
                    size="small"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    sx={{ width: 120 }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}月
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <TextField
                  label="预算金额"
                  type="number"
                  fullWidth
                  size="small"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleCreateMonthlyBudget}
                  disabled={isLoading || !monthlyAmount || parseFloat(monthlyAmount) <= 0}
                  fullWidth
                >
                  设置月度预算
                </Button>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Yearly Budget */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              年度预算
            </Typography>
            {yearlyBudget ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1">
                    {yearlyBudget.year}年: ¥{yearlyBudget.amount.toFixed(2)}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit({ id: yearlyBudget.id, type: 'yearly', amount: yearlyBudget.amount })}
                      title="编辑"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(yearlyBudget.id)}
                      title="删除"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box>
                <TextField
                  label="年份"
                  type="number"
                  fullWidth
                  size="small"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="预算金额"
                  type="number"
                  fullWidth
                  size="small"
                  value={yearlyAmount}
                  onChange={(e) => setYearlyAmount(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleCreateYearlyBudget}
                  disabled={isLoading || !yearlyAmount || parseFloat(yearlyAmount) <= 0}
                  fullWidth
                >
                  设置年度预算
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>编辑预算</DialogTitle>
        <DialogContent>
          <TextField
            label="预算金额"
            type="number"
            fullWidth
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleUpdateBudget}
            variant="contained"
            disabled={!editAmount || parseFloat(editAmount) <= 0}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
