import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { isAuthenticated } from '@/lib/api/client'
import { useTransactions } from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const now = new Date()
  const weekStart = startOfWeek(now, { locale: ptBR })
  const weekEnd = endOfWeek(now, { locale: ptBR })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const { data: weekTransactions, isLoading: weekLoading } = useTransactions({
    start_date: format(weekStart, 'yyyy-MM-dd'),
    end_date: format(weekEnd, 'yyyy-MM-dd'),
  })

  const { data: monthTransactions, isLoading: monthLoading } = useTransactions({
    start_date: format(monthStart, 'yyyy-MM-dd'),
    end_date: format(monthEnd, 'yyyy-MM-dd'),
  })

  const weekIncome =
    weekTransactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 0
  const weekExpenses =
    weekTransactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0
  const weekBalance = weekIncome - weekExpenses

  const monthIncome =
    monthTransactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 0
  const monthExpenses =
    monthTransactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0
  const monthBalance = monthIncome - monthExpenses

  const recentTransactions = monthTransactions
    ?.filter((t) => !t.deleted_at)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10) || []

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>

        {/* Métricas - Mobile/Tablet com Tabs, Desktop lado a lado */}
        <div>
          {/* Mobile/Tablet: Tabs */}
          <Tabs defaultValue="week" className="lg:hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>
            <TabsContent value="week" className="mt-4">
              <MetricsCards
                title="Semana Atual"
                income={weekIncome}
                expenses={weekExpenses}
                balance={weekBalance}
                isLoading={weekLoading}
              />
            </TabsContent>
            <TabsContent value="month" className="mt-4">
              <MetricsCards
                title="Mês Atual"
                income={monthIncome}
                expenses={monthExpenses}
                balance={monthBalance}
                isLoading={monthLoading}
              />
            </TabsContent>
          </Tabs>

          {/* Desktop: Lado a lado */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Semana Atual</h3>
              <MetricsCards
                title=""
                income={weekIncome}
                expenses={weekExpenses}
                balance={weekBalance}
                isLoading={weekLoading}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Mês Atual</h3>
              <MetricsCards
                title=""
                income={monthIncome}
                expenses={monthExpenses}
                balance={monthBalance}
                isLoading={monthLoading}
              />
            </div>
          </div>
        </div>

        {/* Transações Recentes */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Transações Recentes</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentTransactions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Nenhuma transação encontrada
                  </div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{transaction.description || 'Sem descrição'}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}

function MetricsCards({
  income,
  expenses,
  balance,
  isLoading,
}: {
  title: string
  income: number
  expenses: number
  balance: number
  isLoading: boolean
}) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div 
            className="text-2xl lg:text-xl xl:text-lg font-bold text-green-600 break-words"
            style={{
              fontSize: 'clamp(1.125rem, 2.5vw + 0.5rem, 1.5rem)',
            }}
          >
            {isLoading ? '...' : formatCurrency(income)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div 
            className="text-2xl lg:text-xl xl:text-lg font-bold text-red-600 break-words"
            style={{
              fontSize: 'clamp(1.125rem, 2.5vw + 0.5rem, 1.5rem)',
            }}
          >
            {isLoading ? '...' : formatCurrency(expenses)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl lg:text-xl xl:text-lg font-bold break-words ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
            style={{
              fontSize: 'clamp(1.125rem, 2.5vw + 0.5rem, 1.5rem)',
            }}
          >
            {isLoading ? '...' : formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

