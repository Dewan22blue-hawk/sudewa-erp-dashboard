import { ChevronDown, Check } from 'lucide-react';
import { getNavItems, type NavItemConfig } from '@/components/features/navigation/nav.config';
import { useEffect, useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchUserCompanies, Company } from '@/services/company.service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import Link from 'next/link';

export function Sidebar() {
  const router = useRouter();
  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';

  const { companyId, setCompanyId } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const navItems = getNavItems(slug);

  useEffect(() => {
    fetchUserCompanies().then((data) => {
      setCompanies(data);
    });
  }, []);

  useEffect(() => {
    if (slug && companies.length > 0) {
      const matchedCompany = companies.find((c) => c.slug === slug || String(c.id) === String(slug));

      if (matchedCompany && String(matchedCompany.id) !== companyId) {
        setCompanyId(String(matchedCompany.id));
      }
    }
  }, [slug, companies, companyId, setCompanyId]);

  const selectedCompany = companies.find((c) => String(c.id) === companyId);

  const handleSelectCompany = (company: Company) => {
    setCompanyId(String(company.id));
    setIsOpen(false);
    const targetSlug = company.slug || company.id;
    router.push(`/dashboard/${targetSlug}`);
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-[#F9FAFB]">
      {/* Company Selector */}
      <div className="px-4 py-4 border-b border-gray-200">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left shadow-sm hover:bg-gray-50 transition-colors">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] uppercase font-semibold text-gray-400">Company</span>
                <span className="font-medium text-gray-900 truncate">{selectedCompany ? selectedCompany.name : 'Select Company'}</span>
              </div>
              <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', isOpen && 'rotate-180')} />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSelectCompany(company)}
                  className={cn('flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-100', String(company.id) === companyId && 'bg-gray-100')}
                >
                  <span>{company.name}</span>
                  {String(company.id) === companyId && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Section Label */}
        <div className="mb-4 text-sm font-semibold text-gray-500">Main Menu</div>

        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <SidebarNavItem key={index} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

/* =========================================
   CUSTOM NAV ITEM (FOR PERFECT CONTROL)
========================================= */

function SidebarNavItem({ item }: { item: NavItemConfig }) {
  const router = useRouter();

  // Modular function for exact route awareness
  const isActiveRoute = (href?: string, exact?: boolean) => {
    if (!href) return false;
    const currentPath = router.asPath.split('?')[0];
    if (exact) {
      return currentPath === href;
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const isChildActive = item.children?.some((child) => isActiveRoute(child.href, child.exact)) || false;

  const [open, setOpen] = useState(isChildActive || false);

  // Tetap terbuka saat refresh (dan saat navigasi parent active)
  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  const handleToggle = () => {
    if (isChildActive) return; // Tidak boleh collapse saat active
    setOpen(!open);
  };

  return (
    <div>
      {/* Parent Button */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isChildActive ? 'text-[#111827]' : 'text-gray-700 hover:bg-gray-100',
        )}
      >
        <span>{item.label}</span>
        {item.children && <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180 text-gray-900', !open && 'text-gray-500')} />}
      </button>

      {/* Children Links */}
      {item.children && open && (
        <div className="relative mt-1 ml-3 space-y-1">
          {/* Vertical Line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />

          {item.children.map((child, idx) => {
            const active = isActiveRoute(child.href, child.exact);

            return (
              <Link
                key={idx}
                href={child.href || '#'}
                className={cn(
                  'group relative ml-1 block rounded-md pl-3 pr-2 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active ? 'bg-[#E5E7EB] text-[#111827] font-[500]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {active && <div className="absolute left-0 top-0 h-full w-[3px] rounded-r-md bg-primary transition-transform duration-300 animate-in slide-in-from-left-1" />}
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
