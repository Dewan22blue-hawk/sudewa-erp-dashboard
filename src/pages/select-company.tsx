import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/router"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchUserCompanies, Company } from "@/services/company.service"
import { getToken } from "@/lib/auth"
import { useCompany } from "@/contexts/CompanyContext"

export default function SelectCompanyPage() {
    const router = useRouter()
    const { setCompanyId } = useCompany()

    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)

    // ===== GUARD: TOKEN =====
    useEffect(() => {
        const token = getToken()
        if (!token) {
            router.replace("/login")
        }
    }, [router])

    // ===== FETCH COMPANIES =====
    useEffect(() => {
        fetchUserCompanies().then((data) => {
            setCompanies(data)
            setLoading(false)
        })
    }, [])

    function handleSelect(company: Company) {
        setCompanyId(company.id)
        router.push("/dashboard")
    }

    if (loading) return null

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md text-center">
                {/* LOGO */}
                <div className="flex justify-center mb-6">
                    <Image
                        src="/wajira-logo.png"
                        alt="Wajira Logo"
                        width={80}
                        height={80}
                        priority
                    />
                </div>

                <p className="mb-6 text-sm text-gray-600">
                    Pilih salah satu perusahaan di bawah ini
                </p>

                {/* COMPANY LIST */}
                <div className="space-y-3">
                    {companies.map((company) => (
                        <div
                            key={company.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                        >
                            <span className="text-sm font-medium text-gray-900">
                                {company.name}
                            </span>

                            <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-xs font-medium shadow-sm transition-all duration-200"
                                onClick={() => handleSelect(company)}
                            >
                                Pilih
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
