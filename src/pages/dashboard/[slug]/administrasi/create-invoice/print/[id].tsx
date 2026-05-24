import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { fetchUserCompanies } from '@/services/company.service';
import { CreateInvoicePrintDocument } from '@/components/features/create-invoice/CreateInvoicePrintDocument';
import { buildDetailRows, buildPrintPayload, buildProcessDefaults, createProcessDraftPayload, getInvoiceProcessDraft } from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { getLetterheadByCompanyId, resolveCompanyId } from '@/lib/print-letterhead';
import { useDoInvoiceDetail } from '@/hooks/useDoInvoice';

export default function CreateInvoicePrintPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const id = router.isReady && typeof router.query.id === 'string' ? Number(router.query.id) : 0;
  const expeditionId = router.isReady && typeof router.query.expeditionId === 'string' ? Number(router.query.expeditionId) : 0;
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [companyName, setCompanyName] = React.useState('WAJIRA JAGRATARA TRANSINDO');
  const detailQuery = useDoInvoiceDetail(router.isReady && id > 0 ? id : null);

  React.useEffect(() => {
    fetchUserCompanies()
      .then((companies) => {
        const resolvedId = resolveCompanyId(slug, companyId);
        const found = companies.find((company) => company.id === resolvedId || company.slug === slug);
        if (found?.name) setCompanyName(found.name.toUpperCase());
      })
      .catch(() => undefined);
  }, [companyId, slug]);

  if (!router.isReady || detailQuery.isLoading) {
    return <DashboardLayout><div className="py-20 text-center text-sm text-slate-500">Memuat invoice...</div></DashboardLayout>;
  }

  if (!detailQuery.data) {
    return <DashboardLayout><div className="py-20 text-center text-sm text-slate-500">Data invoice tidak ditemukan.</div></DashboardLayout>;
  }

  const draft = getInvoiceProcessDraft(detailQuery.data.id) ?? createProcessDraftPayload(detailQuery.data, buildProcessDefaults(detailQuery.data), expeditionId ? [expeditionId] : undefined);
  const rows = buildDetailRows([detailQuery.data], expeditionId ? [expeditionId] : draft.selectedExpeditionIds);
  const payload = buildPrintPayload(detailQuery.data, rows, companyName, draft);
  const resolvedCompanyId = resolveCompanyId(router.query.slug, companyId);
  const letterheadUrl = getLetterheadByCompanyId(resolvedCompanyId) || '/invoice-letter/4-jagrataratransindo-letter.jpeg';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="no-print flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <button type="button" onClick={() => router.push(`/dashboard/${slug}/administrasi/create-invoice/detail/${id}`)} className="rounded-md p-1 transition-colors hover:bg-slate-100">
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900">Invoice {payload.invoiceCode}</h1>
            <p className="text-sm text-slate-500">Dibuat: {payload.draft.date}</p>
          </div>
        </div>

        <CreateInvoicePrintDocument payload={payload} letterheadUrl={letterheadUrl} />
      </div>
    </DashboardLayout>
  );
}
