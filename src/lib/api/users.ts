import { api } from './client'
import type { User, UpdateUserRequest } from '@/types'

export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
  
  updateMe: (data: UpdateUserRequest) =>
    api.put<User>('/users/me', data),
}

