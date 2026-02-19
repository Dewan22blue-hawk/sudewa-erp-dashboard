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
    exact?: boolean
}

/**
 * Sidebar Navigation Items
 * Struktur sesuai dengan Figma design - semua item top-level dengan expandable capability
 * Updated to support dynamic slug routing
 */
export const getNavItems = (slug: string): NavItemConfig[] => {
    // Helper to format path
    const p = (path: string) => slug ? `/dashboard/${slug}${path}` : path

    return [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            children: [
                {
                    label: "Dashboard",
                    href: slug ? `/dashboard/${slug}` : "/dashboard",
                    exact: true,
                },
                {
                    label: "Overview",
                    href: p("/overview"),
                },
            ],
        },
        {
            label: "Master Data",
            icon: Database,
            children: [
                {
                    label: "Akun",
                    href: p("/master/account"),
                },
                {
                    label: "Supplier",
                    href: p("/master/supplier"),
                },
                {
                    label: "Customer",
                    href: p("/master/customer"),
                },
                {
                    label: "Tipe Unit",
                    href: p("/master/type-unit"),
                },
                {
                    label: "Sparepart",
                    href: p("/master/sparepart"),
                },
                {
                    label: "Kas",
                    href: p("/master/kas"),
                },
                {
                    label: "User",
                    href: p("/master/user"),
                },
            ],
        },
        {
            label: "Transaksi",
            icon: FileText,
            children: [
                {
                    label: "Arus Transaksi",
                    href: p("/transaksi/arus-transaksi"),
                },
                {
                    label: "Penjualan Unit",
                    href: p("/sales"),
                },
                {
                    label: "Pembelian Unit",
                    href: p("/transaksi/pembelian-unit"),
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
                    href: p("/finance/transaksi-kas-harian"),
                },
                {
                    label: "Data PPN Penjualan",
                    href: p("/finance/data-ppn-penjualan"),
                },
                {
                    label: "Data PPN Pembelian",
                    href: p("/finance/data-ppn-pembelian"),
                },
            ], // Siap untuk di-expand dengan sub-items
        },
        {
            label: "Laporan",
            icon: ScrollText,
            children: [], // Siap untuk di-expand dengan sub-items
        },
    ]
}

// Keep backward compatibility for static pages if any (fallback)
export const NAV_ITEMS = getNavItems("")
