import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useMonthlyComparison } from '@/lib/queries/analytics'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MonthlyComparisonChartProps {
  months?: number
}

export function MonthlyComparisonChart({ months = 6 }: MonthlyComparisonChartProps) {
  const { data, isLoading } = useMonthlyComparison(months)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        Nenhum dado disponível
      </div>
    )
  }

  const chartData = data.map((item) => {
    const date = new Date(item.month + '-01')
    return {
      month: format(date, 'MMM yyyy', { locale: ptBR }),
      income: item.income,
      expenses: item.expenses,
      balance: item.balance,
    }
  })

  const config = {
    income: {
      label: 'Receitas',
      color: 'hsl(var(--chart-1))',
    },
    expenses: {
      label: 'Despesas',
      color: 'hsl(var(--chart-2))',
    },
    balance: {
      label: 'Saldo',
      color: 'hsl(var(--chart-3))',
    },
  }

  return (
    <ChartContainer config={config} className="h-[400px]">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value: any, name: any) => `${config[name as keyof typeof config]?.label || name}: ${formatCurrency(Number(value))}`}
            />
          }
        />
        <Legend />
        <Bar
          dataKey="income"
          fill="green"
          name="Receitas"
        />
        <Bar
          dataKey="expenses"
          fill="red"
          name="Despesas"
        />
      </BarChart>
    </ChartContainer>
  )
}

