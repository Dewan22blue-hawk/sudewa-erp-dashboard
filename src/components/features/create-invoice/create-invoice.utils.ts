import type {
  CreateInvoiceDetailRow,
  CreateInvoicePrintPayload,
  CreateInvoiceProcessDefaults,
  CreateInvoiceProcessValues,
  CreateInvoiceTableRow,
  DoExpeditionInvoice,
  InvoiceProcessDraft,
} from '@/@types/create-invoice.types';

const PROCESS_DRAFT_STORAGE_KEY = 'wajira_do_invoice_process_drafts';

const toDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDisplayDate = (value?: string | null) => {
  const date = toDate(value);
  if (!date) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatLongDate = (value?: string | null) => {
  const date = toDate(value);
  if (!date) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatMoney = (value?: number | null, minimumFractionDigits = 2) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(Number(value ?? 0));

const joinValues = (values: string[]) => values.filter(Boolean).join(', ') || '-';

export const toCreateInvoiceRow = (invoice: DoExpeditionInvoice): CreateInvoiceTableRow => {
  const items = invoice.doExpedition?.items ?? [];
  const customers = Array.from(new Set(items.map((item) => item.customer?.name || item.customerName).filter(Boolean)));
  const loadingIns = Array.from(new Set(items.map((item) => item.loadingIn).filter(Boolean)));
  const destinations = Array.from(new Set(items.map((item) => item.destination).filter(Boolean)));
  const loadingOuts = Array.from(new Set(items.map((item) => item.loadingOut).filter(Boolean)));

  return {
    invoice,
    doCode: invoice.doExpedition?.doCode ?? '-',
    date: invoice.doExpedition?.date ?? invoice.createdAt ?? '',
    customer: joinValues(customers as string[]),
    loadingIn: joinValues(loadingIns),
    destination: joinValues(destinations),
    loadingOut: joinValues(loadingOuts),
    description: invoice.description || (invoice.qty ? `${invoice.qty} unit` : '-'),
    driverFee: items.reduce((sum, item) => sum + Number(item.driverFee || 0), 0),
    otherFee: items.reduce((sum, item) => sum + Number(item.otherFee || 0), 0),
    invoiceFee: items.reduce((sum, item) => sum + Number(item.invoiceFee || 0), 0),
    additionalFee: items.reduce((sum, item) => sum + Number(item.additionalCostFee || 0), 0),
    ppnFee: items.reduce((sum, item) => sum + Number(item.ppnFee || 0), 0),
  };
};

export const matchesCreateInvoiceSearch = (row: CreateInvoiceTableRow, search: string) => {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return true;

  return [
    row.doCode,
    row.customer,
    row.loadingIn,
    row.destination,
    row.loadingOut,
    row.description,
  ]
    .join(' ')
    .toLowerCase()
    .includes(keyword);
};

export const buildDetailRows = (invoices: DoExpeditionInvoice[]): CreateInvoiceDetailRow[] => {
  return invoices.flatMap((invoice) => {
    const doExpedition = invoice.doExpedition;
    const items = doExpedition?.items?.length ? doExpedition.items : [];

    if (!items.length) {
      return [
        {
          invoiceId: invoice.id,
          doExpeditionId: invoice.doExpeditionId,
          date: doExpedition?.date ?? invoice.createdAt ?? '',
          doCode: doExpedition?.doCode ?? '-',
          noPolisi: doExpedition?.vehicle?.registrationNumber ?? '-',
          type: doExpedition?.vehicle?.type ?? '-',
          driver: doExpedition?.driver?.name ?? '-',
          loadingIn: '-',
          destination: '-',
          loadingOut: '-',
          doLetterCode: invoice.doLetterCode ?? '-',
          qty: invoice.qty,
          doAssignmentCode: invoice.doAssignmentCode ?? '-',
          invoiceExpedition: 0,
          additionalCost: 0,
        },
      ];
    }

    return items.map((item) => ({
      invoiceId: invoice.id,
      doExpeditionId: invoice.doExpeditionId,
      date: doExpedition?.date ?? invoice.createdAt ?? '',
      doCode: doExpedition?.doCode ?? '-',
      noPolisi: doExpedition?.vehicle?.registrationNumber ?? '-',
      type: doExpedition?.vehicle?.type ?? '-',
      driver: doExpedition?.driver?.name ?? '-',
      loadingIn: item.loadingIn || '-',
      destination: item.destination || '-',
      loadingOut: item.loadingOut || '-',
      doLetterCode: invoice.doLetterCode ?? '-',
      qty: invoice.qty,
      doAssignmentCode: invoice.doAssignmentCode ?? '-',
      invoiceExpedition: Number(item.invoiceFee || 0),
      additionalCost: Number(item.additionalCostFee || 0),
    }));
  });
};

export const getDefaultCustomerName = (invoices: DoExpeditionInvoice[]) => {
  const customers = Array.from(
    new Set(
      invoices.flatMap((invoice) =>
        (invoice.doExpedition?.items ?? [])
          .map((item) => item.customer?.name || item.customerName)
          .filter(Boolean),
      ),
    ),
  );

  return customers.join(', ');
};

export const getDefaultRecipientAttention = (invoices: DoExpeditionInvoice[]) => {
  const pics = Array.from(
    new Set(
      invoices.flatMap((invoice) =>
        (invoice.doExpedition?.items ?? [])
          .map((item) => item.customer?.pic?.trim())
          .filter(Boolean),
      ),
    ),
  );

  return pics[0] ?? null;
};

export const buildProcessDefaults = (invoices: DoExpeditionInvoice[], draft?: InvoiceProcessDraft | null): CreateInvoiceProcessDefaults => ({
  date: draft?.date ?? new Date().toISOString().slice(0, 10),
  subject: draft?.subject ?? 'Invoice Ekspedisi',
  attachment: draft?.attachment ?? '1 berkas.',
  letterContent: draft?.letterContent ?? 'Mohon pembayaran dapat dilakukan ke :',
  customerName: draft?.customerName ?? getDefaultCustomerName(invoices),
});

const readDraftMap = (): Record<string, InvoiceProcessDraft> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(PROCESS_DRAFT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, InvoiceProcessDraft>;
  } catch {
    return {};
  }
};

const writeDraftMap = (value: Record<string, InvoiceProcessDraft>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROCESS_DRAFT_STORAGE_KEY, JSON.stringify(value));
};

