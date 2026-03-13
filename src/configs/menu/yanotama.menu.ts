import { LayoutDashboard, Database, FileText, Settings } from 'lucide-react';
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
                    href: base('/dealer'),
                },
                {
                    label: 'Wilayah',
                    href: base('/wilayah'),
                },
                {
                    label: 'BBN',
                    href: base('/bbn'),
                },
                {
                    label: 'Material',
                    href: base('/material'),
                },
                {
                    label: 'Vendor',
                    href: base('/vendor'),
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
                    label: 'Data Kendaraan',
                    href: base('/data-kendaraan'),
                },
                {
                    label: 'STNK / BPKB',
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
