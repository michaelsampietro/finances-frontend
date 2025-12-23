import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useExpenseIncomeChart } from '@/lib/queries/analytics'
import { formatCurrency } from '@/lib/utils'

interface ExpenseIncomeChartProps {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
}

export function ExpenseIncomeChart({
  startDate,
  endDate,
  groupBy = 'day',
}: ExpenseIncomeChartProps) {
  const { data, isLoading } = useExpenseIncomeChart(startDate, endDate, groupBy)

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

  const chartData = data.map((item) => ({
    period: item.date,
    income: item.income,
    expenses: item.expenses,
  }))

  const config = {
    income: {
      label: 'Receitas',
      color: 'hsl(var(--chart-1))',
    },
    expenses: {
      label: 'Despesas',
      color: 'hsl(var(--chart-2))',
    },
  }

  return (
    <ChartContainer config={config} className="h-[400px]">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value: any, name: any) => [
                formatCurrency(Number(value)),
                config[name as keyof typeof config]?.label || name,
              ]}
            />
          }
        />
        <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Receitas" />
        <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="Despesas" />
      </BarChart>
    </ChartContainer>
  )
}

