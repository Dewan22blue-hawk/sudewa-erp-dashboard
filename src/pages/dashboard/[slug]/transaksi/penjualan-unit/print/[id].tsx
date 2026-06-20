import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { fetchUserCompanies } from '@/services/company.service';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { getLetterheadByCompanyId, resolveCompanyId } from '@/lib/print-letterhead';
import { useSalesDetail } from '@/hooks/useSales';
import { useUnitItemDetailsByTransactionId } from '@/hooks/useUnitItemDetail';
import SalesPrintDocument from '@/components/features/sales/SalesPrintDocument';

export default function SalesPrintPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const id = router.isReady && typeof router.query.id === 'string' ? router.query.id : '';
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [companyName, setCompanyName] = React.useState('WAJIRA JAGRATARA TRANSINDO');
  
  const detailQuery = useSalesDetail(id);
  const detailsQuery = useUnitItemDetailsByTransactionId(id);

  React.useEffect(() => {
    if (!router.isReady) return;
    fetchUserCompanies()
      .then((companies) => {
        const resolvedId = resolveCompanyId(slug, companyId);
        const found = companies.find((company) => company.id === resolvedId || company.slug === slug);
        if (found?.name) setCompanyName(found.name.toUpperCase());
      })
      .catch(() => undefined);
  }, [companyId, slug, router.isReady]);

  if (!router.isReady || detailQuery.isLoading || detailsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat data penjualan...</div>
      </DashboardLayout>
    );
  }

  if (!detailQuery.data || !detailQuery.data.ui) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Data penjualan tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  const resolvedCompanyId = resolveCompanyId(router.query.slug, companyId);
  const letterheadUrl = getLetterheadByCompanyId(resolvedCompanyId) || '/invoice-letter/4-jagrataratransindo-letter.jpeg';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="no-print flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-none">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/${slug}/transaksi/penjualan-unit/${id}`)}
            className="rounded-md p-1 transition-colors hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Sales Invoice {detailQuery.data.ui.kodeJual}</h1>
            <p className="text-sm text-slate-500">
              Tanggal: {detailQuery.data.ui.tanggal || '-'}
            </p>
          </div>
        </div>

        <SalesPrintDocument
          sales={detailQuery.data.ui}
          items={detailsQuery.data ?? []}
          letterheadUrl={letterheadUrl}
          companyName={companyName}
        />
      </div>
    </DashboardLayout>
  );
}
