export interface LPJUploadValue {
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface LPJDetailItem {
  id: number;
  lpjId: number;
  tanggal: string;
  noPolisi: string;
  type: string;
  driver: string;
  invoiceEkspedisi: number;
  biayaTambahan: number;
  ujDriver: number;
  lainnya: number;
  pph2: number;
}

export interface LPJRecord {
  id: number;
  kodeLPJ: string;
  driver: string;
  noPolisi: string;
  tglBerangkat: string;
  tglKembali?: string;
  ruteAsal: string;
  ruteTujuan: string;
  muatan: string;
  totalKM: number;
  kmAwal: number;
  kmAkhir: number;
  biayaBBM?: number;
  biayaTol?: number;
  biayaLainnya?: number;
  jumlahMotor: number;
  nomorRangka: string[];
  fotoKondisiMuat?: LPJUploadValue | null;
  fotoKondisiBongkar?: LPJUploadValue | null;
  lampiranNota?: LPJUploadValue | null;
  catatanKerusakan?: string;
  catatanKeterlambatan?: string;
  catatanTambahan?: string;
}

export interface LPJFormValues {
  driver: string;
  noPolisi: string;
  tglBerangkat: string;
  tglKembali: string;
  ruteAsal: string;
  ruteTujuan: string;
  jumlahMotor: string;
  nomorRangkaText: string;
  kmAwal: string;
  kmAkhir: string;
  biayaBBM: string;
  biayaTol: string;
  biayaLainnya: string;
  catatanKerusakan: string;
  catatanKeterlambatan: string;
  catatanTambahan: string;
  fotoKondisiMuat: LPJUploadValue | null;
  fotoKondisiBongkar: LPJUploadValue | null;
  lampiranNota: LPJUploadValue | null;
}

export let DUMMY_LPJ_RECORDS: LPJRecord[] = [
  {
    id: 1,
    kodeLPJ: 'LPJ-WJR01',
    driver: 'Ahmad Syahroni',
    noPolisi: 'AB 000 XX',
    tglBerangkat: '2026-06-02',
    tglKembali: '2026-06-02',
    ruteAsal: 'Yogyakarta',
    ruteTujuan: 'Semarang',
    muatan: '25 unit',
    totalKM: 708,
    kmAwal: 1200,
    kmAkhir: 1908,
    biayaBBM: 320000,
    biayaTol: 150000,
    biayaLainnya: 80000,
    jumlahMotor: 25,
    nomorRangka: ['MH1JFB110FK123456', 'MH1JFB110FK789012', 'MH1JFB110FK345678'],
    catatanKerusakan: '',
    catatanKeterlambatan: '',
    catatanTambahan: 'Perjalanan lancar.',
  },
  {
    id: 2,
    kodeLPJ: 'LPJ-WJR02',
    driver: 'Ahmad Syahroni',
    noPolisi: 'AB 000 XX',
    tglBerangkat: '2026-06-03',
    tglKembali: '2026-06-03',
    ruteAsal: 'Yogyakarta',
    ruteTujuan: 'Semarang',
    muatan: '24 unit',
    totalKM: 702,
    kmAwal: 1908,
    kmAkhir: 2610,
    biayaBBM: 310000,
    biayaTol: 140000,
    biayaLainnya: 70000,
    jumlahMotor: 24,
    nomorRangka: ['MH1JFB110FK456789', 'MH1JFB110FK987654'],
  },
  {
    id: 3,
    kodeLPJ: 'LPJ-WJR03',
    driver: 'Ahmad Syahroni',
    noPolisi: 'AB 000 XX',
    tglBerangkat: '2026-06-04',
    tglKembali: '2026-06-04',
    ruteAsal: 'Yogyakarta',
    ruteTujuan: 'Semarang',
    muatan: '25 unit',
    totalKM: 710,
    kmAwal: 2610,
    kmAkhir: 3320,
    biayaBBM: 335000,
    biayaTol: 145000,
    biayaLainnya: 65000,
    jumlahMotor: 25,
    nomorRangka: ['MH1JFB110FK102938', 'MH1JFB110FK564738'],
  },
  {
    id: 4,
    kodeLPJ: 'LPJ-WJR04',
    driver: 'Ahmad Syahroni',
    noPolisi: 'AB 000 XX',
    tglBerangkat: '2026-06-05',
    tglKembali: '2026-06-05',
    ruteAsal: 'Yogyakarta',
    ruteTujuan: 'Semarang',
    muatan: '25 unit',
    totalKM: 708,
    kmAwal: 3320,
    kmAkhir: 4028,
    biayaBBM: 325000,
    biayaTol: 148000,
    biayaLainnya: 60000,
    jumlahMotor: 25,
    nomorRangka: ['MH1JFB110FK445566'],
  },
  {
    id: 5,
    kodeLPJ: 'LPJ-WJR05',
    driver: 'Ahmad Syahroni',
    noPolisi: 'AB 000 XX',
    tglBerangkat: '2026-06-06',
    tglKembali: '2026-06-06',
    ruteAsal: 'Yogyakarta',
    ruteTujuan: 'Semarang',
    muatan: '25 unit',
    totalKM: 708,
    kmAwal: 4028,
    kmAkhir: 4736,
    biayaBBM: 330000,
    biayaTol: 151000,
    biayaLainnya: 55000,
    jumlahMotor: 25,
    nomorRangka: ['MH1JFB110FK111222', 'MH1JFB110FK333444'],
  },
  {
    id: 6,
    kodeLPJ: 'LPJ-WJR06',
    driver: 'Ahmad Syahroni',
    noPolisi: 'AB 000 XX',
    tglBerangkat: '2026-06-07',
    tglKembali: '2026-06-07',
    ruteAsal: 'Yogyakarta',
    ruteTujuan: 'Semarang',
    muatan: '25 unit',
    totalKM: 708,
    kmAwal: 4736,
    kmAkhir: 5444,
    biayaBBM: 328000,
    biayaTol: 149000,
    biayaLainnya: 65000,
    jumlahMotor: 25,
    nomorRangka: ['MH1JFB110FK555666', 'MH1JFB110FK777888'],
  },
];

export let DUMMY_LPJ_DETAIL_ITEMS: LPJDetailItem[] = [
  {
    id: 1,
    lpjId: 1,
    tanggal: '2026-02-02',
    noPolisi: 'AB 0000 XXX',
    type: 'FUSO',
    driver: 'Ahmad Syahroni',
    invoiceEkspedisi: 50000000,
    biayaTambahan: 0,
    ujDriver: 3200000,
    lainnya: 0,
    pph2: 2750000,
  },
  {
    id: 2,
    lpjId: 1,
    tanggal: '2026-02-02',
    noPolisi: 'AB 0000 XXX',
    type: 'FUSO',
    driver: 'Ahmad Syahroni',
    invoiceEkspedisi: 50000000,
    biayaTambahan: 0,
    ujDriver: 3200000,
    lainnya: 0,
    pph2: 2750000,
  },
  {
    id: 3,
    lpjId: 1,
    tanggal: '2026-02-02',
    noPolisi: 'AB 0000 XXX',
    type: 'FUSO',
    driver: 'Ahmad Syahroni',
    invoiceEkspedisi: 50000000,
    biayaTambahan: 0,
    ujDriver: 3200000,
    lainnya: 0,
    pph2: 2750000,
  },
];

export const setDummyLPJRecords = (records: LPJRecord[]) => {
  DUMMY_LPJ_RECORDS = records;
};

export const setDummyLPJDetailItems = (items: LPJDetailItem[]) => {
  DUMMY_LPJ_DETAIL_ITEMS = items;
};

export const buildLPJFormDefaults = (record?: LPJRecord): LPJFormValues => ({
  driver: record?.driver ?? '',
  noPolisi: record?.noPolisi ?? '',
  tglBerangkat: record?.tglBerangkat ?? '',
  tglKembali: record?.tglKembali ?? '',
  ruteAsal: record?.ruteAsal ?? '',
  ruteTujuan: record?.ruteTujuan ?? '',
  jumlahMotor: record?.jumlahMotor ? String(record.jumlahMotor) : '',
  nomorRangkaText: record?.nomorRangka?.join('\n') ?? '',
  kmAwal: record?.kmAwal ? String(record.kmAwal) : '',
  kmAkhir: record?.kmAkhir ? String(record.kmAkhir) : '',
  biayaBBM: record?.biayaBBM ? String(record.biayaBBM) : '',
  biayaTol: record?.biayaTol ? String(record.biayaTol) : '',
  biayaLainnya: record?.biayaLainnya ? String(record.biayaLainnya) : '',
  catatanKerusakan: record?.catatanKerusakan ?? '',
  catatanKeterlambatan: record?.catatanKeterlambatan ?? '',
  catatanTambahan: record?.catatanTambahan ?? '',
  fotoKondisiMuat: record?.fotoKondisiMuat ?? null,
  fotoKondisiBongkar: record?.fotoKondisiBongkar ?? null,
  lampiranNota: record?.lampiranNota ?? null,
});

export const toLPJRecord = (id: number, kodeLPJ: string, values: LPJFormValues): LPJRecord => {
  const kmAwal = Number(values.kmAwal || 0);
  const kmAkhir = Number(values.kmAkhir || 0);
  const totalKM = kmAkhir > kmAwal ? kmAkhir - kmAwal : 0;
  const nomorRangka = values.nomorRangkaText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id,
    kodeLPJ,
    driver: values.driver,
    noPolisi: values.noPolisi,
    tglBerangkat: values.tglBerangkat,
    tglKembali: values.tglKembali,
    ruteAsal: values.ruteAsal,
    ruteTujuan: values.ruteTujuan,
    muatan: `${values.jumlahMotor || 0} unit`,
    totalKM,
    kmAwal,
    kmAkhir,
    biayaBBM: Number(values.biayaBBM || 0),
    biayaTol: Number(values.biayaTol || 0),
    biayaLainnya: Number(values.biayaLainnya || 0),
    jumlahMotor: Number(values.jumlahMotor || 0),
    nomorRangka,
    fotoKondisiMuat: values.fotoKondisiMuat,
    fotoKondisiBongkar: values.fotoKondisiBongkar,
    lampiranNota: values.lampiranNota,
    catatanKerusakan: values.catatanKerusakan,
    catatanKeterlambatan: values.catatanKeterlambatan,
    catatanTambahan: values.catatanTambahan,
  };
};
