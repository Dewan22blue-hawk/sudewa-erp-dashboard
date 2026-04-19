import { ChevronDown, Check, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchUserCompanies, Company } from '@/services/company.service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCompanyMenu } from '@/hooks/use-company-menu';
import { MenuItem } from '@/types/menu.types';

function CompanySelector({ companies, companyId, setCompanyId }: { companies: Company[], companyId: string | null, setCompanyId: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const selectedCompany = companies.find((c) => String(c.id) === String(companyId));

  const handleSelectCompany = (company: Company) => {
    setCompanyId(String(company.id));
    setIsOpen(false);
    const targetSlug = company.slug || company.id;
    router.push(`/dashboard/${targetSlug}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-left shadow-sm hover:bg-gray-50 transition-colors">
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] uppercase font-semibold text-gray-400">Company</span>
            <span className="font-medium text-gray-900 truncate uppercase">{selectedCompany ? selectedCompany.name : 'Select Company'}</span>
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
              className={cn('flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-100', String(company.id) === String(companyId) && 'bg-gray-100')}
            >
              <span className="uppercase">{company.name}</span>
              {String(company.id) === String(companyId) && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function Sidebar() {
  const router = useRouter();
  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';

  const { companyId, setCompanyId } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchUserCompanies().then((data) => {
      setCompanies(data);
    });
  }, []);

  const { menus, isLoading: isMenuLoading } = useCompanyMenu(companies);

  useEffect(() => {
    if (slug && companies.length > 0) {
      const matchedCompany = companies.find((c) => c.slug === slug || String(c.id) === String(slug));

      if (matchedCompany && String(matchedCompany.id) !== String(companyId)) {
        setCompanyId(String(matchedCompany.id));
      }
    }
  }, [slug, companies, companyId, setCompanyId]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [router.asPath]);


  const sidebarContent = (
    <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-[#F9FAFB]">
      <div className="flex h-16 shrink-0 items-center px-4 border-b border-gray-200">
        <div className="flex w-full items-center gap-2">
          <CompanySelector
            companies={companies}
            companyId={companyId}
            setCompanyId={setCompanyId}
          />

          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden ml-1 shrink-0 rounded-md p-1.5 text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-4 text-sm font-semibold text-gray-500">Main Menu</div>

        <nav className="space-y-1">
          {isMenuLoading ? (
            <div className="space-y-2 animate-pulse px-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-md w-full"></div>
              ))}
            </div>
          ) : (
            menus.map((item, index) => (
              <SidebarNavItem key={index} item={item} />
            ))
          )}
        </nav>
      </div>
    </aside>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed mt-3 left-4 z-40 rounded-md border border-gray-200 bg-white p-2 shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:flex h-full w-full">
        {sidebarContent}
      </div>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}

function SidebarNavItem({ item }: { item: MenuItem }) {
  const router = useRouter();

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

  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  const handleToggle = () => {
    if (isChildActive) return;
    setOpen(!open);
  };

  return (
    <div>
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

      {item.children && open && (
        <div className="relative mt-1 ml-3 space-y-1">
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