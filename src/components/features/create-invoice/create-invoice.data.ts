// ============================================================
// TYPES
// ============================================================

export interface InvoiceUploadValue {
  fileName: string;
  fileSize: number;
  fileType: string;
  previewUrl?: string;
}

export interface InvoiceCostItem {
  id: number;
  tanggal: string;
  noPolisi: string;
  type: string;
  driver: string;
  muat: string;
  tujuanKirim: string;
  bongkar: string;
  noSuratDO: string;
  qty: number;
  invoiceEkspedisi: number;
  biayaTambahan: number;
}

export interface InvoiceRecord {
  id: string;
  nomorInvoice: string;
  lampiran: string;
  perihal: string;
  tanggal: string;
  namaCustomer: string;
  alamat: string;
  catatanTambahan: string;
  rincianBiaya: InvoiceCostItem[];
  lampiran1: InvoiceUploadValue | null;
  lampiran2: InvoiceUploadValue | null;
  lampiran3: InvoiceUploadValue | null;
  createdAt: string;
}

export interface InvoiceFormValues {
  nomorInvoice: string;
  lampiran: string;
  perihal: string;
  tanggal: string;
  namaCustomer: string;
  alamat: string;
  catatanTambahan: string;
  rincianBiaya: InvoiceCostItem[];
  lampiran1: InvoiceUploadValue | null;
  lampiran2: InvoiceUploadValue | null;
  lampiran3: InvoiceUploadValue | null;
}

export interface InvoiceCostFormValues {
  tanggal: string;
  noPolisi: string;
  type: string;
  driver: string;
  muat: string;
  tujuanKirim: string;
  bongkar: string;
  noSuratDO: string;
  qty: string;
  invoiceEkspedisi: string;
  biayaTambahan: string;
}

// ============================================================
// STORAGE KEY
// ============================================================

const STORAGE_KEY = 'wajira_invoice_records';

// ============================================================
// DUMMY DATA (initial seed)
// ============================================================

const INITIAL_DUMMY_RECORDS: InvoiceRecord[] = [
  {
    id: 'INV-WJR0001',
    nomorInvoice: 'INV-WJR0001',
    lampiran: '1 berkas',
    perihal: 'Invoice Ekspedisi',
    tanggal: '2026-01-20',
    namaCustomer: 'PT PRIBI CORPS INDONESIA',
    alamat: 'Jl. Raya Industri No. 45, Kawasan Industri Pulogadung, Jakarta Timur 13920',
    catatanTambahan:
      'Mohon pembayaran dapat dilakukan ke:\n1. No. Rek BCA: 456-831-1313\n2. Nama: PT WAJIRA JAGRATARA TRANSINDO\n3. Konfirmasi transfer dapat dilakukan ke no WA: 0878-6253-1313\n4. Due date pembayaran: 14 (Empat Belas) hari kerja setelah tanggal invoice dibuat.',
    rincianBiaya: [
      {
        id: 1,
        tanggal: '2026-01-15',
        noPolisi: 'AB 0000 XY',
        type: 'FUSO',
        driver: 'SYAHRONI',
        muat: 'DADAP NUV',
        tujuanKirim: 'PT SEJAHTERA KAYANYA IYA',
        bongkar: 'CIREBON',
        noSuratDO: 'DO-WJR001',
        qty: 25,
        invoiceEkspedisi: 50000000,
        biayaTambahan: 0,
      },
      {
        id: 2,
        tanggal: '2026-01-16',
        noPolisi: 'AB 1111 XY',
        type: 'FUSO',
        driver: 'BUDI SANTOSO',
        muat: 'DADAP NUV',
        tujuanKirim: 'PT MAJU BERSAMA',
        bongkar: 'BANDUNG',
        noSuratDO: 'DO-WJR002',
        qty: 20,
        invoiceEkspedisi: 40000000,
        biayaTambahan: 500000,
      },
    ],
    lampiran1: null,
    lampiran2: null,
    lampiran3: null,
    createdAt: '2026-01-20T08:00:00.000Z',
  },
];

// ============================================================
// STORAGE HELPERS
// ============================================================

export const getInvoiceRecords = (): InvoiceRecord[] => {
  if (typeof window === 'undefined') return INITIAL_DUMMY_RECORDS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as InvoiceRecord[];
    }
  } catch {
    // ignore
  }
  return INITIAL_DUMMY_RECORDS;
};

export const saveInvoiceRecords = (records: InvoiceRecord[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
};

export const addInvoiceRecord = (record: InvoiceRecord): void => {
  const existing = getInvoiceRecords();
  const updated = [record, ...existing];
  saveInvoiceRecords(updated);
};

export const getInvoiceById = (id: string): InvoiceRecord | undefined => {
  const records = getInvoiceRecords();
  return records.find((r) => r.id === id);
};

export const generateInvoiceId = (): string => {
  const records = getInvoiceRecords();
  const count = records.length + 1;
  return `INV-WJR${String(count).padStart(4, '0')}`;
};

// ============================================================
// HELPERS
// ============================================================

export const buildInvoiceFormDefaults = (record?: InvoiceRecord): InvoiceFormValues => ({
  nomorInvoice: record?.nomorInvoice ?? '',
  lampiran: record?.lampiran ?? '',
  perihal: record?.perihal ?? '',
  tanggal: record?.tanggal ?? '',
  namaCustomer: record?.namaCustomer ?? '',
  alamat: record?.alamat ?? '',
  catatanTambahan: record?.catatanTambahan ?? '',
  rincianBiaya: record?.rincianBiaya ?? [],
  lampiran1: record?.lampiran1 ?? null,
  lampiran2: record?.lampiran2 ?? null,
  lampiran3: record?.lampiran3 ?? null,
});

export const buildInvoiceCostFormDefaults = (): InvoiceCostFormValues => ({
  tanggal: '',
  noPolisi: '',
  type: '',
  driver: '',
  muat: '',
  tujuanKirim: '',
  bongkar: '',
  noSuratDO: '',
  qty: '',
  invoiceEkspedisi: '',
  biayaTambahan: '',
});

export const toInvoiceRecord = (id: string, values: InvoiceFormValues): InvoiceRecord => ({
  id,
  nomorInvoice: values.nomorInvoice,
  lampiran: values.lampiran,
  perihal: values.perihal,
  tanggal: values.tanggal,
  namaCustomer: values.namaCustomer,
  alamat: values.alamat,
  catatanTambahan: values.catatanTambahan,
  rincianBiaya: values.rincianBiaya,
  lampiran1: values.lampiran1,
  lampiran2: values.lampiran2,
  lampiran3: values.lampiran3,
  createdAt: new Date().toISOString(),
});

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/**
 * Format a raw number string with thousand separators (dots for Indonesian format)
 * e.g. "50000000" -> "50.000.000"
 */
export const formatNumberInput = (raw: string): string => {
  // Remove all non-digit characters
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  // Add thousand separators
  return Number(digits).toLocaleString('id-ID');
};

/**
 * Parse a formatted number string back to a plain number string
 * e.g. "50.000.000" -> "50000000"
 */
export const parseNumberInput = (formatted: string): string => {
  return formatted.replace(/\./g, '').replace(/,/g, '');
};
