import { RefundJual } from '@/types/refund-jual.types';

const refundJualDB: RefundJual[] = Array.from({ length: 100 }).map((_, i) => ({
  id: `refund-jual-${i + 1}`,
  noPenjualan: 'TRX-011',
  tanggal: '31/12/2026',
  namaCustomer: 'John Doe',
  totalPenjualan: 90000000,
  totalRefund: 90000000,
  kasKeluar: 'BCA IDR',
  keterangan: 'Terima tagihan John Doe',
}));

export const refundJualService = {
  getAll(): RefundJual[] {
    return [...refundJualDB];
  },
};
