import { RefundBeli } from '@/@types/refund-beli.types';

const refundBeliDB: RefundBeli[] = Array.from({ length: 100 }).map((_, i) => ({
  id: String(i + 1),
  noPembelian: 'TRX-011',
  tanggal: '31/12/2026',
  namaSupplier: 'PT XX',
  totalPembelian: 90000000,
  totalRefund: 90000000,
  kasMasuk: 'BCA IDR',
  keterangan: 'Terima tagihan John Doe',
}));

export const getRefundBeli = async (): Promise<RefundBeli[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...refundBeliDB]), 300);
  });
};
