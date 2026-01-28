import { Container, Typography, Grid, Divider } from '@mui/material'
import { DataExportSection } from '@/components/data-management/DataExportSection'
import { DataImportSection } from '@/components/data-management/DataImportSection'
import { DataDeletionSection } from '@/components/data-management/DataDeletionSection'

export function DataManagementPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        数据管理
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        备份、恢复和管理账本数据，确保数据安全
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DataExportSection />
        </Grid>

        <Grid item xs={12}>
          <DataImportSection />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <DataDeletionSection />
        </Grid>
      </Grid>
    </Container>
  )
}
