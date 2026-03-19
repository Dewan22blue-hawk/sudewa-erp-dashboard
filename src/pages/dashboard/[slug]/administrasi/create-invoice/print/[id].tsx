import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoicePrintView } from '@/components/features/create-invoice/InvoicePrintView';
import { getInvoiceById, formatDate, type InvoiceRecord } from '@/components/features/create-invoice/create-invoice.data';

export default function InvoicePrintPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const invoiceId = Array.isArray(id) ? id[0] : id;
    const found = getInvoiceById(invoiceId);
    setInvoice(found ?? null);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400 text-sm">Memuat invoice...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-gray-500 text-lg">Invoice tidak ditemukan.</p>
          <button type="button" onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">
            Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-2 no-print">
          <button type="button" onClick={() => router.back()} className="rounded-md p-1 transition-colors hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 leading-none">Invoice {invoice.nomorInvoice}</h1>
            <p className="text-sm text-gray-500 mt-1">Dibuat: {formatDate(invoice.tanggal)}</p>
          </div>
        </div>

        {/* Invoice Print View */}
        <InvoicePrintView invoice={invoice} />
      </div>
    </DashboardLayout>
  );
}
