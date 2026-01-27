import { Typography, Box, Button, Paper, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import AssessmentIcon from '@mui/icons-material/Assessment'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'

export function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        欢迎使用 GreenPrj
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        个人记账应用 - 快速记录，随时掌握
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => navigate('/accounting')}
          >
            <AccountBalanceIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              记账
            </Typography>
            <Typography variant="body2" color="text.secondary">
              快速记录消费，支持多种输入方式
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate('/accounting/create') }}>
                手动输入
              </Button>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate('/accounting/scan') }}>
                发票扫描
              </Button>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate('/accounting/voice') }}>
                语音输入
              </Button>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate('/accounting/sms') }}>
                短信解析
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => navigate('/statistics')}
          >
            <AssessmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              统计
            </Typography>
            <Typography variant="body2" color="text.secondary">
              查看消费趋势和类别占比
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => navigate('/budget')}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              预算
            </Typography>
            <Typography variant="body2" color="text.secondary">
              设置预算并监控执行情况
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          快速操作
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => navigate('/accounting/create')}>
            新建账目
          </Button>
          <Button variant="outlined" onClick={() => navigate('/accounting')}>
            查看账目列表
          </Button>
          <Button variant="outlined" onClick={() => navigate('/change-password')}>
            修改密码
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
