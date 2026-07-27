import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchUserCompanies } from '@/services/company.service';
import { LoadingState } from '@/components/ui/loading-state';

export default function DashboardIndex() {
  const router = useRouter();
  const { companyId, isLoading } = useCompany();

  useEffect(() => {
    async function handleRedirect() {
      if (!isLoading) {
        if (companyId) {
          try {
            const companies = await fetchUserCompanies();
            const filteredCompanies = companies.filter((c) => c.name.toLowerCase().includes('morindo'));
            const company = filteredCompanies.find((c) => String(c.id) === String(companyId));

            if (company && company.slug) {
              router.replace(`/dashboard/${company.slug}`);
            } else {
              // Fallback if company not found or no slug
              router.replace('/dashboard/1');
            }
          } catch (error) {
            console.error('Failed to fetch companies for redirect', error);
            router.replace('/dashboard/1');
          }
        } else {
          router.replace('/dashboard/1');
        }
      }
    }

    handleRedirect();
  }, [companyId, isLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingState variant="page" className="h-screen" />
    </div>
  );
}
