import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { isAuthenticated } from '@/lib/api/client'
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useTransfers,
  useDeleteTransfer,
} from '@/lib/queries'
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
import { Trash2, Plus, Edit, ArrowRightLeft } from 'lucide-react'
import { useCreateTransfer } from '@/lib/queries'
import type { AccountType } from '@/types'
import { format } from 'date-fns'

const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['checking', 'savings', 'credit', 'other']),
  balance: z.number().min(0, 'Saldo não pode ser negativo').default(0),
})

const transferSchema = z.object({
  from_account_id: z.string().min(1, 'Conta origem é obrigatória'),
  to_account_id: z.string().min(1, 'Conta destino é obrigatória'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().optional(),
  date: z.string().optional(),
})

type AccountForm = z.infer<typeof accountSchema>
type TransferForm = z.infer<typeof transferSchema>

export const Route = createFileRoute('/accounts')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: AccountsPage,
})

function AccountsPage() {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [confirmDeleteAccountOpen, setConfirmDeleteAccountOpen] = useState(false)
  const [confirmDeleteTransferOpen, setConfirmDeleteTransferOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [transferToDelete, setTransferToDelete] = useState<string | null>(null)

  const { data: accounts } = useAccounts()
  const { data: transfers } = useTransfers()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()
  const createTransfer = useCreateTransfer()
  const deleteTransfer = useDeleteTransfer()

  const accountForm = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: 'checking',
      balance: 0,
    },
  })

  const transferForm = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const onAccountSubmit = (data: AccountForm) => {
    if (editingAccount) {
      updateAccount.mutate(
        { id: editingAccount, data },
        {
          onSuccess: () => {
            accountForm.reset()
            setEditingAccount(null)
            setAccountDialogOpen(false)
          },
        }
      )
    } else {
      createAccount.mutate(data, {
        onSuccess: () => {
          accountForm.reset()
          setAccountDialogOpen(false)
        },
      })
    }
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
          setTransferDialogOpen(false)
        },
      }
    )
  }

  const handleEdit = (account: { id: string; name: string; type: AccountType; balance: number }) => {
    setEditingAccount(account.id)
    accountForm.reset({
      name: account.name,
      type: account.type,
      balance: account.balance,
    })
    setAccountDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAccountToDelete(id)
    setConfirmDeleteAccountOpen(true)
  }

  const handleDeleteTransfer = (id: string) => {
    setTransferToDelete(id)
    setConfirmDeleteTransferOpen(true)
  }

  const confirmDeleteAccount = () => {
    if (accountToDelete) {
      deleteAccount.mutate(accountToDelete)
      setAccountToDelete(null)
    }
  }

  const confirmDeleteTransfer = () => {
    if (transferToDelete) {
      deleteTransfer.mutate(transferToDelete)
      setTransferToDelete(null)
    }
  }

  const getAccountTypeLabel = (type: AccountType) => {
    const labels: Record<AccountType, string> = {
      checking: 'Corrente',
      savings: 'Poupança',
      credit: 'Crédito',
      other: 'Outro',
    }
    return labels[type]
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header: título/descrição em uma linha, botões em outra no mobile */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
            <p className="text-muted-foreground">
              Gerencie suas contas bancárias e transferências
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transferência
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Transferência</DialogTitle>
                  <DialogDescription>
                    Transfira dinheiro entre suas contas
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={transferForm.handleSubmit(onTransferSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Conta Origem *</Label>
                    <Select
                      value={transferForm.watch('from_account_id')}
                      onValueChange={(value) =>
                        transferForm.setValue('from_account_id', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} - {formatCurrency(account.balance)}
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
                      onValueChange={(value) =>
                        transferForm.setValue('to_account_id', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          ?.filter(
                            (acc) => acc.id !== transferForm.watch('from_account_id')
                          )
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
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
                      onClick={() => setTransferDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createTransfer.isPending} className="w-full sm:w-auto">
                      {createTransfer.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingAccount ? 'Editar Conta' : 'Nova Conta'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAccount
                      ? 'Atualize os dados da conta'
                      : 'Adicione uma nova conta bancária'}
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={accountForm.handleSubmit(onAccountSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      placeholder="Nome da conta"
                      {...accountForm.register('name')}
                    />
                    {accountForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {accountForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select
                      value={accountForm.watch('type')}
                      onValueChange={(value) =>
                        accountForm.setValue('type', value as AccountType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Corrente</SelectItem>
                        <SelectItem value="savings">Poupança</SelectItem>
                        <SelectItem value="credit">Crédito</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Saldo Inicial</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...accountForm.register('balance', { valueAsNumber: true })}
                    />
                    {accountForm.formState.errors.balance && (
                      <p className="text-sm text-destructive">
                        {accountForm.formState.errors.balance.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAccountDialogOpen(false)
                        setEditingAccount(null)
                        accountForm.reset()
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAccount.isPending || updateAccount.isPending}
                      className="w-full sm:w-auto"
                    >
                      {createAccount.isPending || updateAccount.isPending
                        ? 'Salvando...'
                        : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de Contas */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {accounts?.filter((a) => !a.deleted_at).map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{account.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo</span>
                    <span className="font-medium">
                      {getAccountTypeLabel(account.type)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saldo</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transferências Recentes */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Transferências Recentes</h3>
          <Card>
            <CardContent className="p-0">
              {transfers && transfers.filter((t) => !t.deleted_at).length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Nenhuma transferência encontrada
                </div>
              ) : (
                <div className="divide-y">
                  {transfers
                    ?.filter((t) => !t.deleted_at)
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .slice(0, 10)
                    .map((transfer) => {
                      const fromAccount = accounts?.find(
                        (a) => a.id === transfer.from_account_id
                      )
                      const toAccount = accounts?.find(
                        (a) => a.id === transfer.to_account_id
                      )

                      return (
                        <div
                          key={transfer.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {fromAccount?.name} → {toAccount?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(transfer.date)} •{' '}
                              {transfer.description || 'Sem descrição'}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="font-semibold">
                              {formatCurrency(transfer.amount)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransfer(transfer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs de confirmação */}
        <ConfirmDialog
          open={confirmDeleteAccountOpen}
          onOpenChange={setConfirmDeleteAccountOpen}
          title="Deletar conta"
          description="Tem certeza que deseja deletar esta conta? Esta ação não pode ser desfeita."
          confirmText="Deletar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteAccount}
          variant="destructive"
        />

        <ConfirmDialog
          open={confirmDeleteTransferOpen}
          onOpenChange={setConfirmDeleteTransferOpen}
          title="Deletar transferência"
          description="Tem certeza que deseja deletar esta transferência? Esta ação não pode ser desfeita."
          confirmText="Deletar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteTransfer}
          variant="destructive"
        />
      </div>
    </ProtectedLayout>
  )
}

