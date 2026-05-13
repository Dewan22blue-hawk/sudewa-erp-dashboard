import * as React from 'react';
import { useQueries } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { fetchUserCompanies } from '@/services/company.service';
import { getDoExpeditionInvoiceById } from '@/services/create-invoice.service';
import { CreateInvoicePrintDocument } from '@/components/features/create-invoice/CreateInvoicePrintDocument';
import {
  buildDetailRows,
  buildPrintPayload,
  buildProcessDefaults,
  createProcessDraftPayload,
  getDefaultRecipientAttention,
  getInvoiceProcessDraft,
} from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { getLetterheadByCompanyId, resolveCompanyId } from '@/lib/print-letterhead';

const isDefined = <T,>(value: T | undefined | null): value is T => value != null;

export default function CreateInvoicePrintPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const id = router.isReady && typeof router.query.id === 'string' ? Number(router.query.id) : 0;
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [companyName, setCompanyName] = React.useState('WAJIRA JAGRATARA TRANSINDO');

  const draft = React.useMemo(() => (router.isReady && id ? getInvoiceProcessDraft(id) : null), [router.isReady, id]);
  const invoiceIds = React.useMemo(() => {
    if (draft?.invoiceIds?.length) return draft.invoiceIds;
    return id ? [id] : [];
  }, [draft, id]);

  const invoiceQueries = useQueries({
    queries: invoiceIds.map((invoiceId) => ({
      queryKey: ['create-invoice', 'detail', invoiceId],
      queryFn: () => getDoExpeditionInvoiceById(invoiceId),
      enabled: invoiceId > 0,
    })),
  });

  React.useEffect(() => {
    fetchUserCompanies()
      .then((companies) => {
        const resolvedId = resolveCompanyId(slug, companyId);
        const found = companies.find((company) => company.id === resolvedId || company.slug === slug);
        if (found?.name) {
          setCompanyName(found.name.toUpperCase());
        }
      })
      .catch(() => {
        // ignore company lookup failure
      });
  }, [companyId, slug]);

  const isLoading = invoiceQueries.some((query) => query.isLoading);
  const invoices = invoiceQueries.map((query) => query.data).filter(isDefined);

  if (!router.isReady || isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat invoice...</div>
      </DashboardLayout>
    );
  }

  if (!id) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">ID invoice tidak valid.</div>
      </DashboardLayout>
    );
  }

  if (!invoices.length) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Data invoice tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  const fallbackDefaults = buildProcessDefaults(invoices);
  const activeDraft =
    draft ??
    createProcessDraftPayload(id, invoiceIds, {
      date: fallbackDefaults.date,
      subject: fallbackDefaults.subject,
      attachment: fallbackDefaults.attachment,
      letterContent: fallbackDefaults.letterContent,
      customerName: fallbackDefaults.customerName,
    });
  const rows = buildDetailRows(invoices);
  const firstInvoice = invoices[0]!;
  const recipientAttention = getDefaultRecipientAttention(invoices);
  const payload = buildPrintPayload(firstInvoice.doExpedition?.doCode || `INV-${id}`, companyName, activeDraft, rows, recipientAttention);

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
            <h1 className="text-[18px] font-semibold text-slate-900">Invoice {payload.invoiceNumber}</h1>
            <p className="text-sm text-slate-500">Dibuat: {activeDraft.date}</p>
          </div>
        </div>

        <CreateInvoicePrintDocument payload={payload} letterheadUrl={letterheadUrl} />
      </div>
    </DashboardLayout>
  );
}
