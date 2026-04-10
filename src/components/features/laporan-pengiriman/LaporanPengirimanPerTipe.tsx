import LaporanPengirimanTable from '@/components/features/laporan-pengiriman/LaporanPengirimanTable';
import { PengirimanItem } from '@/services/laporan-pengiriman.service';

interface Props {
  data: PengirimanItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function LaporanPengirimanPerTipe({
  data,
  pagination,
  isLoading,
  onPageChange,
}: Props) {
  return (
    <LaporanPengirimanTable
      data={data}
      pagination={pagination}
      isLoading={isLoading}
      onPageChange={onPageChange}
    />
  );
}
