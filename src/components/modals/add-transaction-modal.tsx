import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useAccounts, useCategories, useCreateTransaction, useCreateTransfer, useCreateCategory } from '@/lib/queries'
import { format } from 'date-fns'
import { formatDateToISO } from '@/lib/utils'
import type { TransactionType } from '@/types'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  account_id: z.string().min(1, 'Conta é obrigatória'),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().optional(),
  date: z.string().optional(),
})

const transferSchema = z.object({
  from_account_id: z.string().min(1, 'Conta origem é obrigatória'),
  to_account_id: z.string().min(1, 'Conta destino é obrigatória'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().optional(),
  date: z.string().optional(),
})

type TransactionForm = z.infer<typeof transactionSchema>
type TransferForm = z.infer<typeof transferSchema>

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTransactionModal({ open, onOpenChange }: AddTransactionModalProps) {
  const [activeTab, setActiveTab] = useState<'transaction' | 'transfer'>('transaction')
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const createTransaction = useCreateTransaction()
  const createTransfer = useCreateTransfer()
  const createCategory = useCreateCategory()

  const transactionForm = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const transferForm = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const onTransactionSubmit = (data: TransactionForm) => {
    createTransaction.mutate(
      {
        ...data,
        date: data.date ? formatDateToISO(data.date) : new Date().toISOString(),
      },
      {
        onSuccess: () => {
          transactionForm.reset()
          onOpenChange(false)
        },
      }
    )
  }

  const onTransferSubmit = (data: TransferForm) => {
    if (data.from_account_id === data.to_account_id) {
      transferForm.setError('to_account_id', {
        message: 'As contas devem ser diferentes',
      })
      return
    }

    createTransfer.mutate(
      {
        ...data,
        date: data.date ? formatDateToISO(data.date) : new Date().toISOString(),
      },
      {
        onSuccess: () => {
          transferForm.reset()
          onOpenChange(false)
        },
      }
    )
  }

  const onCreateCategory = () => {
    if (!categorySearch.trim()) return

    createCategory.mutate(
      {
        name: categorySearch,
        color: '#3b82f6',
      },
      {
        onSuccess: () => {
          setCategorySearch('')
          setShowCreateCategory(false)
        },
      }
    )
  }

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  ) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100dvw] md:h-[90vh]">
        {/* Botão X maior no mobile, acima do header */}
        <div className="md:hidden flex justify-end mb-4 -mt-2 -mr-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <DialogHeader>
          <DialogTitle>Adicionar Transação ou Transferência</DialogTitle>
          <DialogDescription>
            Crie uma nova transação ou transferência entre contas
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transaction">Transação</TabsTrigger>
            <TabsTrigger value="transfer">Transferência</TabsTrigger>
          </TabsList>

          <TabsContent value="transaction" className="space-y-4">
            <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={transactionForm.watch('type')}
                  onValueChange={(value) =>
                    transactionForm.setValue('type', value as TransactionType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conta *</Label>
                <Select
                  value={transactionForm.watch('account_id')}
                  onValueChange={(value) => transactionForm.setValue('account_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {transactionForm.formState.errors.account_id && (
                  <p className="text-sm text-destructive">
                    {transactionForm.formState.errors.account_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Categoria *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar categoria..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    onFocus={() => setShowCreateCategory(true)}
                  />
                  {showCreateCategory && !filteredCategories.find((c) => c.name === categorySearch) && categorySearch && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCreateCategory}
                      disabled={createCategory.isPending}
                    >
                      Criar
                    </Button>
                  )}
                </div>
                <Select
                  value={transactionForm.watch('category_id')}
                  onValueChange={(value) => transactionForm.setValue('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {transactionForm.formState.errors.category_id && (
                  <p className="text-sm text-destructive">
                    {transactionForm.formState.errors.category_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...transactionForm.register('amount', { valueAsNumber: true })}
                />
                {transactionForm.formState.errors.amount && (
                  <p className="text-sm text-destructive">
                    {transactionForm.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Descrição da transação"
                  {...transactionForm.register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  {...transactionForm.register('date')}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createTransaction.isPending}
                  className="w-full sm:w-auto"
                >
                  {createTransaction.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4">
            <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Conta Origem *</Label>
                <Select
                  value={transferForm.watch('from_account_id')}
                  onValueChange={(value) => transferForm.setValue('from_account_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.type}) - {account.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {transferForm.formState.errors.from_account_id && (
                  <p className="text-sm text-destructive">
                    {transferForm.formState.errors.from_account_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Conta Destino *</Label>
                <Select
                  value={transferForm.watch('to_account_id')}
                  onValueChange={(value) => transferForm.setValue('to_account_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      ?.filter((acc) => acc.id !== transferForm.watch('from_account_id'))
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.type})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {transferForm.formState.errors.to_account_id && (
                  <p className="text-sm text-destructive">
                    {transferForm.formState.errors.to_account_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...transferForm.register('amount', { valueAsNumber: true })}
                />
                {transferForm.formState.errors.amount && (
                  <p className="text-sm text-destructive">
                    {transferForm.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Descrição da transferência"
                  {...transferForm.register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  {...transferForm.register('date')}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createTransfer.isPending}
                  className="w-full sm:w-auto"
                >
                  {createTransfer.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

