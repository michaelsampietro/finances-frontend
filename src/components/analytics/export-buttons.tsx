import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useTransactions } from '@/lib/queries'
import type { TransactionFilter } from '@/types'
import { exportTransactionsToCSV } from '@/lib/utils/export-csv'

interface ExportButtonsProps {
  filter?: TransactionFilter
}

export function ExportButtons({ filter }: ExportButtonsProps) {
  const { data: transactions } = useTransactions(filter)

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      return
    }
    const exportFn = exportTransactionsToCSV(filter)
    exportFn(
      transactions.map((t) => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: t.date,
        category_id: t.category_id,
      }))
    )
  }

  return (
    <Button onClick={handleExportCSV} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exportar CSV
    </Button>
  )
}

