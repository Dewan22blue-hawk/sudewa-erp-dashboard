import type {
  WithholdingTaxReport,
  WithholdingTaxReportListParams,
  WithholdingTaxReportListResponse,
  UpdateWithholdingTaxReportPayload,
} from '@/@types/laporan-bukti-potong.types';

// Dummy Data
let dummyData: WithholdingTaxReport[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  company_id: 1,
  tgl_invoice: '2026-02-12',
  no_invoice: `INV-WJY/1/2025-${String(i + 1).padStart(4, '0')}`,
  nama_customer: 'SARANA KENCANA MULYA',
  no_bukpot: '25007TVP6',
  masa_bukpot: '1',
  nominal_invoice: 1225000,
  pph: 24500,
  uang_muka_pph: 'Dari Bukti Potong',
  jumlah_pembayaran: 0,
  tgl_dibayar: '2026-02-12',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getWithholdingTaxReports(params: WithholdingTaxReportListParams): Promise<WithholdingTaxReportListResponse> {
  await delay(500); // Simulate network latency

  let filtered = [...dummyData];

  // For dummy purposes, we filter by search only
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.no_invoice.toLowerCase().includes(searchLower) ||
        item.nama_customer.toLowerCase().includes(searchLower) ||
        item.no_bukpot.toLowerCase().includes(searchLower)
    );
  }

  const page = params.page || 1;
  const perPage = params.per_page || 10;
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    meta: {
      current_page: page,
      from: total === 0 ? 0 : start + 1,
      last_page: lastPage,
      per_page: perPage,
      to: Math.min(end, total),
      total,
    },
  };
}

export async function getWithholdingTaxReportById(id: number | string): Promise<WithholdingTaxReport> {
  await delay(300);
  const found = dummyData.find((item) => item.id === Number(id));
  if (!found) {
    throw new Error('Data not found');
  }
  return found;
}

export async function updateWithholdingTaxReport(id: number | string, payload: UpdateWithholdingTaxReportPayload): Promise<WithholdingTaxReport> {
  await delay(500);
  const index = dummyData.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    throw new Error('Data not found');
  }

  dummyData[index] = {
    ...dummyData[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };

  return dummyData[index];
}

export async function deleteWithholdingTaxReport(id: number | string): Promise<void> {
  await delay(500);
  const index = dummyData.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    throw new Error('Data not found');
  }
  dummyData.splice(index, 1);
}
