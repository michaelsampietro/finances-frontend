import { api } from './client'
import type {
  Transfer,
  CreateTransferRequest,
  UpdateTransferRequest,
} from '@/types'

export const transfersApi = {
  list: () => api.get<Transfer[]>('/transfers'),
  
  getById: (id: string) => api.get<Transfer>(`/transfers/${id}`),
  
  create: (data: CreateTransferRequest) =>
    api.post<Transfer>('/transfers', data),
  
  update: (id: string, data: UpdateTransferRequest) =>
    api.put<Transfer>(`/transfers/${id}`, data),
  
  delete: (id: string) => api.delete<{ message: string }>(`/transfers/${id}`),
}

