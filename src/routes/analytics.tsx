import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { isAuthenticated } from '@/lib/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { ExpenseIncomeChart } from '@/components/analytics/expense-income-chart'
import { CategoryBreakdownChart } from '@/components/analytics/category-breakdown-chart'
import { MonthlyComparisonChart } from '@/components/analytics/monthly-comparison-chart'
import { TrendsChart } from '@/components/analytics/trends-chart'
import { ExportButtons } from '@/components/analytics/export-buttons'
import { useAnalyticsSummary } from '@/lib/queries/analytics'
import { formatCurrency } from '@/lib/utils'
import type { TransactionType } from '@/types'

export const Route = createFileRoute('/analytics')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const now = new Date()
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month')
  const [startDate, setStartDate] = useState<string>(
    format(startOfMonth(now), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(now), 'yyyy-MM-dd'))
  const [categoryType, setCategoryType] = useState<TransactionType | 'all'>('all')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')

  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod)
    const today = new Date()

    switch (newPeriod) {
      case 'week':
        setStartDate(format(startOfWeek(today), 'yyyy-MM-dd'))
        setEndDate(format(endOfWeek(today), 'yyyy-MM-dd'))
        break
      case 'month':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'))
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'))
        break
      case 'quarter':
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
        const quarterEnd = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0)
        setStartDate(format(quarterStart, 'yyyy-MM-dd'))
        setEndDate(format(quarterEnd, 'yyyy-MM-dd'))
        break
      case 'year':
        setStartDate(format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'))
        setEndDate(format(new Date(today.getFullYear(), 11, 31), 'yyyy-MM-dd'))
        break
      case 'custom':
        // Keep current dates
        break
    }
  }

  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(startDate, endDate)

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              Visualize suas finanças com gráficos e análises
            </p>
          </div>
          <ExportButtons
            filter={{
              start_date: startDate,
              end_date: endDate,
            }}
          />
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={period} onValueChange={(v) => handlePeriodChange(v as typeof period)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                    <SelectItem value="quarter">Trimestre</SelectItem>
                    <SelectItem value="year">Ano</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {period === 'custom' && (
                <>
                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Agrupar por</Label>
                <Select
                  value={groupBy}
                  onValueChange={(v) => setGroupBy(v as typeof groupBy)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Dia</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summaryLoading ? '...' : formatCurrency(summary?.income || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summaryLoading ? '...' : formatCurrency(summary?.expenses || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  (summary?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {summaryLoading ? '...' : formatCurrency(summary?.balance || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <Tabs defaultValue="expense-income" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="expense-income">Receitas vs Despesas</TabsTrigger>
            <TabsTrigger value="category">Por Categoria</TabsTrigger>
            <TabsTrigger value="monthly">Comparação Mensal</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>

          <TabsContent value="expense-income" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Receitas vs Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseIncomeChart startDate={startDate} endDate={endDate} groupBy={groupBy} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="category" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Breakdown por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Tipo</Label>
                  <Select
                    value={categoryType}
                    onValueChange={(v) => setCategoryType(v as typeof categoryType)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Receitas</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CategoryBreakdownChart
                  startDate={startDate}
                  endDate={endDate}
                  type={categoryType !== 'all' ? categoryType : undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparação Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyComparisonChart months={6} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendsChart startDate={startDate} endDate={endDate} groupBy={groupBy} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}

