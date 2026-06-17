import * as React from 'react';
import { ChevronLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/router';
import { useQueries } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { fetchUserCompanies } from '@/services/company.service';
import { CreateInvoicePrintDocument } from '@/components/features/create-invoice/CreateInvoicePrintDocument';
import {
  buildDetailRows,
  buildPrintPayload,
  buildProcessDefaults,
  createProcessDraftPayload,
  getInvoiceProcessDraft,
} from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { getLetterheadByCompanyId, resolveCompanyId } from '@/lib/print-letterhead';
import { getDoInvoiceById } from '@/services/do-invoice.service';
import { Button } from '@/components/ui/button';

const parseIds = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
};

const isDefined = <T,>(value: T | undefined | null): value is T => value != null;

export default function BulkCreateInvoicePrintPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const ids = React.useMemo(() => (router.isReady ? parseIds(router.query.ids) : []), [router.isReady, router.query.ids]);
  
  const [companyName, setCompanyName] = React.useState('WAJIRA JAGRATARA TRANSINDO');

  React.useEffect(() => {
    fetchUserCompanies()
      .then((companies) => {
        const resolvedId = resolveCompanyId(slug, companyId);
        const found = companies.find((company) => company.id === resolvedId || company.slug === slug);
        if (found?.name) setCompanyName(found.name.toUpperCase());
      })
      .catch(() => undefined);
  }, [companyId, slug]);

  const invoiceQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['do-invoice', 'detail', id],
      queryFn: () => getDoInvoiceById(id),
      enabled: id > 0,
    })),
  });

  const invoices = invoiceQueries.map((query) => query.data).filter(isDefined);
  const isLoading = invoiceQueries.some((query) => query.isLoading);

  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bulk-Invoices-${ids.join('-')}`,
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print {
        html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; background: white; }
        .no-print { display: none !important; }
        .print-page {
          page-break-after: always !important;
          break-after: page !important;
          background: white;
          width: 210mm;
          height: 297mm;
          overflow: hidden;
        }
        .print-page:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
      }
    `,
  });

  if (!router.isReady || isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat data invoice...</div>
      </DashboardLayout>
    );
  }

  if (!invoices.length) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Tidak ada data invoice yang ditemukan.</div>
      </DashboardLayout>
    );
  }

  const resolvedCompanyId = resolveCompanyId(router.query.slug, companyId);
  const letterheadUrl = getLetterheadByCompanyId(resolvedCompanyId) || '/invoice-letter/4-jagrataratransindo-letter.jpeg';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="no-print flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
              className="rounded-md p-1 transition-colors hover:bg-slate-100"
            >
              <ChevronLeft className="h-5 w-5 text-slate-500" />
            </button>
            <div>
              <h1 className="text-[18px] font-semibold text-slate-900">Cetak Massal Invoice</h1>
              <p className="text-sm text-slate-500">Total terpilih: {invoices.length} dokumen</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => handlePrint()}
            className="gap-2 rounded-xl bg-[#1f4163] hover:bg-[#183552]"
          >
            <Printer className="h-4 w-4" />
            Print All ({invoices.length})
          </Button>
        </div>

        <div ref={printRef} className="space-y-8 bg-slate-50 p-4 rounded-2xl border border-slate-200 print:bg-white print:p-0 print:border-none print:space-y-0">
          {invoices.map((invoice) => {
            const draft = getInvoiceProcessDraft(invoice.id) ?? createProcessDraftPayload(invoice, buildProcessDefaults(invoice), undefined);
            const rows = buildDetailRows([invoice], draft.selectedExpeditionIds);
            const payload = buildPrintPayload(invoice, rows, companyName, draft);

            return (
              <div key={invoice.id} className="print-page bg-white shadow-md print:shadow-none p-4 print:p-0 rounded-2xl border border-slate-100 print:border-none">
                <CreateInvoicePrintDocument
                  payload={payload}
                  letterheadUrl={letterheadUrl}
                  hideControls
                />
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
