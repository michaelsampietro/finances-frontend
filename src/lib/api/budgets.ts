import { api } from './client'
import type {
  Budget,
  BudgetStatus,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '@/types'

export const budgetsApi = {
  list: () => api.get<Budget[]>('/budgets'),
  
  getById: (id: string) => api.get<Budget>(`/budgets/${id}`),
  
  getStatus: (id: string) => api.get<BudgetStatus>(`/budgets/${id}/status`),
  
  create: (data: CreateBudgetRequest) =>
    api.post<Budget>('/budgets', data),
  
  update: (id: string, data: UpdateBudgetRequest) =>
    api.put<Budget>(`/budgets/${id}`, data),
  
  delete: (id: string) => api.delete<{ message: string }>(`/budgets/${id}`),
}

