import { LayoutDashboard, Database, FileText, Settings, DollarSign, Warehouse } from 'lucide-react';
import { MenuItem } from '@/types/menu.types';

export const getTransindoMenus = (slug: string): MenuItem[] => {
  const base = (path: string) => (slug ? `/dashboard/${slug}${path}` : path);

  return [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      children: [
        {
          label: 'Overview',
          href: base(''),
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
          href: base('/master/account'),
        },
        {
          label: 'Grup Akun',
          href: base('/master/account-group'),
        },
        {
          label: 'Dealer',
          href: base('/master/dealer'),
        },
        {
          label: 'Customer',
          href: base('/master/customer'),
        },
        {
          label: 'Tarif',
          href: base('/master/tarif'),
        },
        {
          label: 'Driver',
          href: base('/master/driver'),
        },
        {
          label: 'Armada',
          href: base('/master/armada'),
        },
        {
          label: 'Aset',
          href: base('/master/asset'),
        },
      ],
    },
    {
      label: 'Administrasi',
      icon: FileText,
      children: [
        {
          label: 'Arus Transaksi',
          href: base('/arus-transaksi'),
        },
        {
          label: 'Order List',
          href: base('/administrasi/order-list'),
        },
        {
          label: 'DO Ekspedisi',
          href: base('/do-ekspedisi'),
        },
        {
          label: 'Create Invoice',
          href: base('/administrasi/create-invoice'),
        },
      ],
    },
    {
      label: 'Warehouse',
      icon: Warehouse,
      children: [
        {
          label: 'Perlengkapan Masuk',
          href: base('/warehouse/perlengkapan-masuk'),
        },
        {
          label: 'Perlengkapan Keluar',
          href: base('/warehouse/perlengkapan-keluar'),
        },
        {
          label: 'Stock Perlengkapan',
          href: base('/warehouse/stock-perlengkapan'),
        },
      ],
    },
    {
      label: 'Finance',
      icon: DollarSign,
      children: [
        {
          label: 'Aset',
          href: base('/finance/asset'),
        },
      ],
    },
    {
      label: 'Settings',
      icon: Settings,
      children: [
        {
          label: 'Profile',
          href: base('/settings/profile'),
        },
      ],
    },
  ];
};
