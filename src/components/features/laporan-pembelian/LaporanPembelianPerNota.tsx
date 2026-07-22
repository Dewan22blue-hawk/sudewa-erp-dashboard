import { useEffect, useMemo, useState } from 'react';
import { PurchaseTransactionItem } from '@/services/laporan-pembelian.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';

interface Props {
  data: PurchaseTransactionItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number; perPage: number; };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

interface PerNotaRow {
  id: string;
  noPembelian: string;
  tanggal: string;
  tipeUnit: string;
  qty: number;
  hargaBeli: number;
  biayaBbn: number;
  biayaEkspedisi: number;
  biayaLainnya: number;
  hpp: number;
  dpp: number;
  ppn: number;
  jumlah: number;
}

const toNumber = (val: unknown) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (val: number) => `Rp ${toNumber(val).toLocaleString('id-ID')}`;
const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy', { locale: id });
};

export default function LaporanPembelianPerNota({ data, pagination, isLoading, onPageChange }: Props) {
  const flattenedData: PerNotaRow[] = useMemo(() => {
    return data.flatMap((item) => {
      const units = Array.isArray(item.unit_transaction_items) ? item.unit_transaction_items : [];

      if (units.length === 0) {
        return [{
          id: `${item.id}-fallback`,
          noPembelian: item.code,
          tanggal: item.created_at,
          tipeUnit: '-',
          qty: 0,
          hargaBeli: 0,
          biayaBbn: 0,
          biayaEkspedisi: 0,
          biayaLainnya: 0,
          hpp: 0,
          dpp: 0,
          ppn: 0,
          jumlah: toNumber(item.transaction_bruto_total),
        }];
      }

      return units.map((unit, idx) => ({
        id: `${item.id}-${idx}`,
        noPembelian: item.code,
        tanggal: item.created_at,
        tipeUnit: unit.unit_type?.name || '-',
        qty: toNumber(unit.qty_total),
        hargaBeli: toNumber(unit.price),
        biayaBbn: toNumber(unit.bbn_price),
        biayaEkspedisi: toNumber(unit.expedition_fee),
        biayaLainnya: toNumber(unit.other_fee),
        hpp: toNumber(unit.hpp_total_price),
        dpp: toNumber(unit.dpp_total_price),
        ppn: toNumber(unit.ppn_total_price),
        jumlah: toNumber(item.transaction_bruto_total),
      }));
    });
  }, [data]);

  const rowsPerPage = pagination.perPage || 50;
  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    setTablePage(1);
  }, [data]);

  const totalRows = flattenedData.length;
  const lastTablePage = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(tablePage, lastTablePage);

  useEffect(() => {
    if (tablePage > lastTablePage) {
      setTablePage(lastTablePage);
    }
  }, [tablePage, lastTablePage]);

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return flattenedData.slice(start, end);
  }, [flattenedData, safePage, rowsPerPage]);

  // Keep prop consumed for compatibility with parent contract; pagination on this table is row-based.
  void onPageChange;

  const columns = useMemo<ColumnDef<PerNotaRow>[]>(
    () => [
      {
        header: 'NO',
        alignment: 'center',
        cell: (_, idx) => idx + 1 + (safePage - 1) * rowsPerPage,
      },
      {
        header: 'NO PEMBELIAN',
        accessorKey: 'noPembelian',
        sortable: true,
        alignment: 'left',
      },
      {
        header: 'TGL BELI',
        accessorKey: 'tanggal',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatDate(item.tanggal),
      },
      {
        header: 'TIPE UNIT',
        accessorKey: 'tipeUnit',
        sortable: true,
        alignment: 'left',
      },
      {
        header: 'QTY',
        accessorKey: 'qty',
        sortable: true,
        alignment: 'center',
      },
      {
        header: 'HARGA BELI',
        accessorKey: 'hargaBeli',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatCurrency(item.hargaBeli),
      },
      {
        header: 'BIAYA BBN',
        accessorKey: 'biayaBbn',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatCurrency(item.biayaBbn),
      },
      {
        header: 'BIAYA EKSPEDISI',
        accessorKey: 'biayaEkspedisi',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatCurrency(item.biayaEkspedisi),
      },
      {
        header: 'BIAYA LAINNYA',
        accessorKey: 'biayaLainnya',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatCurrency(item.biayaLainnya),
      },
      {
        header: 'HPP',
        accessorKey: 'hpp',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatCurrency(item.hpp),
      },
      {
        header: 'DPP',
        accessorKey: 'dpp',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatCurrency(item.dpp),
      },
      {
        header: 'PPN',
        accessorKey: 'ppn',
        sortable: true,
        alignment: 'center',
        cell: (item) => formatCurrency(item.ppn),
      },
      {
        header: 'JUMLAH',
        accessorKey: 'jumlah',
        sortable: true,
        alignment: 'center',
        cell: (item) => (
          <span className="font-semibold text-slate-900">{formatCurrency(item.jumlah)}</span>
        ),
      },
    ],
    [safePage, rowsPerPage]
  );

  return (
    <BaseTable
      data={pagedData}
      columns={columns}
      loading={isLoading}
      meta={{
        currentPage: safePage,
        perPage: rowsPerPage,
        lastPage: lastTablePage,
        total: totalRows,
      }}
      onPageChange={setTablePage}
    />
  );
}
