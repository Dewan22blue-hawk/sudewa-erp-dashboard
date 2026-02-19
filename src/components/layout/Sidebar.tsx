import { ChevronDown, Check } from "lucide-react"
import { getNavItems } from "@/components/features/navigation/nav.config" // Import dynamic config
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
import { useRouter } from "next/router"

export function Sidebar() {
    const router = useRouter()
    // Extract slug from router query. It can be a string or array, take the first one if array.
    const slugQuery = router.query.slug
    const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || ""

    const { companyId, setCompanyId } = useCompany()
    const [companies, setCompanies] = useState<Company[]>([])
    const [isOpen, setIsOpen] = useState(false)

    // Generate nav items based on current slug
    const navItems = getNavItems(slug)

    // Fetch companies list
    useEffect(() => {
        fetchUserCompanies().then((data) => {
            setCompanies(data)
        })
    }, [])

    // Sync context with URL slug if present and valid
    // This ensures that if user lands on /dashboard/[slug], the context is updated
    useEffect(() => {
        if (slug && companies.length > 0) {
            // Find company by slug OR id (fallback)
            const matchedCompany = companies.find(c => c.slug === slug || c.id === slug)

            if (matchedCompany && matchedCompany.id !== companyId) {
                setCompanyId(matchedCompany.id)
            }
        }
    }, [slug, companies, companyId, setCompanyId])

    // Get current selected company
    const selectedCompany = companies.find((c) => c.id === companyId)

    // Handle company selection
    const handleSelectCompany = (company: Company) => {
        setCompanyId(company.id)
        setIsOpen(false)
        // Navigate to the dashboard of the selected company
        // Use slug if available, otherwise ID
        const targetSlug = company.slug || company.id;
        router.push(`/dashboard/${targetSlug}`)
    }

    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-sidebar">
            <div className="h-14 flex items-center px-4 border-b">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <button className="flex w-full h-10 items-center justify-between rounded-lg border border-border bg-background px-3 text-left text-sm transition-colors hover:bg-muted">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground truncate">Company</span>
                                <span className="font-medium text-foreground truncate leading-none pb-0.5">
                                    {selectedCompany ? selectedCompany.name : "Select Company..."}
                                </span>
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
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
                {navItems.map((item, index) => (
                    <NavItem key={index} item={item} />
                ))}
            </nav>
        </aside>
    )
}
