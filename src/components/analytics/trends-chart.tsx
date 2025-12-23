import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useTrends } from '@/lib/queries/analytics'
import { formatCurrency } from '@/lib/utils'

interface TrendsChartProps {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
}

export function TrendsChart({
  startDate,
  endDate,
  groupBy = 'day',
}: TrendsChartProps) {
  const { data, isLoading } = useTrends(startDate, endDate, groupBy)

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
    date: item.date,
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
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
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
        <Line
          type="monotone"
          dataKey="income"
          stroke="hsl(var(--chart-1))"
          name="Receitas"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="hsl(var(--chart-2))"
          name="Despesas"
          strokeWidth={2}
        />
      </LineChart>
    </ChartContainer>
  )
}

