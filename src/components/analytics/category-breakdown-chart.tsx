import { PieChart, Pie, Cell, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAnalyticsByCategory } from '@/lib/queries/analytics'
import { formatCurrency } from '@/lib/utils'
import type { TransactionType } from '@/types'

interface CategoryBreakdownChartProps {
  startDate: string
  endDate: string
  type?: TransactionType
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function CategoryBreakdownChart({
  startDate,
  endDate,
  type,
}: CategoryBreakdownChartProps) {
  const { data, isLoading } = useAnalyticsByCategory(startDate, endDate, type)

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

  // Top 10 categorias
  const topCategories = data.slice(0, 10)

  const chartData = topCategories.map((item) => ({
    name: item.category_name,
    value: item.total,
  }))

  return (
    <ChartContainer
      config={{
        value: {
          label: 'Valor',
        },
      }}
      className="h-[400px]"
    >
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value: any) => formatCurrency(Number(value))}
            />
          }
        />
        <Legend />
      </PieChart>
    </ChartContainer>
  )
}

