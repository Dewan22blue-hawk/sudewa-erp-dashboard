import { LayoutDashboard, Database, FileText, Settings, DollarSign, Warehouse } from 'lucide-react';
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
                },
                {
                    label: 'Perlengkapan',
                    href: base('/master/vehicle-equipment'),
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
                    label: 'Pembelian Material',
                    href: base('/pembelian-material'),
                },
                {
                    label: 'Penjualan Material',
                    href: base('/penjualan-material'),
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
            label: 'Warehouse',
            icon: Warehouse,
            children: [
                {
                    label: 'Penerimaan Material',
                    href: base('/warehouse/penerimaan-material'),
                },
                {
                    label: 'Pengeluaran Material',
                    href: base('/warehouse/pengeluaran-material'),
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
