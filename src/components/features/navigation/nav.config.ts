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
        ],
    },
    {
        label: "Transaksi",
        icon: FileText,
        children: [
            {
                label: "Penjualan Unit",
                href: "/sales",
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
        children: [], // Siap untuk di-expand dengan sub-items
    },
    {
        label: "Laporan",
        icon: ScrollText,
        children: [], // Siap untuk di-expand dengan sub-items
    },
]
