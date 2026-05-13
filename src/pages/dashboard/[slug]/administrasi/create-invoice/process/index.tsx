import * as React from 'react';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { CreateInvoiceProcessForm } from '@/components/features/create-invoice/CreateInvoiceProcessForm';
import {
  buildDetailRows,
  buildProcessDefaults,
  createProcessDraftPayload,
  saveInvoiceProcessDraft,
} from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProcessCreateInvoice } from '@/hooks/useCreateInvoice';
import { getDoExpeditionInvoiceById } from '@/services/create-invoice.service';

const parseIds = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
};

const isDefined = <T,>(value: T | undefined | null): value is T => value != null;

export default function ProcessCreateInvoicePage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const ids = React.useMemo(() => (router.isReady ? parseIds(router.query.ids) : []), [router.isReady, router.query.ids]);
  const processMutation = useProcessCreateInvoice();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [values, setValues] = React.useState({
    date: '',
    subject: '',
    attachment: '',
    letterContent: '',
    customerName: '',
  });

  const invoiceQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['create-invoice', 'detail', id],
      queryFn: () => getDoExpeditionInvoiceById(id),
      enabled: id > 0,
    })),
  });

  const invoices = invoiceQueries.map((query) => query.data).filter(isDefined);
  const isLoading = invoiceQueries.some((query) => query.isLoading);
  const invoiceSignature = React.useMemo(() => invoices.map((invoice) => invoice.id).join(','), [invoices]);

  React.useEffect(() => {
    if (!invoiceSignature) return;
    const defaults = buildProcessDefaults(invoices);
    setValues((current) =>
      current.date || current.subject || current.attachment || current.letterContent || current.customerName
        ? current
        : {
            date: defaults.date,
            subject: defaults.subject,
            attachment: defaults.attachment,
            letterContent: defaults.letterContent,
            customerName: defaults.customerName,
          },
    );
  }, [invoiceSignature, invoices]);

  const handleSubmit = async () => {
    if (!ids.length) {
      toast.error('Pilih data invoice terlebih dahulu');
      return;
    }

    const primaryId = ids[0];
    const payload = {
      date: values.date,
      subject: values.subject,
      attachment: values.attachment,
      letter_content: values.letterContent,
      do_expedition_invoice_ids: ids,
    };

    saveInvoiceProcessDraft(createProcessDraftPayload(primaryId, ids, values));
    setIsRedirecting(true);

    processMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Invoice berhasil diproses');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Sinkronisasi proses invoice gagal, namun halaman print tetap dibuka');
      },
    });

    await router.push(`/dashboard/${slug}/administrasi/create-invoice/print/${primaryId}`);
  };

  if (!router.isReady || isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat data invoice...</div>
      </DashboardLayout>
    );
  }

  if (!ids.length) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Tidak ada data invoice yang dipilih.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <CreateInvoiceProcessForm
        title="Form Detail Invoice"
        values={values}
        rows={buildDetailRows(invoices)}
        onBack={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
        onCancel={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
        onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
        isSubmitting={processMutation.isPending || isRedirecting}
      />
    </DashboardLayout>
  );
}
