import { ChevronDown, Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Topbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
                <div className="relative w-[320px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search Here"
                        className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none ring-ring transition-all focus:border-primary focus:ring-2"
                    />
                </div>
            </div>

            {/* Right Section: Notification + User */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        CN
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Admin</span>
                        <span className="text-xs text-muted-foreground">Administrator</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
