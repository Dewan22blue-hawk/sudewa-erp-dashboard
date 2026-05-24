import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import type { ApiError } from '@/@types/api';
import type { CreateInvoiceProcessValues } from '@/@types/create-invoice.types';
import { CreateInvoiceProcessForm } from '@/components/features/create-invoice/CreateInvoiceProcessForm';
import { buildDetailRows, buildProcessDefaults, createProcessDraftPayload, getInvoiceProcessDraft, saveInvoiceProcessDraft } from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDoInvoiceDetail, useProcessDoInvoice } from '@/hooks/useDoInvoice';
import { ApiValidationError } from '@/lib/api/response';

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

export default function CreateInvoiceDetailPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = router.isReady && typeof router.query.id === 'string' ? Number(router.query.id) : 0;

  const detailQuery = useDoInvoiceDetail(router.isReady && id > 0 ? id : null);
  const processInvoiceMutation = useProcessDoInvoice();
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

  React.useEffect(() => {
    if (!detailQuery.data) return;
    const draft = getInvoiceProcessDraft(detailQuery.data.id);
    setValues(buildProcessDefaults(detailQuery.data, draft));
    const rows = buildDetailRows([detailQuery.data]);
    const selectable = rows.filter((row) => row.expeditionId > 0 && !row.isPrinted).map((row) => row.expeditionId);
    const draftSelection = (draft?.selectedExpeditionIds ?? []).filter((id) => selectable.includes(id));
    setSelectedExpeditionIds(draftSelection.length ? draftSelection : selectable);
  }, [detailQuery.data]);

  const rows = React.useMemo(() => (detailQuery.data ? buildDetailRows([detailQuery.data]) : []), [detailQuery.data]);

  const handlePrintInvoice = async () => {
    if (!detailQuery.data) return;
    if (!selectedExpeditionIds.length) {
      toast.error('Pilih minimal satu data DO yang belum diprint');
      return;
    }

    const payload = createProcessDraftPayload(detailQuery.data, values, selectedExpeditionIds);
    saveInvoiceProcessDraft(payload);

    processInvoiceMutation.mutate({
      id: detailQuery.data.id,
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

    await router.push(`/dashboard/${slug}/administrasi/create-invoice/print/${detailQuery.data.id}`);
  };

  if (!router.isReady || detailQuery.isLoading) {
    return <DashboardLayout><div className="py-20 text-center text-sm text-slate-500">Memuat detail invoice...</div></DashboardLayout>;
  }

  if (!detailQuery.data) {
    return <DashboardLayout><div className="py-20 text-center text-sm text-slate-500">Data invoice tidak ditemukan.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <CreateInvoiceProcessForm
        title="Form Detail Invoice"
        values={values}
        rows={rows}
        statusLabel={detailQuery.data.isAlreadyPrint ? 'Sudah diprint' : 'Belum diprint'}
        selectedExpeditionIds={selectedExpeditionIds}
        onBack={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
        onCancel={() => router.push(`/dashboard/${slug}/administrasi/create-invoice`)}
        onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
        onSubmit={handlePrintInvoice}
        onToggleExpedition={(expeditionId, checked) =>
          setSelectedExpeditionIds((current) =>
            checked ? Array.from(new Set([...current, expeditionId])) : current.filter((item) => item !== expeditionId),
          )
        }
        onToggleAllExpeditions={(checked) =>
          setSelectedExpeditionIds(checked ? rows.filter((row) => row.expeditionId > 0 && !row.isPrinted).map((row) => row.expeditionId) : [])
        }
        isSubmitting={processInvoiceMutation.isPending}
      />
    </DashboardLayout>
  );
}
