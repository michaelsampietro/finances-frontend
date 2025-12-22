import { api } from './client'
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilter,
} from '@/types'

export const transactionsApi = {
  list: (filter?: TransactionFilter) => {
    const params = new URLSearchParams()
    if (filter?.account_id) params.append('account_id', filter.account_id)
    if (filter?.category_id) params.append('category_id', filter.category_id)
    if (filter?.type) params.append('type', filter.type)
    if (filter?.start_date) params.append('start_date', filter.start_date)
    if (filter?.end_date) params.append('end_date', filter.end_date)
    
    const query = params.toString()
    return api.get<Transaction[]>(`/transactions${query ? `?${query}` : ''}`)
  },
  
  getById: (id: string) => api.get<Transaction>(`/transactions/${id}`),
  
  create: (data: CreateTransactionRequest) =>
    api.post<Transaction>('/transactions', data),
  
  update: (id: string, data: UpdateTransactionRequest) =>
    api.put<Transaction>(`/transactions/${id}`, data),
  
  delete: (id: string) => api.delete<{ message: string }>(`/transactions/${id}`),
}

