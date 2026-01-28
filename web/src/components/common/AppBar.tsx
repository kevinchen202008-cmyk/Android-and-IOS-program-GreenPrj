import { AppBar as MuiAppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

export function AppBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { handleLogout } = useAuthStore()

  const handleLogoutClick = () => {
    handleLogout()
    navigate('/login')
  }

  const isAccountingPage = location.pathname.startsWith('/accounting')
  const isStatisticsPage = location.pathname.startsWith('/statistics')
  const isBudgetPage = location.pathname.startsWith('/budget')
  const isMergePage = location.pathname.startsWith('/merge')
  const isDataManagementPage = location.pathname.startsWith('/data-management')
  const isOperationLogsPage = location.pathname.startsWith('/operation-logs')

  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          GreenPrj
        </Typography>
        <Box>
          {!isAccountingPage && (
            <Button color="inherit" onClick={() => navigate('/accounting')} sx={{ mr: 1 }}>
              记账
            </Button>
          )}
          {!isStatisticsPage && (
            <Button color="inherit" onClick={() => navigate('/statistics')} sx={{ mr: 1 }}>
              统计
            </Button>
          )}
          {!isBudgetPage && (
            <Button color="inherit" onClick={() => navigate('/budget')} sx={{ mr: 1 }}>
              预算
            </Button>
          )}
          {!isMergePage && (
            <Button color="inherit" onClick={() => navigate('/merge')} sx={{ mr: 1 }}>
              合并
            </Button>
          )}
          {!isDataManagementPage && (
            <Button color="inherit" onClick={() => navigate('/data-management')} sx={{ mr: 1 }}>
              数据
            </Button>
          )}
          {!isOperationLogsPage && (
            <Button color="inherit" onClick={() => navigate('/operation-logs')} sx={{ mr: 1 }}>
              日志
            </Button>
          )}
          <Button color="inherit" onClick={() => navigate('/change-password')} sx={{ mr: 1 }}>
            修改密码
          </Button>
          <Button color="inherit" onClick={handleLogoutClick}>
            退出
          </Button>
        </Box>
      </Toolbar>
    </MuiAppBar>
  )
}
