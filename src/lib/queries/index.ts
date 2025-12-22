import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '@/lib/api/transactions'
import { accountsApi } from '@/lib/api/accounts'
import { categoriesApi } from '@/lib/api/categories'
import { transfersApi } from '@/lib/api/transfers'
import { budgetsApi } from '@/lib/api/budgets'
import { usersApi } from '@/lib/api/users'
import type {
  TransactionFilter,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  CreateAccountRequest,
  UpdateAccountRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateTransferRequest,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  UpdateUserRequest,
} from '@/types'
import { useToast } from '@/components/ui/use-toast'

// Query Keys
export const queryKeys = {
  transactions: (filter?: TransactionFilter) => ['transactions', filter],
  transaction: (id: string) => ['transactions', id],
  accounts: () => ['accounts'],
  account: (id: string) => ['accounts', id],
  categories: () => ['categories'],
  category: (id: string) => ['categories', id],
  transfers: () => ['transfers'],
  transfer: (id: string) => ['transfers', id],
  budgets: () => ['budgets'],
  budget: (id: string) => ['budgets', id],
  budgetStatus: (id: string) => ['budgets', id, 'status'],
  user: () => ['user'],
}

// Transactions
export function useTransactions(filter?: TransactionFilter) {
  return useQuery({
    queryKey: queryKeys.transactions(filter),
    queryFn: () => transactionsApi.list(filter),
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Sucesso',
        description: 'Transação criada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar transação',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionRequest }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Sucesso',
        description: 'Transação atualizada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar transação',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Sucesso',
        description: 'Transação deletada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar transação',
        variant: 'destructive',
      })
    },
  })
}

// Accounts
export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts(),
    queryFn: () => accountsApi.list(),
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.account(id),
    queryFn: () => accountsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Sucesso',
        description: 'Conta criada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar conta',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
      accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Sucesso',
        description: 'Conta atualizada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar conta',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Sucesso',
        description: 'Conta deletada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar conta',
        variant: 'destructive',
      })
    },
  })
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => categoriesApi.list(),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar categoria',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar categoria',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: 'Sucesso',
        description: 'Categoria deletada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar categoria',
        variant: 'destructive',
      })
    },
  })
}

// Transfers
export function useTransfers() {
  return useQuery({
    queryKey: queryKeys.transfers(),
    queryFn: () => transfersApi.list(),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTransferRequest) => transfersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Sucesso',
        description: 'Transferência criada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar transferência',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => transfersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Sucesso',
        description: 'Transferência deletada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar transferência',
        variant: 'destructive',
      })
    },
  })
}

// Budgets
export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets(),
    queryFn: () => budgetsApi.list(),
  })
}

export function useBudgetStatus(id: string) {
  return useQuery({
    queryKey: queryKeys.budgetStatus(id),
    queryFn: () => budgetsApi.getStatus(id),
    enabled: !!id,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => budgetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast({
        title: 'Sucesso',
        description: 'Orçamento criado com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar orçamento',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetRequest }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast({
        title: 'Sucesso',
        description: 'Orçamento atualizado com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar orçamento',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast({
        title: 'Sucesso',
        description: 'Orçamento deletado com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar orçamento',
        variant: 'destructive',
      })
    },
  })
}

// User
export function useUser() {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => usersApi.getMe(),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => usersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perfil',
        variant: 'destructive',
      })
    },
  })
}

