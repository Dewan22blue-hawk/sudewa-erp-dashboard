import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { companyMenuMap } from '@/configs/menu/company-menu.map';
import { MenuItem } from '@/types/menu.types';
import { Company, fetchCompanyDetail } from '@/services/company.service';

const MODULE_MAP: Record<string, string[]> = {
    'master-data': ['Master Data'],
    'transaction': ['Administrasi'],
    'warehouse': ['Warehouse'],
    'finance': ['Finance'],
    'report': ['Laporan'],
};

const ALWAYS_ALLOWED = ['Dashboard', 'Settings'];

export function useCompanyMenu(companies: Company[]): { menus: MenuItem[], isLoading: boolean } {
    const router = useRouter();
    const slugQuery = router.query.slug;
    const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';

    const { companyId } = useCompany();
    const [allowedLabels, setAllowedLabels] = useState<string[]>(ALWAYS_ALLOWED);
    const [isLoading, setIsLoading] = useState(false);

    // Find the exact company based on ID from Context, to get its safe slug or name
    const currentCompany = companies.find((c) => String(c.id) === String(companyId));

    useEffect(() => {
        if (!currentCompany?.slug) return;
        setIsLoading(true);
        fetchCompanyDetail(currentCompany.slug)
            .then((data) => {
                const labels = [...ALWAYS_ALLOWED];
                if (data.modules) {
                    data.modules.forEach(m => {
                        const mapped = MODULE_MAP[m.slug || ''];
                        if (mapped) {
                            labels.push(...mapped);
                        }
                    });
                }
                setAllowedLabels(labels);
            })
            .catch((err) => {
                console.error('Failed to fetch company modules:', err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [currentCompany?.slug]);

    const mappedMenus = useMemo(() => {
        if (!currentCompany) return [];

        // Normalize name/slug to match key in map
        const compSlug = (currentCompany.slug || currentCompany.name || '').toLowerCase();

        // Mapping logik
        let baseMenus: MenuItem[] = [];
        if (compSlug.includes('transindo')) {
            baseMenus = companyMenuMap['transindo'](slug);
        } else if (compSlug.includes('yanotama')) {
            baseMenus = companyMenuMap['yanotama'](slug);
        } else {
            baseMenus = companyMenuMap.default(slug);
        }

        // Fallback if no specific menu
        return baseMenus.filter(m => allowedLabels.includes(m.label));
    }, [currentCompany, slug, allowedLabels]);

    return { menus: mappedMenus, isLoading };
}
