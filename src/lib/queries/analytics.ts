import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/analytics'
import type { TransactionType } from '@/types'

export const analyticsQueryKeys = {
  summary: (startDate: string, endDate: string) => ['analytics', 'summary', startDate, endDate],
  byCategory: (startDate: string, endDate: string, type?: TransactionType) => [
    'analytics',
    'by-category',
    startDate,
    endDate,
    type,
  ],
  monthlyComparison: (months: number) => ['analytics', 'monthly-comparison', months],
  trends: (startDate: string, endDate: string, groupBy: string) => [
    'analytics',
    'trends',
    startDate,
    endDate,
    groupBy,
  ],
  expenseIncomeChart: (startDate: string, endDate: string, groupBy: string) => [
    'analytics',
    'expense-income-chart',
    startDate,
    endDate,
    groupBy,
  ],
}

export function useAnalyticsSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: analyticsQueryKeys.summary(startDate, endDate),
    queryFn: () => analyticsApi.getSummary(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

export function useAnalyticsByCategory(
  startDate: string,
  endDate: string,
  type?: TransactionType
) {
  return useQuery({
    queryKey: analyticsQueryKeys.byCategory(startDate, endDate, type),
    queryFn: () => analyticsApi.getByCategory(startDate, endDate, type),
    enabled: !!startDate && !!endDate,
  })
}

export function useMonthlyComparison(months: number = 6) {
  return useQuery({
    queryKey: analyticsQueryKeys.monthlyComparison(months),
    queryFn: () => analyticsApi.getMonthlyComparison(months),
  })
}

export function useTrends(
  startDate: string,
  endDate: string,
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  return useQuery({
    queryKey: analyticsQueryKeys.trends(startDate, endDate, groupBy),
    queryFn: () => analyticsApi.getTrends(startDate, endDate, groupBy),
    enabled: !!startDate && !!endDate,
  })
}

export function useExpenseIncomeChart(
  startDate: string,
  endDate: string,
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  return useQuery({
    queryKey: analyticsQueryKeys.expenseIncomeChart(startDate, endDate, groupBy),
    queryFn: () => analyticsApi.getExpenseIncomeChart(startDate, endDate, groupBy),
    enabled: !!startDate && !!endDate,
  })
}

