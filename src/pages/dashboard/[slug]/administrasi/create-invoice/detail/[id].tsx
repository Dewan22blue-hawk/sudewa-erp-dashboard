import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { CreateInvoiceProcessForm } from '@/components/features/create-invoice/CreateInvoiceProcessForm';
import {
  buildDetailRows,
  buildProcessDefaults,
  createProcessDraftPayload,
  getInvoiceProcessDraft,
  saveInvoiceProcessDraft,
} from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCreateInvoiceDetail, useProcessCreateInvoice } from '@/hooks/useCreateInvoice';

export default function CreateInvoiceDetailPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = router.isReady && typeof router.query.id === 'string' ? Number(router.query.id) : 0;

  const detailQuery = useCreateInvoiceDetail(router.isReady && id > 0 ? id : null);
  const processMutation = useProcessCreateInvoice();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [values, setValues] = React.useState({
    date: '',
    subject: '',
    attachment: '',
    letterContent: '',
    customerName: '',
  });

  React.useEffect(() => {
    if (!detailQuery.data) return;

    const draft = getInvoiceProcessDraft(detailQuery.data.id);
    const defaults = buildProcessDefaults([detailQuery.data], draft);
    setValues({
      date: defaults.date,
      subject: defaults.subject,
      attachment: defaults.attachment,
      letterContent: defaults.letterContent,
      customerName: defaults.customerName,
    });
  }, [detailQuery.data]);

  const handleSubmit = async () => {
    if (!detailQuery.data) return;

    const payload = {
      date: values.date,
      subject: values.subject,
      attachment: values.attachment,
      letter_content: values.letterContent,
      do_expedition_invoice_ids: [detailQuery.data.id],
    };

    saveInvoiceProcessDraft(createProcessDraftPayload(detailQuery.data.id, [detailQuery.data.id], values));
    setIsRedirecting(true);

    processMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Invoice berhasil diproses');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Sinkronisasi proses invoice gagal, namun halaman print tetap dibuka');
      },
    });

    await router.push(`/dashboard/${slug}/administrasi/create-invoice/print/${detailQuery.data.id}`);
  };

  if (!router.isReady || detailQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat detail invoice...</div>
      </DashboardLayout>
    );
  }

  if (!id || !detailQuery.data) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Data invoice tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <CreateInvoiceProcessForm
        title="Form Detail Invoice"
        values={values}
        rows={buildDetailRows([detailQuery.data])}
        onBack={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
        onCancel={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
        onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
        isSubmitting={processMutation.isPending || isRedirecting}
      />
    </DashboardLayout>
  );
}
