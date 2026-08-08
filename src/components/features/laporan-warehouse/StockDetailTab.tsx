"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';
import { useGetWarehouseStockDetail } from '@/hooks/useLaporanWarehouse';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { ReferenceLink } from '@/components/ui/reference-link';
import { useRouter } from 'next/router';
import { CopyBox } from '@/components/ui/copy-box';
import { currenciesFormat } from '@/components/ui/currenciesFormat';

type StockDetailTabProps = {
  perPage: number;
  machineNumber: string;
  onActionsChange?: (actions: { print: () => void; download: () => void }) => void;
};

const toCsvLine = (cells: Array<string | number>): string =>
  cells
    .map((cell) => {
      const safe = String(cell).replace(/"/g, '""');
      return `"${safe}"`;
    })
    .join(',');

export default function StockDetailTab({ perPage, machineNumber: initialMachineNumber, onActionsChange }: StockDetailTabProps) {
  const [page, setPage] = useState(1);
  const [machineNumber, setMachineNumber] = useState(initialMachineNumber || '');
  const [chassisNumber, setChassisNumber] = useState('');
  const [color, setColor] = useState('');
  const [stockState, setStockState] = useState('');
  const [inStock, setInStock] = useState('true');

  const debouncedMachineNumber = useDebouncedValue(machineNumber, 500);
  const debouncedChassisNumber = useDebouncedValue(chassisNumber, 500);
  const debouncedColor = useDebouncedValue(color, 500);

  const {
    data: response,
    isLoading,
    isError,
  } = useGetWarehouseStockDetail({
    warehouse_id: 1,
    page,
    per_page: perPage,
  });

  const rawRows = useMemo(() => response?.data || [], [response?.data]);

  const rows = useMemo(() => {
    let result = [...rawRows];

    if (debouncedMachineNumber) {
      const q = debouncedMachineNumber.toLowerCase();
      result = result.filter(r => r.machine_number?.toLowerCase().includes(q));
    }
    if (debouncedChassisNumber) {
      const q = debouncedChassisNumber.toLowerCase();
      result = result.filter(r => r.chassis_number?.toLowerCase().includes(q));
    }
    if (debouncedColor) {
      const q = debouncedColor.toLowerCase();
      result = result.filter(r => r.color?.toLowerCase().includes(q));
    }
    if (stockState && stockState !== 'all') {
      result = result.filter(r => r.stock_status === stockState || r.status === stockState);
    }
    if (inStock && inStock !== 'all') {
      const isInStockStr = String(inStock).toLowerCase();
      if (isInStockStr === 'true') {
        result = result.filter(r => r.stock_available > 0);
      } else if (isInStockStr === 'false') {
        result = result.filter(r => r.stock_available <= 0);
      }
    }

    return result;
  }, [rawRows, debouncedMachineNumber, debouncedChassisNumber, debouncedColor, stockState, inStock]);
  const pagination = response || {
    current_page: 1,
    data: [],
    last_page: 1,
    per_page: perPage,
    total: 0,
    from: 0,
    to: 0,
  };

  const grandTotalPurchase = useMemo(
    () => rows.reduce((total, item) => total + item.purchase_price, 0),
    [rows],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    if (rows.length === 0) {
      toast.error('Tidak ada data untuk diunduh');
      return;
    }

    const header = ['NO', 'KODE UNIT', 'TIPE UNIT', 'WARNA', 'NO MESIN', 'NO RANGKA', 'HARGA BELI', 'TERSEDIA', 'STOCK STATUS', 'STATUS'];
    const lines = [toCsvLine(header)];

    rows.forEach((item, index) => {
      lines.push(
        toCsvLine([
          (pagination.from > 0 ? pagination.from - 1 : 0) + index + 1,
          item.unit_type?.code || '-',
          item.person || '-',
          item.unit_type?.name || '-',
          item.color || '-',
          item.machine_number || '-',
          item.chassis_number || '-',
          item.purchase_price,
          item.stock_available || 0,
          item.stock_status || '-',
          item.status || '-',
        ]),
      );
    });

    lines.push(toCsvLine(['', '', '', '', '', '', '', 'GRAND TOTAL', grandTotalPurchase, '', '', '']));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `warehouse-stock-detail-page-${page}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success('Data stock detail berhasil diunduh');
  }, [grandTotalPurchase, page, pagination.from, rows]);

  useEffect(() => {
    onActionsChange?.({ print: handlePrint, download: handleDownload });
  }, [handleDownload, handlePrint, onActionsChange]);

  const router = useRouter();
  const { slug } = router.query;
  const slugStr = typeof slug === 'string' ? slug : '';

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'KODE UNIT',
        accessorKey: 'unit_type.code',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.unit_type?.code || '-'} />
      },
      {
        header: 'TIPE UNIT',
        accessorKey: 'unit_type.name',
        sortable: true,
        alignment: 'left',
        cell: (item) => item.unit_type?.name ? <ReferenceLink href={`/dashboard/${slugStr}/master/unit-type?search=${item.unit_type?.name}`}>
          {item.unit_type?.name}
        </ReferenceLink> : '-',
      },
      {
        header: 'WARNA',
        accessorKey: 'color',
        sortable: true,
        alignment: 'left',
        cell: (item) => item.color || '-',
      },
      {
        header: 'NO MESIN',
        accessorKey: 'machine_number',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.machine_number || '-'} />
      },
      {
        header: 'NO RANGKA',
        accessorKey: 'chassis_number',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.chassis_number || '-'} />
      },
      {
        header: 'HARGA BELI',
        accessorKey: 'purchase_price',
        sortable: true,
        alignment: 'right',
        cell: (item) => currenciesFormat('idr', item.purchase_price),
      },
      {
        header: 'TERSEDIA',
        accessorKey: 'stock_available',
        sortable: true,
        alignment: 'center',
        cell: (item) => (item.stock_available || 0).toLocaleString('id-ID'),
      },
      {
        header: 'STOCK STATUS',
        accessorKey: 'stock_status',
        sortable: true,
        alignment: 'center',
        cell: (item) => item.stock_status || '-',
      },
      {
        header: 'STATUS',
        accessorKey: 'status',
        sortable: true,
        alignment: 'center',
        cell: (item) => item.status || '-',
      },
    ],
    [slugStr]
  );

  const footerRow = useMemo(
    () => (
      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-t border-slate-200 font-semibold print:text-[10px]">
        <TableCell colSpan={7} className="px-4 py-4 pr-10 text-right text-slate-900">
          GRAND TOTAL
        </TableCell>
        <TableCell className="px-4 py-4 text-right text-slate-900">{currenciesFormat('idr', grandTotalPurchase)}</TableCell>
        <TableCell colSpan={3}></TableCell>
      </TableRow>
    ),
    [grandTotalPurchase]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 no-print">
        <Input
          placeholder="Cari No Mesin..."
          value={machineNumber}
          onChange={(e) => {
            setMachineNumber(e.target.value);
            setPage(1);
          }}
          className="w-40 bg-white"
        />
        <Input
          placeholder="Cari No Rangka..."
          value={chassisNumber}
          onChange={(e) => {
            setChassisNumber(e.target.value);
            setPage(1);
          }}
          className="w-40 bg-white"
        />
        <Input
          placeholder="Warna..."
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            setPage(1);
          }}
          className="w-32 bg-white"
        />
        <Select value={stockState || 'all'} onValueChange={(val) => { setStockState(val); setPage(1); }}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="Stock State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua State</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="bad">Bad</SelectItem>
          </SelectContent>
        </Select>
        <Select value={inStock || 'all'} onValueChange={(val) => { setInStock(val); setPage(1); }}>
          <SelectTrigger className="w-32 bg-white">
            <SelectValue placeholder="In Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="true">In Stock</SelectItem>
            <SelectItem value="false">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center text-red-500 py-16 bg-white rounded-md border border-gray-200">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">Gagal memuat data stock detail</p>
        </div>
      ) : (
        <BaseTable
          data={rows}
          columns={columns}
          loading={isLoading}
          footer={footerRow}
          meta={{
            currentPage: pagination.current_page,
            perPage: pagination.per_page,
            lastPage: pagination.last_page,
            total: rows.length > 0 ? rows.length : pagination.total,
          }}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
