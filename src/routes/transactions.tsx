import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { isAuthenticated } from '@/lib/api/client'
import { useTransactions, useDeleteTransaction } from '@/lib/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useState } from 'react'
import { Trash2, ArrowUpCircle, ArrowDownCircle, Filter, X } from 'lucide-react'
import { useAccounts, useCategories } from '@/lib/queries'
import type { TransactionType } from '@/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export const Route = createFileRoute('/transactions')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: TransactionsPage,
})

function TransactionsPage() {
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  const { data: transactions, isLoading } = useTransactions({
    account_id: accountFilter !== 'all' ? accountFilter : undefined,
    category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  })

  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const deleteTransaction = useDeleteTransaction()

  const handleDelete = (id: string) => {
    setTransactionToDelete(id)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction.mutate(transactionToDelete)
      setTransactionToDelete(null)
    }
  }

  // Conta quantos filtros estão ativos
  const activeFiltersCount = [
    accountFilter !== 'all',
    categoryFilter !== 'all',
    typeFilter !== 'all',
    startDate !== '',
    endDate !== '',
  ].filter(Boolean).length

  const clearFilters = () => {
    setAccountFilter('all')
    setCategoryFilter('all')
    setTypeFilter('all')
    setStartDate('')
    setEndDate('')
  }

  // Componente de filtros reutilizável
  const FiltersContent = () => (
    <>
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full md:w-auto"
        >
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label>Conta</Label>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
      </div>
    </>
  )

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
            <p className="text-muted-foreground">
              Gerencie todas as suas transações
            </p>
          </div>
          {/* Botão de filtros apenas no mobile */}
          <div className="md:hidden">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] max-w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Filtros visíveis no desktop/tablet */}
        <Card className="hidden md:block">
          <CardContent className="p-6">
            <div className="space-y-4">
              <FiltersContent />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                Carregando...
              </div>
            ) : transactions && transactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Nenhuma transação encontrada
              </div>
            ) : (
              <div className="divide-y">
                {transactions
                  ?.filter((t) => !t.deleted_at)
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">
                            {transaction.description || 'Sem descrição'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)} •{' '}
                            {categories?.find((c) => c.id === transaction.category_id)
                              ?.name || 'Sem categoria'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de confirmação */}
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Deletar transação"
          description="Tem certeza que deseja deletar esta transação? Esta ação não pode ser desfeita."
          confirmText="Deletar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          variant="destructive"
        />
      </div>
    </ProtectedLayout>
  )
}

