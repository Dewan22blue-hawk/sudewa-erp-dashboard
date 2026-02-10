import { ChevronDown } from "lucide-react"
import { NAV_ITEMS } from "@/components/features/navigation/nav.config"
import { NavItem } from "@/components/features/navigation/NavItem"
import { useState } from "react"

export function Sidebar() {
    const [selectedCompany] = useState("Wajira Internat...")

    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-sidebar">
            {/* Company Selector */}
            <div className="border-b px-4 py-4">
                <button className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-muted-foreground">Company</span>
                        <span className="font-medium text-foreground">{selectedCompany}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAV_ITEMS.map((item, index) => (
                    <NavItem key={index} item={item} />
                ))}
            </nav>
        </aside>
    )
}
