import { ChevronDown, Check } from "lucide-react"
import { NAV_ITEMS } from "@/components/features/navigation/nav.config"
import { NavItem } from "@/components/features/navigation/NavItem"
import { useEffect, useState } from "react"
import { useCompany } from "@/contexts/CompanyContext"
import { fetchUserCompanies, Company } from "@/services/company.service"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const { companyId, setCompanyId } = useCompany()
    const [companies, setCompanies] = useState<Company[]>([])
    const [isOpen, setIsOpen] = useState(false)

    // Fetch companies list
    useEffect(() => {
        fetchUserCompanies().then((data) => {
            setCompanies(data)
        })
    }, [])

    // Get current selected company
    const selectedCompany = companies.find((c) => c.id === companyId)

    // Handle company selection
    const handleSelectCompany = (company: Company) => {
        setCompanyId(company.id)
        setIsOpen(false)
        // Optional: Reload page to refresh dashboard data
        window.location.reload()
    }

    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-sidebar">
            {/* Company Selector */}
            <div className="border-b px-4 py-4">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <button className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] text-muted-foreground">Company</span>
                                <span className="font-medium text-foreground">
                                    {selectedCompany ? selectedCompany.name : "Select Company..."}
                                </span>
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                isOpen && "rotate-180"
                            )} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                        <div className="space-y-1">
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                Select Company
                            </div>
                            {companies.map((company) => (
                                <button
                                    key={company.id}
                                    onClick={() => handleSelectCompany(company)}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                                        company.id === companyId && "bg-muted"
                                    )}
                                >
                                    <span className="font-medium">{company.name}</span>
                                    {company.id === companyId && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
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
