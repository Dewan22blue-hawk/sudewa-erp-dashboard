import Link from "next/link"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"
import { NavItemConfig } from "./nav.config"
import { ChevronRight, ChevronDown } from "lucide-react"
import { useState } from "react"

interface NavItemProps {
    item: NavItemConfig
}

/**
 * Navigation Item Component
 * Supports both parent items (expandable) dan child items
 */
export function NavItem({ item }: NavItemProps) {
    const router = useRouter()

    // Expand hanya Dashboard dan Master Data by default sesuai Figma
    const shouldExpandByDefault = item.label === "Dashboard" || item.label === "Master Data"
    const [isExpanded, setIsExpanded] = useState(shouldExpandByDefault)

    // Check if this item or any of its children is active
    const isActive = item.href
        ? router.pathname === item.href
        : item.children?.some((child) => child.href === router.pathname)

    const hasChildren = item.children && item.children.length > 0

    // Parent item (expandable - could have children or not)
    const Icon = item.icon

    // If item has href and no children - direct link
    if (item.href && !hasChildren) {
        return (
            <Link
                href={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
            </Link>
        )
    }

    // Expandable parent item
    return (
        <div>
            {/* Parent Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="font-medium">{item.label}</span>
                </div>
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </button>

            {/* Children Items */}
            {isExpanded && hasChildren && (
                <div className="ml-7 mt-1 space-y-1">
                    {item.children?.map((child, index) => (
                        <NavChildItem key={child.href || index} item={child} />
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * Child Navigation Item Component
 * For nested menu items under parent categories
 */
function NavChildItem({ item }: { item: NavItemConfig }) {
    const router = useRouter()
    const isActive = router.pathname === item.href

    if (!item.href) return null

    return (
        <Link
            href={item.href}
            className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
            )}
        >
            {item.label}
        </Link>
    )
}
