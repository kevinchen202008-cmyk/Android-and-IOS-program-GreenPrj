import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, Box, CircularProgress } from '@mui/material'
import { AppBar } from './components/common/AppBar'
import { HomePage } from './pages/HomePage'
import { PasswordSetupForm } from './components/auth/PasswordSetupForm'
import { LoginForm } from './components/auth/LoginForm'
import { ChangePasswordForm } from './components/auth/ChangePasswordForm'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { EntryList } from './components/accounting/EntryList'
import { CreateEntryForm } from './components/accounting/CreateEntryForm'
import { EditEntryForm } from './components/accounting/EditEntryForm'
import { InvoiceScanForm } from './components/accounting/InvoiceScanForm'
import { VoiceInputForm } from './components/accounting/VoiceInputForm'
import { SMSInputForm } from './components/accounting/SMSInputForm'
import { StatisticsPage } from './pages/StatisticsPage'
import { BudgetPage } from './pages/BudgetPage'
import { MergePage } from './pages/MergePage'
import { DataManagementPage } from './pages/DataManagementPage'
import { openDatabase, closeDatabase, handleDatabaseError } from './services/database'
import { initializeSessionManager, setOnSessionExpired } from './services/auth/session-manager'
import { useAuthStore } from './stores/auth-store'
import { useStatisticsStore } from './stores/statistics-store'
import { useAccountingStore } from './stores/accounting-store'
import { useBudgetStore } from './stores/budget-store'

function App() {
  const { checkPasswordStatus, checkAuthStatus, isPasswordSet, isAuthenticated } = useAuthStore()
  
  // Auto-refresh statistics when accounting entries change
  const { entries: accountingEntries } = useAccountingStore()
  const { refreshStatistics, summary } = useStatisticsStore()

  useEffect(() => {
    // Initialize database on app startup
    const initDatabase = async () => {
      try {
        await openDatabase()
        console.log('Database initialized successfully')
      } catch (error) {
        const dbError = handleDatabaseError(error)
        console.error('Failed to initialize database:', dbError)
      }
    }

    initDatabase()

    // Initialize session manager
    initializeSessionManager()
    setOnSessionExpired(() => {
      useAuthStore.getState().handleLogout()
    })

    // Check password and auth status
    checkPasswordStatus()
    checkAuthStatus()

    // Cleanup: close database on app unmount
    return () => {
      closeDatabase().catch((error) => {
        console.error('Error closing database:', error)
      })
    }
  }, [checkPasswordStatus, checkAuthStatus])

  // Auto-refresh statistics and budgets when accounting entries change
  const { loadBudgetStatuses } = useBudgetStore()

  useEffect(() => {
    if (summary && accountingEntries.length > 0 && isAuthenticated) {
      refreshStatistics()
      loadBudgetStatuses()
    }
  }, [accountingEntries.length, summary, refreshStatistics, loadBudgetStatuses, isAuthenticated])

  // Show loading while checking password status
  if (isPasswordSet === undefined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        {!isPasswordSet && (
          <Route path="/" element={<PasswordSetupForm />} />
        )}
        {isPasswordSet && !isAuthenticated && (
          <>
            <Route path="/login" element={<LoginForm />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* Protected routes */}
        {isAuthenticated && (
          <>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                      <HomePage />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                      <ChangePasswordForm />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                      <EntryList />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/create"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                      <CreateEntryForm />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/edit/:id"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                      <EditEntryForm />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/scan"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                      <InvoiceScanForm />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/voice"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                      <VoiceInputForm />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/sms"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                      <SMSInputForm />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <StatisticsPage />
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <BudgetPage />
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/merge"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <MergePage />
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-management"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar />
                    <DataManagementPage />
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Box>
  )
}

export default App
