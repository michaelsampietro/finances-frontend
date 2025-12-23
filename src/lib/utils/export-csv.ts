import { formatCurrency, formatDate } from '@/lib/utils'

export function exportTransactionsToCSV() {
  // This would need to be called from a component that has access to the query
  // For now, we'll create a helper that can be used with the transactions data
  return (transactions: Array<{
    description: string
    amount: number
    type: string
    date: string
    category_id?: string
  }>) => {
    const headers = ['Data', 'Descrição', 'Tipo', 'Valor', 'Categoria']
    const rows = transactions.map((t) => [
      formatDate(t.date),
      t.description || '',
      t.type === 'income' ? 'Receita' : 'Despesa',
      formatCurrency(t.amount),
      t.category_id || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

