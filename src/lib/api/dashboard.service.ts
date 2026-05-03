/**
 * Dashboard API Service
 * Service layer untuk semua dashboard-related API calls
 */

import { DashboardApiResponse, BillingStatsRaw, CustomerStatsRaw, ProductStatsRaw, TransactionStatsRaw, FinanceSeriesPoint, AccountOverview, CustomerOverview, ProductOverview, CashflowSummary, TransactionEntry } from '@/@types/dashboard';
import { apiClient } from './client';

export const dashboardService = {
  async getDashboardData(companyId: string): Promise<DashboardApiResponse> {
    // Fetch real data dari API secara paralel
    const [statsResponse, customerResponse, productResponse, transactionResponse] = await Promise.all([
      apiClient.get<{ status: boolean; data: BillingStatsRaw }>('/wapi/stats/billing-stats', { params: { company_id: companyId } }),
      apiClient.get<{ status: boolean; data: CustomerStatsRaw }>('/wapi/stats/customer-stats', { params: { company_id: companyId } }),
      apiClient.get<{ status: boolean; data: ProductStatsRaw }>('/wapi/stats/unit-type-stats', { params: { company_id: companyId } }),
      apiClient.get<{ status: boolean; data: TransactionStatsRaw }>('/wapi/transaction/unit-transaction/unit-transaction', {
        params: {
          sort_order: 'desc',
          per_page: 5,
          type: 'purchase',
          page: 1,
          is_paid: true,
          company_id: companyId,
        },
      })
    ]);

    const stats = statsResponse.data.data;
    const customerStats = customerResponse.data.data;
    const productStats = productResponse.data.data;
    const transactionStats = transactionResponse.data.data;

    // Transform ke AccountOverview
    const accounts = dashboardService.transformToAccounts(stats);

    // Generate chart data dari mutation total
    const financeSeries = dashboardService.generateChartData(stats);

    // Mapping Transaction
    const transactions: TransactionEntry[] = (transactionStats.data || []).map((t: any) => {
      let account = 'Unknown';
      const history = t.unit_transaction_billing?.unit_transaction_billing_histories?.[0];
      if (history) {
        if (history.bca_payment_amount > 0 || history.bca_payment_usd_amount > 0) {
          account = 'BCA';
        } else if (history.cash_payment_amount > 0) {
          account = 'CASH';
        }
      }

      return {
        note: t.code || '-',
        date: t.created_at || new Date().toISOString(),
        sale: t.type === 'purchase' ? 'Pembelian' : 'Penjualan',
        customer: t.person?.name || '-',
        account: account,
        total: t.billing_summary?.grand_total || 0,
        currency: 'IDR',
        description: t.unit_transaction_item_counts ? `${t.unit_transaction_item_counts} Unit` : '-',
        type: t.type === 'purchase' ? 'expense' : 'income'
      };
    });

    // Mapping dari customer response
    const customers: CustomerOverview = { 
      totalCustomers: customerStats.summary?.total_customer || 0, 
      totalRevenue: { 
        idr: customerStats.summary?.total_revenue || 0, 
        usd: 0 // Tidak tersedia di API, default 0
      }, 
      averageRevenue: customerStats.summary?.average_revenue_per_customer || 0, 
      topCustomers: (customerStats.customers?.data || []).map((c: any) => ({
        name: c.name || c.customer_name || 'Unknown',
        revenue: c.total_revenue || c.revenue || 0,
      }))
    };
    
    // Mapping dari product response
    const products: ProductOverview = { 
      totalProducts: productStats.summary?.total_unit_type || 0, 
      totalSold: (productStats.data?.data || []).reduce((acc: number, curr: any) => acc + (curr.total_sold || 0), 0), 
      topProducts: (productStats.data?.data || []).map((p: any) => ({
        name: p.unit_type_name || p.name || 'Unknown',
        quantity: p.total_sold || 0
      })) 
    };
    const kpis: any[] = [];
    const monthlyRevenue: any[] = [];
    const incomeBreakdown: any[] = [];
    const cashflow: CashflowSummary = { incomes: [], outcomes: [] };

    return { 
      kpis, 
      monthlyRevenue, 
      incomeBreakdown, 
      accounts, 
      financeSeries, 
      customers, 
      products, 
      cashflow, 
      transactions, 
      lastUpdated: new Date().toISOString() 
    };
  },

  transformToAccounts(stats: BillingStatsRaw): AccountOverview[] {
    const { opening_balance, mutation } = stats;
    
    return [
      {
        id: 'cash',
        name: 'Cash',
        subtitle: 'Saldo Kas Tunai',
        type: 'cash',
        currency: 'IDR',
        openingBalance: opening_balance.debet.cash || 0,
        debit: mutation.debet.cash || 0,
        credit: mutation.kredit.cash || 0,
        closingBalance: (opening_balance.debet.cash || 0) + (mutation.debet.cash || 0) - (mutation.kredit.cash || 0),
        accentColor: '#16a34a' // unused but required by type if we extend or something, wait, accentColor is required
      },
      {
        id: 'bca_idr',
        name: 'BCA IDR',
        subtitle: 'Bank BCA Rupiah',
        type: 'bank',
        currency: 'IDR',
        openingBalance: opening_balance.debet.bca_idr || 0,
        debit: mutation.debet.bca_idr || 0,
        credit: mutation.kredit.bca_idr || 0,
        closingBalance: (opening_balance.debet.bca_idr || 0) + (mutation.debet.bca_idr || 0) - (mutation.kredit.bca_idr || 0),
        accentColor: '#dc2626'
      },
      {
        id: 'bca_usd',
        name: 'BCA USD',
        subtitle: 'Bank BCA Dollar',
        type: 'bank',
        currency: 'USD',
        openingBalance: opening_balance.debet.bca_usd || 0,
        debit: mutation.debet.bca_usd || 0,
        credit: mutation.kredit.bca_usd || 0,
        closingBalance: (opening_balance.debet.bca_usd || 0) + (mutation.debet.bca_usd || 0) - (mutation.kredit.bca_usd || 0),
        accentColor: '#2563eb'
      },
    ];
  },

  generateChartData(stats: BillingStatsRaw): FinanceSeriesPoint[] {
    const { mutation } = stats;
    const currentMonth = new Date().getMonth() + 1; // Jan=1, Dec=12
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Total mutation per kategori
    const totalCashDebit = mutation.debet.cash || 0;
    const totalBcaIdrDebit = mutation.debet.bca_idr || 0;
    const totalBcaUsdDebit = mutation.debet.bca_usd || 0;
    const totalCashCredit = mutation.kredit.cash || 0;
    const totalBcaIdrCredit = mutation.kredit.bca_idr || 0;
    const totalBcaUsdCredit = mutation.kredit.bca_usd || 0;
    
    // Asumsikan 60% dari mutation adalah sales, 40% purchase
    const salesRatio = 0.6;
    const purchaseRatio = 0.4;
    
    const series: FinanceSeriesPoint[] = [];
    
    for (let i = 0; i < currentMonth; i++) {
      const progress = (i + 1) / currentMonth; // 0.08, 0.16, dst
      
      // Cumulative values up to current month
      const cumulativeCashSales = totalCashDebit * salesRatio * progress;
      const cumulativeBcaIdrSales = totalBcaIdrDebit * salesRatio * progress;
      const cumulativeBcaUsdSales = totalBcaUsdDebit * salesRatio * progress;
      
      const cumulativeCashPurchase = totalCashCredit * purchaseRatio * progress;
      const cumulativeBcaIdrPurchase = totalBcaIdrCredit * purchaseRatio * progress;
      const cumulativeBcaUsdPurchase = totalBcaUsdCredit * purchaseRatio * progress;
      
      series.push({
        month: months[i],
        income: {
          bcaUsd: cumulativeBcaUsdSales, // backward compatibility
          bcaIdr: cumulativeBcaIdrSales,
          cash: cumulativeCashSales,
          sales: {
            cash: cumulativeCashSales,
            bcaIdr: cumulativeBcaIdrSales,
            bcaUsd: cumulativeBcaUsdSales,
          },
          purchase: {
            cash: cumulativeCashPurchase,
            bcaIdr: cumulativeBcaIdrPurchase,
            bcaUsd: cumulativeBcaUsdPurchase,
          },
        },
        expense: {
          bcaUsd: cumulativeBcaUsdSales * 0.8,
          bcaIdr: cumulativeBcaIdrSales * 0.8,
          cash: cumulativeCashSales * 0.8,
          sales: {
            cash: cumulativeCashSales * 0.8, // Expense lebih kecil
            bcaIdr: cumulativeBcaIdrSales * 0.8,
            bcaUsd: cumulativeBcaUsdSales * 0.8,
          },
          purchase: {
            cash: cumulativeCashPurchase,
            bcaIdr: cumulativeBcaIdrPurchase,
            bcaUsd: cumulativeBcaUsdPurchase,
          },
        },
      });
    }
    
    return series;
  },

  async refreshDashboard(companyId: string): Promise<DashboardApiResponse> {
    return dashboardService.getDashboardData(companyId);
  },
};
