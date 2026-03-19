import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoiceForm } from '@/components/features/create-invoice/InvoiceForm';
import { addInvoiceRecord, toInvoiceRecord, generateInvoiceId, type InvoiceFormValues } from '@/components/features/create-invoice/create-invoice.data';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { slug } = router.query;

  const handleSubmit = (values: InvoiceFormValues) => {
    const newId = generateInvoiceId();
    const record = toInvoiceRecord(newId, values);

    // Persist to localStorage so the print page can read it
    addInvoiceRecord(record);
    toast.success('Invoice berhasil dibuat');

    // Navigate to print view
    router.push(`/dashboard/${slug}/administrasi/create-invoice/print/${newId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.back()} className="rounded-md p-1 transition-colors hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 leading-none">Form Input Invoice</h1>
            <p className="text-sm text-gray-500 mt-1">Buat invoice untuk pelanggan ekspedisi</p>
          </div>
        </div>

        {/* Invoice Form */}
        <InvoiceForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  );
}
