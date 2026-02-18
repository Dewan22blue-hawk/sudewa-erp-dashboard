import { LayoutDashboard, Database, FileText, Warehouse, DollarSign, ScrollText, ChevronRight } from "lucide-react"

/**
 * Navigation Item Configuration
 * Supports hierarchical menu structure dengan parent-child relationships
 */
export interface NavItemConfig {
    label: string
    href?: string
    icon?: React.ComponentType<{ className?: string }>
    children?: NavItemConfig[]
}

/**
 * Sidebar Navigation Items
 * Struktur sesuai dengan Figma design - semua item top-level dengan expandable capability
 */
export const NAV_ITEMS: NavItemConfig[] = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        children: [
            {
                label: "Dashboard",
                href: "/dashboard",
            },
            {
                label: "Overview",
                href: "/dashboard/overview",
            },
        ],
    },
    {
        label: "Master Data",
        icon: Database,
        children: [
            {
                label: "Akun",
                href: "/master/account",
            },
            {
                label: "Supplier",
                href: "/master/supplier",
            },
            {
                label: "Customer",
                href: "/master/customer",
            },
            {
                label: "Tipe Unit",
                href: "/master/type-unit",
            },
            {
                label: "Sparepart",
                href: "/master/sparepart",
            },
            {
                label: "Kas",
                href: "/master/kas",
            },
            {
                label: "User",
                href: "/master/user",
            },
        ],
    },
    {
        label: "Transaksi",
        icon: FileText,
        children: [
            {
                label: "Arus Transaksi",
                href: "/transaksi/arus-transaksi",
            },
            {
                label: "Penjualan Unit",
                href: "/sales",
            },
            {
                label: "Pembelian Unit",
                href: "/transaksi/pembelian-unit",
            },
        ],
    },
    {
        label: "Warehouse",
        icon: Warehouse,
        children: [], // Siap untuk di-expand dengan sub-items
    },
    {
        label: "Finance",
        icon: DollarSign,
        children: [
            {
                label: "Transaksi Kas Harian",
                href: "/finance/transaksi-kas-harian",
            },
        ], // Siap untuk di-expand dengan sub-items
    },
    {
        label: "Laporan",
        icon: ScrollText,
        children: [], // Siap untuk di-expand dengan sub-items
    },
]
