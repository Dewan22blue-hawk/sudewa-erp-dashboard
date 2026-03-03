import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchUserCompanies } from '@/services/company.service';
import { Loader2 } from 'lucide-react';

export default function DashboardIndex() {
  const router = useRouter();
  const { companyId, isLoading } = useCompany();

  useEffect(() => {
    async function handleRedirect() {
      if (!isLoading) {
        if (companyId) {
          try {
            const companies = await fetchUserCompanies();
            const company = companies.find((c) => String(c.id) === String(companyId));

            if (company && company.slug) {
              router.replace(`/dashboard/${company.slug}`);
            } else {
              // Fallback if company not found or no slug
              router.replace('/select-company');
            }
          } catch (error) {
            console.error('Failed to fetch companies for redirect', error);
            router.replace('/select-company');
          }
        } else {
          router.replace('/select-company');
        }
      }
    }

    handleRedirect();
  }, [companyId, isLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
