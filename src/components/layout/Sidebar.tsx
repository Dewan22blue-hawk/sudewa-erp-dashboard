import { ChevronDown, Check, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchUserCompanies, Company } from '@/services/company.service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCompanyMenu } from '@/hooks/use-company-menu';
import { MenuItem } from '@/types/menu.types';
import { clearCompanyScopedQueries } from '@/lib/session/query-cache';

function CompanySelector({ companies, companyId, setCompanyId }: { companies: Company[], companyId: string | null, setCompanyId: (id: string) => void }) {
  return (
    <div className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-left shadow-sm">
      <div className="flex flex-col overflow-hidden">
        <span className="text-[10px] uppercase font-semibold text-gray-400">Company</span>
        <span className="font-medium text-gray-900 truncate">ERP Deraly.id</span>
      </div>
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';

  const { companyId, setCompanyId } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    fetchUserCompanies().then((data) => {
      const filteredData = data.filter((c) => c.name.toLowerCase().includes('morindo'));
      setCompanies(filteredData);
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
    <aside className={cn("flex h-full w-full flex-col border-r border-gray-200 bg-[#F9FAFB] transition-[width] duration-300 ease-in-out", isDesktopCollapsed ? "w-[72px]" : "w-64")}>
      <div className={cn("flex h-16 shrink-0 items-center border-b border-gray-200", isDesktopCollapsed ? "px-0 justify-center" : "px-4")}>
        <div className="flex w-full items-center gap-2">
          {isDesktopCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <div className="relative w-8 h-8">
                <Image src="/assets/login_banner.png" alt="Logo" fill className="object-contain" sizes="32px" />
              </div>
            </div>
          ) : (
            <CompanySelector
              companies={companies}
              companyId={companyId}
              setCompanyId={setCompanyId}
            />
          )}

          <button
            onClick={() => setIsMobileOpen(false)}
            className={cn("md:hidden shrink-0 rounded-md p-1.5 text-gray-500 hover:bg-gray-200 transition-colors", !isDesktopCollapsed && "ml-1")}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto py-6", isDesktopCollapsed ? "px-2" : "px-4")}>
        <div className="mb-4 flex items-center justify-between text-sm font-semibold text-gray-500">
          {!isDesktopCollapsed && <span className="uppercase text-xs tracking-wider">Main Menu</span>}
          <button 
             onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
             className={cn("p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors", isDesktopCollapsed && "mx-auto")}
             title="Toggle Sidebar"
          >
            {isDesktopCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          </button>
        </div>

        <nav className="space-y-1">
          {isMenuLoading ? (
            <div className="space-y-2 animate-pulse px-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-md w-full"></div>
              ))}
            </div>
          ) : (
            menus.map((item, index) => (
              <SidebarNavItem key={index} item={item} isCollapsed={isDesktopCollapsed} />
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
          className="md:hidden fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm transition-opacity"
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

function SidebarNavItem({ item, isCollapsed }: { item: MenuItem; isCollapsed?: boolean }) {
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
    if (isChildActive && !isCollapsed) {
      setOpen(true);
    }
  }, [isChildActive, isCollapsed]);

  const handleToggle = () => {
    if (isChildActive && !isCollapsed) return;
    setOpen(!open);
  };

  return (
    <div className={cn(isCollapsed && "flex justify-center mb-1")}>
      <button
        onClick={handleToggle}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          'flex items-center justify-between rounded-md py-[9px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isCollapsed ? 'w-10 justify-center px-0' : 'w-full px-3',
          isChildActive ? 'text-[#111827] bg-gray-100' : 'text-gray-600 hover:bg-gray-50',
        )}
      >
        <div className="flex items-center gap-3">
          {item.icon && <item.icon className="w-[18px] h-[18px] shrink-0" />}
          {!isCollapsed && <span>{item.label}</span>}
        </div>
        {!isCollapsed && item.children && <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-200', open && 'rotate-180 text-gray-900', !open && 'text-gray-400')} />}
      </button>

      {item.children && open && !isCollapsed && (
        <div className="relative mt-1 ml-[22px] space-y-1">
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
