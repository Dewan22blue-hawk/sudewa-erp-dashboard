/**
 * Dashboard Type Definitions
 * Type-safe interfaces untuk semua data structures pada dashboard
 */

export type Currency = 'IDR' | 'USD';
export type TrendDirection = 'up' | 'down';

/**
 * KPI (Key Performance Indicator) Data Structure
 */
export interface KpiData {
  id: string;
  title: string;
  value: number;
  currency: Currency;
  trend: TrendDirection;
  trendPercentage: number;
  trendLabel: string;
}

/**
 * Monthly Revenue Data untuk Bar Chart
 */
export interface MonthlyRevenueData {
  month: string;
  bcaIdr: number;
  bcaUsd: number;
  cash: number;
}

/**
 * Income Breakdown Data untuk Donut Chart
 */
export interface IncomeBreakdownData {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

/**
 * Financial account summary (for the top cards)
 */
export interface AccountOverview {
  id: string;
  name: string;
  subtitle: string;
  currency: Currency;
  type: 'bank' | 'cash';
  openingBalance: number;
  debit: number;
  credit: number;
  closingBalance: number;
  accentColor: string;
}

/**
 * Monthly finance series (supports income & expense toggle)
 */
export interface FinanceSeriesPoint {
  month: string;
  income: {
    bcaUsd: number;
    bcaIdr: number;
    cash: number;
  };
  expense: {
    bcaUsd: number;
    bcaIdr: number;
    cash: number;
  };
}

/**
 * Customer overview block
 */
export interface CustomerOverview {
  totalCustomers: number;
  totalRevenue: number;
  averageRevenue: number;
  topCustomers: Array<{ name: string; revenue: number }>;
}

/**
 * Product overview block
 */
export interface ProductOverview {
  totalProducts: number;
  totalSold: number;
  topProducts: Array<{ name: string; quantity: number }>;
}

/**
 * Cashflow summary section
 */
export interface CashflowSummaryItem {
  account: string;
  amount: number;
  currency: Currency;
}

export interface CashflowSummary {
  incomes: CashflowSummaryItem[];
  outcomes: CashflowSummaryItem[];
}

/**
 * Transaction detail table row
 */
export interface TransactionEntry {
  note: string;
  date: string;
  sale: string;
  customer: string;
  account: string;
  total: number;
  currency: Currency;
  description: string;
  type: 'income' | 'expense';
}

/**
 * Complete Dashboard API Response
 */
export interface DashboardApiResponse {
  kpis: KpiData[];
  monthlyRevenue: MonthlyRevenueData[];
  incomeBreakdown: IncomeBreakdownData[];
  accounts: AccountOverview[];
  financeSeries: FinanceSeriesPoint[];
  customers: CustomerOverview;
  products: ProductOverview;
  cashflow: CashflowSummary;
  transactions: TransactionEntry[];
  lastUpdated: string;
}

/**
 * Dashboard Statistics Summary
 */
export interface DashboardStats {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyGrowth: number;
}
