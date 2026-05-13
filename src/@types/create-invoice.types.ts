import type { PaginatedResult } from './pagination.types';
import type { DoEkspedisi, DoEkspedisiItem } from './do-ekspedisi.types';

export interface DoExpeditionInvoice {
  id: number;
  uuid?: string;
  doExpeditionId: number;
  qty: number;
  doLetterCode: string | null;
  doAssignmentCode: string | null;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
  doExpedition?: DoEkspedisi | null;
}

export interface DoExpeditionInvoiceListParams {
  search?: string;
  order_by?: string;
  order_sort?: 'asc' | 'desc';
}

export interface DoExpeditionInvoiceCreatePayload {
  do_code: string;
}

export interface DoExpeditionInvoiceUpdatePayload {
  qty: number | string;
  do_letter_code: string;
  do_assignment_code: string;
}

export interface DoExpeditionInvoiceProcessPayload {
  date: string;
  subject: string;
  attachment: string;
  letter_content: string;
  do_expedition_invoice_ids: Array<number | string>;
}

export interface InvoiceProcessDraft {
  primaryInvoiceId: number;
  invoiceIds: number[];
  date: string;
  subject: string;
  attachment: string;
  letterContent: string;
  customerName: string;
  savedAt: string;
}

export interface CreateInvoiceTableRow {
  invoice: DoExpeditionInvoice;
  doCode: string;
  date: string;
  customer: string;
  loadingIn: string;
  destination: string;
  loadingOut: string;
  description: string;
  driverFee: number;
  otherFee: number;
  invoiceFee: number;
  additionalFee: number;
  ppnFee: number;
}

export interface CreateInvoiceDetailRow {
  invoiceId: number;
  doExpeditionId: number;
  date: string;
  doCode: string;
  noPolisi: string;
  type: string;
  driver: string;
  loadingIn: string;
  destination: string;
  loadingOut: string;
  doLetterCode: string;
  qty: number;
  doAssignmentCode: string;
  invoiceExpedition: number;
  additionalCost: number;
}

export interface CreateInvoiceProcessDefaults {
  date: string;
  subject: string;
  attachment: string;
  letterContent: string;
  customerName: string;
}

export interface CreateInvoiceProcessValues extends CreateInvoiceProcessDefaults {}

export interface CreateInvoicePrintPayload {
  draft: InvoiceProcessDraft;
  rows: CreateInvoiceDetailRow[];
  invoiceNumber: string;
  companyName: string;
  recipientAttention?: string | null;
}

export interface DoExpeditionInvoiceProcessResponse {
  id?: number | string;
  uuid?: string;
  [key: string]: unknown;
}

export interface CreateInvoiceDoItemSummary {
  customers: string[];
  loadingIns: string[];
  destinations: string[];
  loadingOuts: string[];
  invoiceFee: number;
  additionalFee: number;
  otherFee: number;
  driverFee: number;
  ppnFee: number;
  rows: DoEkspedisiItem[];
}

export type DoExpeditionInvoiceListResponse = PaginatedResult<DoExpeditionInvoice>;
