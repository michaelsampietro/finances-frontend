import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { isAuthenticated } from '@/lib/api/client'
import {
  useBudgets,
  useBudgetStatus,
  useCreateBudget,
  useDeleteBudget,
} from '@/lib/queries'
import { useCategories } from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatCurrency, formatDate, formatDateToISO } from '@/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2, Plus } from 'lucide-react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import type { BudgetPeriod } from '@/types'

const budgetSchema = z.object({
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  period: z.enum(['monthly', 'yearly']),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de fim é obrigatória'),
})

type BudgetForm = z.infer<typeof budgetSchema>

export const Route = createFileRoute('/budgets')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: BudgetsPage,
})

function BudgetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)
  const { data: budgets } = useBudgets()
  const { data: categories } = useCategories()
  const createBudget = useCreateBudget()
  const deleteBudget = useDeleteBudget()

  const form = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly',
      start_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    },
  })

  const onSubmit = (data: BudgetForm) => {
    createBudget.mutate({
      ...data,
      start_date: formatDateToISO(data.start_date),
      end_date: formatDateToISO(data.end_date),
    }, {
      onSuccess: () => {
        form.reset()
        setDialogOpen(false)
      },
    })
  }

  const handleDelete = (id: string) => {
    setBudgetToDelete(id)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget.mutate(budgetToDelete)
      setBudgetToDelete(null)
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
            <p className="text-muted-foreground">
              Gerencie seus orçamentos por categoria
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Orçamento</DialogTitle>
                <DialogDescription>
                  Defina um valor máximo para uma categoria
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select
                    value={form.watch('category_id')}
                    onValueChange={(value) => form.setValue('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category_id && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.category_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('amount', { valueAsNumber: true })}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Período *</Label>
                  <Select
                    value={form.watch('period')}
                    onValueChange={(value) => {
                      form.setValue('period', value as BudgetPeriod)
                      const now = new Date()
                      if (value === 'monthly') {
                        form.setValue('start_date', format(startOfMonth(now), 'yyyy-MM-dd'))
                        form.setValue('end_date', format(endOfMonth(now), 'yyyy-MM-dd'))
                      } else {
                        form.setValue('start_date', format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'))
                        form.setValue('end_date', format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd'))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Início *</Label>
                  <Input
                    type="date"
                    {...form.register('start_date')}
                  />
                  {form.formState.errors.start_date && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.start_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Data Fim *</Label>
                  <Input
                    type="date"
                    {...form.register('end_date')}
                  />
                  {form.formState.errors.end_date && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.end_date.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createBudget.isPending} className="w-full sm:w-auto">
                    {createBudget.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {budgets?.filter((b) => !b.deleted_at).map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {budgets?.filter((b) => !b.deleted_at).length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum orçamento criado ainda
            </CardContent>
          </Card>
        )}

        {/* Dialog de confirmação */}
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Deletar orçamento"
          description="Tem certeza que deseja deletar este orçamento? Esta ação não pode ser desfeita."
          confirmText="Deletar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          variant="destructive"
        />
      </div>
    </ProtectedLayout>
  )
}

function BudgetCard({
  budget,
  onDelete,
}: {
  budget: { id: string; category_id: string; amount: number; period: BudgetPeriod; start_date: string; end_date: string }
  onDelete: (id: string) => void
}) {
  const { data: status, isLoading } = useBudgetStatus(budget.id)
  const { data: categories } = useCategories()
  const category = categories?.find((c) => c.id === budget.category_id)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  const percentage = status?.percentage || 0
  const spent = status?.spent || 0
  const remaining = status?.remaining || budget.amount

  const getProgressColor = () => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{category?.name || 'Sem categoria'}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(budget.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Orçamento</span>
            <span className="font-semibold">{formatCurrency(budget.amount)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Gasto</span>
            <span className="font-semibold">{formatCurrency(spent)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Restante</span>
            <span
              className={`font-semibold ${
                remaining >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              {budget.period === 'monthly' ? 'Mensal' : 'Anual'}
            </span>
            <span className="font-semibold">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
        </div>
      </CardContent>
    </Card>
  )
}

