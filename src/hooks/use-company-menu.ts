import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { companyMenuMap } from '@/configs/menu/company-menu.map';
import { MenuItem } from '@/types/menu.types';
import { Company } from '@/services/company.service';

export function useCompanyMenu(companies: Company[]): { menus: MenuItem[] } {
    const router = useRouter();
    const slugQuery = router.query.slug;
    const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';

    const { companyId } = useCompany();

    // Find the exact company based on ID from Context, to get its safe slug or name
    const currentCompany = companies.find((c) => String(c.id) === String(companyId));

    const mappedMenus = useMemo(() => {
        if (!currentCompany) return companyMenuMap.default(slug);

        // Normalize name/slug to match key in map
        const compSlug = (currentCompany.slug || currentCompany.name || '').toLowerCase();

        // Mapping logik
        if (compSlug.includes('transindo')) {
            return companyMenuMap['transindo'](slug);
        }
        if (compSlug.includes('yanotama')) {
            return companyMenuMap['yanotama'](slug);
        }

        // Fallback if no specific menu
        return companyMenuMap.default(slug);
    }, [currentCompany, slug]);

    return { menus: mappedMenus };
}
