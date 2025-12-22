import { api } from './client'
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types'

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  
  create: (data: CreateCategoryRequest) =>
    api.post<Category>('/categories', data),
  
  update: (id: string, data: UpdateCategoryRequest) =>
    api.put<Category>(`/categories/${id}`, data),
  
  delete: (id: string) => api.delete<{ message: string }>(`/categories/${id}`),
}

