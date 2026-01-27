import { Container, Box, Typography, Grid } from '@mui/material'
import { ExportSection } from '@/components/merge/ExportSection'
import { ImportSection } from '@/components/merge/ImportSection'

export function MergePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        账本合并
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        导出或导入账本数据，支持跨平台数据合并和智能去重
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ExportSection />
        </Grid>
        <Grid item xs={12} md={6}>
          <ImportSection />
        </Grid>
      </Grid>
    </Container>
  )
}
