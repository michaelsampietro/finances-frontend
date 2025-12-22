// Types based on backend domain models

export type TransactionType = 'income' | 'expense'

export type AccountType = 'checking' | 'savings' | 'credit' | 'other'

export type BudgetPeriod = 'monthly' | 'yearly'

export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  description: string
  color?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Transfer {
  id: string
  user_id: string
  from_account_id: string
  to_account_id: string
  amount: number
  description: string
  date: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: BudgetPeriod
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface BudgetStatus {
  budget: Budget
  spent: number
  remaining: number
  percentage: number
}

// API Request/Response types

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface CreateTransactionRequest {
  account_id: string
  category_id: string
  type: TransactionType
  amount: number
  description?: string
  date?: string
}

export interface UpdateTransactionRequest {
  account_id?: string
  category_id?: string
  type?: TransactionType
  amount?: number
  description?: string
  date?: string
}

export interface CreateTransferRequest {
  from_account_id: string
  to_account_id: string
  amount: number
  description?: string
  date?: string
}

export interface CreateAccountRequest {
  name: string
  type: AccountType
  balance?: number
}

export interface UpdateAccountRequest {
  name?: string
  type?: AccountType
  balance?: number
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  color?: string
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  color?: string
}

export interface CreateBudgetRequest {
  category_id: string
  amount: number
  period: BudgetPeriod
  start_date: string
  end_date: string
}

export interface UpdateBudgetRequest {
  category_id?: string
  amount?: number
  period?: BudgetPeriod
  start_date?: string
  end_date?: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}

export interface TransactionFilter {
  account_id?: string
  category_id?: string
  type?: TransactionType
  start_date?: string
  end_date?: string
}

