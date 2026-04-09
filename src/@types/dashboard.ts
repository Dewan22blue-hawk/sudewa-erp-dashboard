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
 * Finance series values per account source
 */
export interface FinanceSeriesValues {
  bcaUsd: number;
  bcaIdr: number;
  cash: number;
}

/**
 * Finance series per transaction type (sales / purchase)
 * Supports both flat structure (backward compat) and nested structure
 */
export interface FinanceSeriesByType extends FinanceSeriesValues {
  /** Optional nested breakdown by transaction type */
  sales?: FinanceSeriesValues;
  purchase?: FinanceSeriesValues;
}

/**
 * Monthly finance series (supports income & expense toggle + sales/purchase filter)
 *
 * Backward compatible:
 * - Old shape: item.income.bcaUsd
 * - New shape: item.income.sales.bcaUsd / item.income.purchase.bcaUsd
 */
export interface FinanceSeriesPoint {
  month: string;
  income: FinanceSeriesByType;
  expense: FinanceSeriesByType;
}

/**
 * Customer overview block
 */
export interface CustomerOverview {
  totalCustomers: number;
  totalRevenue: {
    idr: number;
    usd: number;
  };
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

/**
 * Billing Stats API Response Raw Data
 */
export interface BillingStatsRaw {
  opening_balance: {
    debet: { cash: number; bca_idr: number; bca_usd: number };
    kredit?: { cash: number; bca_idr: number; bca_usd: number };
  };
  mutation: {
    debet: { cash: number; bca_idr: number; bca_usd: number };
    kredit: { cash: number; bca_idr: number; bca_usd: number };
  };
  percentage?: any;
}

/**
 * Customer Stats API Response Raw Data
 */
export interface CustomerStatsRaw {
  summary: {
    total_customer: number;
    total_revenue: number;
    average_revenue_per_customer: number;
  };
  customers: {
    current_page: number;
    data: any[];
    total: number;
    last_page?: number;
    per_page?: number;
  };
}

/**
 * Product Stats API Response Raw Data
 */
export interface ProductStatsRaw {
  summary: {
    total_unit_type: number;
    total_unit_type_sold: number;
  };
  data: {
    current_page: number;
    data: any[];
    total: number;
    last_page?: number;
    per_page?: number;
  };
}

/**
 * Transaction Unit API Response Raw Data
 */
export interface TransactionStatsRaw {
  current_page: number;
  data: any[];
  first_page_url?: string;
  last_page?: number;
  per_page?: number;
  total?: number;
}