export const getInvoiceProcessDraft = (id: number | string): InvoiceProcessDraft | null => {
  const map = readDraftMap();
  return map[String(id)] ?? null;
};

export const saveInvoiceProcessDraft = (draft: InvoiceProcessDraft) => {
  const map = readDraftMap();
  map[String(draft.primaryInvoiceId)] = draft;
  writeDraftMap(map);
};

export const removeInvoiceProcessDraft = (id: number | string) => {
  const map = readDraftMap();
  delete map[String(id)];
  writeDraftMap(map);
};

export const createProcessDraftPayload = (
  primaryInvoiceId: number,
  invoiceIds: number[],
  values: CreateInvoiceProcessValues,
): InvoiceProcessDraft => ({
  primaryInvoiceId,
  invoiceIds,
  date: values.date,
  subject: values.subject,
  attachment: values.attachment,
  letterContent: values.letterContent,
  customerName: values.customerName,
  savedAt: new Date().toISOString(),
});

export const buildPrintPayload = (
  invoiceNumber: string,
  companyName: string,
  draft: InvoiceProcessDraft,
  rows: CreateInvoiceDetailRow[],
  recipientAttention?: string | null,
): CreateInvoicePrintPayload => ({
  invoiceNumber,
  companyName,
  draft,
  rows,
  recipientAttention,
});
