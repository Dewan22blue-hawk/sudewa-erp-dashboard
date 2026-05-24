import * as React from 'react';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import type { ApiError } from '@/@types/api';
import type { CreateInvoiceProcessValues } from '@/@types/create-invoice.types';
import { CreateInvoiceProcessForm } from '@/components/features/create-invoice/CreateInvoiceProcessForm';
import { buildDetailRows, buildProcessDefaults, createBulkProcessDraftPayload, saveInvoiceProcessDraft } from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProcessDoInvoice } from '@/hooks/useDoInvoice';
import { ApiValidationError } from '@/lib/api/response';
import { getDoInvoiceById } from '@/services/do-invoice.service';

const parseIds = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];
  return raw.split(',').map((item) => Number(item.trim())).filter((item) => Number.isFinite(item) && item > 0);
};

const isDefined = <T,>(value: T | undefined | null): value is T => value != null;

const extractValidationMessages = (error: unknown) => {
  if (error instanceof ApiValidationError) {
    const messages = Object.entries(error.fieldErrors ?? {}).flatMap(([field, fieldMessages]) =>
      (fieldMessages ?? []).map((message) => `${field}: ${message}`),
    );

    return {
      title: error.message || 'Validation error',
      description: messages.join('\n'),
    };
  }

  const apiError = error as ApiError & {
    fieldErrors?: Record<string, string[]>;
    response?: { data?: { errors?: Record<string, string[]>; message?: string } };
  };

  const rawFieldErrors =
    apiError?.fieldErrors ??
    apiError?.response?.data?.errors ??
    (typeof apiError?.details === 'object' && apiError.details ? (apiError.details as Record<string, string[]>) : undefined);

  if (rawFieldErrors && typeof rawFieldErrors === 'object') {
    const messages = Object.entries(rawFieldErrors).flatMap(([field, fieldMessages]) => {
      if (Array.isArray(fieldMessages)) {
        return fieldMessages.map((message) => `${field}: ${message}`);
      }
      return [`${field}: ${String(fieldMessages)}`];
    });

    return {
      title: apiError?.message || apiError?.response?.data?.message || 'Validation error',
      description: messages.join('\n'),
    };
  }

  return {
    title: apiError?.message || 'Validation error',
    description: '',
  };
};

export default function ProcessCreateInvoicePage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const ids = React.useMemo(() => (router.isReady ? parseIds(router.query.ids) : []), [router.isReady, router.query.ids]);
  const processMutation = useProcessDoInvoice();
  const [selectedExpeditionIds, setSelectedExpeditionIds] = React.useState<number[]>([]);
  const [values, setValues] = React.useState<CreateInvoiceProcessValues>({
    invoiceCode: '',
    date: '',
    subject: '',
    attachmentLabel: '',
    letterContent: '',
    customerName: '',
    description: '',
    attachmentFile: null,
  });

  const invoiceQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['do-invoice', 'detail', id],
      queryFn: () => getDoInvoiceById(id),
      enabled: id > 0,
    })),
  });

  const invoices = invoiceQueries.map((query) => query.data).filter(isDefined);
  const isLoading = invoiceQueries.some((query) => query.isLoading);

  React.useEffect(() => {
    if (!invoices.length) return;
    const primary = invoices[0];
    const base = buildProcessDefaults(primary);
    const rows = buildDetailRows(invoices);
    setValues({
      ...base,
      invoiceCode: `BULK-${ids.join('-')}`,
      customerName: Array.from(new Set(invoices.map((invoice) => invoice.customer?.name).filter(Boolean))).join(', '),
      description: `Process ${ids.length} invoice`,
    });
    setSelectedExpeditionIds(rows.filter((row) => row.expeditionId > 0 && !row.isPrinted).map((row) => row.expeditionId));
  }, [ids, invoices]);

  const rows = React.useMemo(() => buildDetailRows(invoices), [invoices]);

  const handleSubmit = async () => {
    if (!invoices.length) return;
    if (!selectedExpeditionIds.length) {
      toast.error('Pilih minimal satu data DO yang belum diprint');
      return;
    }
    const primary = invoices[0];
    saveInvoiceProcessDraft(createBulkProcessDraftPayload(primary.id, ids, values.invoiceCode, values, selectedExpeditionIds));

    processMutation.mutate({
      id: primary.id,
      payload: {
        date: values.date,
        subject: values.subject,
        attachment: values.attachmentFile ?? values.attachmentLabel,
        letter_content: values.letterContent,
        do_expedition_invoice_ids: selectedExpeditionIds,
        customer_name: values.customerName,
      },
    }, {
      onSuccess: () => toast.success('Invoice berhasil diproses'),
      onError: (error: unknown) => {
        const validation = extractValidationMessages(error);
        toast.error(validation.title, {
          description: validation.description || 'Sinkronisasi proses invoice gagal, namun print preview tetap dibuka',
        });
      },
    });

    await router.push(`/dashboard/${slug}/administrasi/create-invoice/print/${primary.id}`);
  };

  if (!router.isReady || isLoading) {
    return <DashboardLayout><div className="py-20 text-center text-sm text-slate-500">Memuat data invoice...</div></DashboardLayout>;
  }

  if (!invoices.length) {
    return <DashboardLayout><div className="py-20 text-center text-sm text-slate-500">Tidak ada data invoice yang dipilih.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <CreateInvoiceProcessForm
        title="Form Detail Invoice"
        mode="bulk"
        selectedInvoiceCount={ids.length}
        values={values}
        rows={rows}
        selectedExpeditionIds={selectedExpeditionIds}
        onBack={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
        onCancel={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
        onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
        onToggleExpedition={(expeditionId, checked) =>
          setSelectedExpeditionIds((current) =>
            checked ? Array.from(new Set([...current, expeditionId])) : current.filter((item) => item !== expeditionId),
          )
        }
        onToggleAllExpeditions={(checked) =>
          setSelectedExpeditionIds(checked ? rows.filter((row) => row.expeditionId > 0 && !row.isPrinted).map((row) => row.expeditionId) : [])
        }
        isSubmitting={processMutation.isPending}
      />
    </DashboardLayout>
  );
}
