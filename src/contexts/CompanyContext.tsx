import { createContext, useContext, useEffect, useState } from "react"
import { clearStoredCompanyId, getStoredCompanyId, setStoredCompanyId } from "@/lib/session/storage"

interface CompanyContextValue {
    companyId: string | null
    isLoading: boolean
    setCompanyId: (id: string) => void
    clearCompanyId: () => void
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const [companyId, setCompanyIdState] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const stored = getStoredCompanyId()
        if (stored) {
            setCompanyIdState(stored)
        }
        setIsLoading(false)
    }, [])

    function setCompanyId(id: string) {
        setStoredCompanyId(id)
        setCompanyIdState(id)
    }

    function clearCompanyId() {
        clearStoredCompanyId()
        setCompanyIdState(null)
    }

    return (
        <CompanyContext.Provider value={{ companyId, isLoading, setCompanyId, clearCompanyId }}>
            {children}
        </CompanyContext.Provider>
    )
}

export function useCompany() {
    const ctx = useContext(CompanyContext)
    if (!ctx) {
        throw new Error("useCompany must be used within CompanyProvider")
    }
    return ctx
}
