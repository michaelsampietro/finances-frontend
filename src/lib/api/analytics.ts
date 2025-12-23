import { api } from './client'
import type {
  AnalyticsSummary,
  CategoryBreakdown,
  MonthlyComparison,
  TrendData,
  TransactionType,
} from '@/types'

export interface AnalyticsFilter {
  start_date: string
  end_date: string
  type?: TransactionType
  group_by?: 'day' | 'week' | 'month'
  months?: number
}

export const analyticsApi = {
  getSummary: (startDate: string, endDate: string) =>
    api.get<AnalyticsSummary>(
      `/analytics/summary?start_date=${startDate}&end_date=${endDate}`
    ),

  getByCategory: (startDate: string, endDate: string, type?: TransactionType) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    })
    if (type) {
      params.append('type', type)
    }
    return api.get<CategoryBreakdown[]>(`/analytics/by-category?${params.toString()}`)
  },

  getMonthlyComparison: (months: number = 6) =>
    api.get<MonthlyComparison[]>(`/analytics/monthly-comparison?months=${months}`),

  getTrends: (startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') =>
    api.get<TrendData[]>(
      `/analytics/trends?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`
    ),

  getExpenseIncomeChart: (
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ) =>
    api.get<TrendData[]>(
      `/analytics/expense-income-chart?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`
    ),
}

