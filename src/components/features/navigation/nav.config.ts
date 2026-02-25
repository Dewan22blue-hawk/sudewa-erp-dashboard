import { LayoutDashboard, Database, FileText, Warehouse, DollarSign, ScrollText } from 'lucide-react';

/**
 * Navigation Item Configuration
 * Supports hierarchical menu structure dengan parent-child relationships
 */
export interface NavItemConfig {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItemConfig[];
  exact?: boolean;
}

/**
 * Sidebar Navigation Items
 * Struktur sesuai dengan Figma design - semua item top-level dengan expandable capability
 * Updated to support dynamic slug routing
 */
export const getNavItems = (slug: string): NavItemConfig[] => {
  // Helper to format path
  const p = (path: string) => (slug ? `/dashboard/${slug}${path}` : path);

  return [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      children: [
        {
          label: 'Overview',
          href: slug ? `/dashboard/${slug}` : '/dashboard',
          exact: true,
        },
      ],
    },
    {
      label: 'Master Data',
      icon: Database,
      children: [
        {
          label: 'Akun',
          href: p('/master/account'),
        },
        {
          label: 'Supplier',
          href: p('/master/supplier'),
        },
        {
          label: 'Customer',
          href: p('/master/customer'),
        },
        {
          label: 'Tipe Unit',
          href: p('/master/type-unit'),
        },
        {
          label: 'Sparepart',
          href: p('/master/sparepart'),
        },
        {
          label: 'Kas',
          href: p('/master/kas'),
        },
        {
          label: 'User',
          href: p('/master/user'),
        },
      ],
    },
    {
      label: 'Transaksi',
      icon: FileText,
      children: [
        {
          label: 'Arus Transaksi',
          href: p('/transaksi/arus-transaksi'),
        },
        {
          label: 'Penjualan Unit',
          href: p('/sales'),
        },
        {
          label: 'Pembelian Unit',
          href: p('/transaksi/pembelian-unit'),
        },
      ],
    },
    {
      label: 'Warehouse',
      icon: Warehouse,
      children: [
        {
          label: 'Stok Unit',
          href: p('/warehouse/stock-unit'),
        },
        {
          label: 'Penerimaan Unit',
          href: p('/warehouse/penerimaan-unit'),
        },
      ], // Siap untuk di-expand dengan sub-items
    },
    {
      label: 'Finance',
      icon: DollarSign,
      children: [
        {
          label: 'Transaksi Kas Harian',
          href: p('/finance/transaksi-kas-harian'),
        },
        {
          label: 'Data PPN Penjualan',
          href: p('/finance/data-ppn-penjualan'),
        },
        {
          label: 'Data PPN Pembelian',
          href: p('/finance/data-ppn-pembelian'),
        },
        {
          label: 'Data Refund Pembelian',
          href: p('/finance/refund-beli'),
        },
        {
          label: 'Data Refund Penjualan',
          href: p('/finance/refund-jual'),
        },
        {
          label: 'Data Hutang',
          href: p('/finance/data-hutang'),
        },
        {
          label: 'Data Pembayaran Hutang',
          href: p('/finance/data-pembayaran-hutang'),
        },
        {
          label: 'Data Piutang',
          href: p('/finance/data-piutang'),
        },
        {
          label: 'Data Pembayaran Piutang',
          href: p('/finance/data-penerimaan-piutang'),
        },
      ], // Siap untuk di-expand dengan sub-items
    },
    {
      label: 'Laporan',
      icon: ScrollText,
      children: [], // Siap untuk di-expand dengan sub-items
    },
  ];
};

// Keep backward compatibility for static pages if any (fallback)
export const NAV_ITEMS = getNavItems('');
