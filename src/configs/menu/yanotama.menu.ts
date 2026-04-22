import { LayoutDashboard, Database, FileText, Settings, DollarSign } from 'lucide-react';
import { MenuItem } from '@/types/menu.types';

export const getYanotamaMenus = (slug: string): MenuItem[] => {
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
                    label: 'Wilayah',
                    href: base('/master/wilayah'),
                },
                {
                    label: 'Material',
                    href: base('/master/material'),
                },
                {
                    label: 'Vendor',
                    href: base('/master/vendor'),
                },
                {
                    label: 'Aset',
                    href: base('/master/asset'),
                },
                {
                    label: 'BBN',
                    href: base('/master/bbn'),
                }
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
                    label: 'Data Kendaraan',
                    href: base('/data-kendaraan'),
                },
                {
                    label: 'Input STNK/BPKB',
                    href: base('/stnk-bpkb'),
                },
                {
                    label: 'Tagihan BBN',
                    href: base('/tagihan-bbn'),
                },
                {
                    label: 'DO Pembelian Material',
                    href: base('/do-pembelian-material'),
                },
                {
                    label: 'Penjualan Material',
                    href: base('/penjualan-material'),
                },
                {
                    label: 'Stok Material',
                    href: base('/stok-material'),
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
