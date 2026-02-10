import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

interface DashboardLayoutProps {
    children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Topbar />
                <main className="flex-1 bg-muted/40 p-6">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    )
}
