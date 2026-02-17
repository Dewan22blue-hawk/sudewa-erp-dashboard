import { createContext, useContext, useEffect, useState } from "react"

interface CompanyContextValue {
    companyId: string | null
    isLoading: boolean
    setCompanyId: (id: string) => void
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const [companyId, setCompanyIdState] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem("company_id")
        if (stored) {
            setCompanyIdState(stored)
        }
        setIsLoading(false)
    }, [])

    function setCompanyId(id: string) {
        localStorage.setItem("company_id", id)
        setCompanyIdState(id)
    }

    return (
        <CompanyContext.Provider value={{ companyId, isLoading, setCompanyId }}>
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
