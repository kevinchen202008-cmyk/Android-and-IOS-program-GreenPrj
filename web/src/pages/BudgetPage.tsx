import { useEffect } from 'react'
import { Container, Box, Typography, Grid, Alert, CircularProgress } from '@mui/material'
import { useBudgetStore } from '@/stores/budget-store'
import { BudgetSettings } from '@/components/budget/BudgetSettings'
import { BudgetStatusCard } from '@/components/budget/BudgetStatusCard'

export function BudgetPage() {
  const {
    monthlyStatus,
    yearlyStatus,
    isLoading,
    error,
    loadBudgetStatuses,
    clearError,
  } = useBudgetStore()

  useEffect(() => {
    loadBudgetStatuses()
  }, [loadBudgetStatuses])

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        预算管理
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Budget Status Cards */}
        {monthlyStatus && (
          <Grid item xs={12} md={6}>
            <BudgetStatusCard status={monthlyStatus} title="月度预算" />
          </Grid>
        )}

        {yearlyStatus && (
          <Grid item xs={12} md={6}>
            <BudgetStatusCard status={yearlyStatus} title="年度预算" />
          </Grid>
        )}

        {/* Budget Settings */}
        <Grid item xs={12}>
          <BudgetSettings />
        </Grid>
      </Grid>
    </Container>
  )
}
