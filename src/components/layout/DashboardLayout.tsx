import { ReactNode, useEffect } from "react"
import { useRouter } from "next/router"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { getToken } from "@/lib/auth"
import { useCompany } from "@/contexts/CompanyContext"

interface DashboardLayoutProps {
    children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter()
    const { companyId, isLoading } = useCompany()

    // ===== ROUTE GUARD =====
    useEffect(() => {
        if (isLoading) return // Wait for company check

        const token = getToken()

        // Jika TIDAK ADA token → redirect ke /login
        if (!token) {
            router.replace("/login")
            return
        }

        // Jika ADA token tapi TIDAK ADA company_id → redirect ke /select-company
        if (!companyId) {
            router.replace("/select-company")
            return
        }
    }, [router, companyId, isLoading])

    // Jangan render jika belum ada token atau company_id (tapi tunggu loading)
    if (isLoading) {
        return null // Or a loading spinner
    }

    const token = getToken()
    if (!token || !companyId) {
        return null
    }

    return (
        <div className="flex min-h-screen">
            <div className="print:hidden">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col">
                <div className="print:hidden">
                    <Topbar />
                </div>
                <main className="flex-1 bg-muted/40 p-6 print:bg-white print:p-0">
                    <div className="mx-auto max-w-7xl space-y-6 print:max-w-none print:space-y-4">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    )
}
