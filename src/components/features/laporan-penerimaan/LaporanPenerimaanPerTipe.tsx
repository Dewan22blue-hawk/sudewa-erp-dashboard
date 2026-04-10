import LaporanPenerimaanTable from '@/components/features/laporan-penerimaan/LaporanPenerimaanTable';
import { PenerimaanItem } from '@/services/laporan-penerimaan.service';

interface Props {
  data: PenerimaanItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function LaporanPenerimaanPerTipe({
  data,
  pagination,
  isLoading,
  onPageChange,
}: Props) {
  return (
    <LaporanPenerimaanTable
      data={data}
      pagination={pagination}
      isLoading={isLoading}
      onPageChange={onPageChange}
    />
  );
}
