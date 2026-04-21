import { LayoutDashboard, Database, FileText, Settings, DollarSign } from 'lucide-react';
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
          label: 'DO Ekspedisi',
          href: base('/do-ekspedisi'),
        },
        {
          label: 'Create Invoice',
          href: base('/administrasi/create-invoice'),
        },
        {
          label: 'LPJ Perjalanan',
          href: base('/lpj-perjalanan'),
        },
        {
          label: 'DO Kendaraan',
          href: base('/do-kendaraan'),
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
