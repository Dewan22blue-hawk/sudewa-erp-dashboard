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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  // Backend enum statuses
  normal: { label: 'Normal', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold' },
  minor_damage: { label: 'Minor Damage', className: 'border-amber-200 bg-amber-50 text-amber-700 font-semibold' },
  major_damage: { label: 'Major Damage', className: 'border-red-200 bg-red-50 text-red-700 font-semibold' },
  returned: { label: 'Returned', className: 'border-purple-200 bg-purple-50 text-purple-700 font-semibold' },
  refunded: { label: 'Refunded', className: 'border-orange-200 bg-orange-50 text-orange-700 font-semibold' },
  lost: { label: 'Lost', className: 'border-rose-200 bg-rose-50 text-rose-700 font-semibold' },
  in_repair: { label: 'In Repair', className: 'border-blue-200 bg-blue-50 text-blue-700 font-semibold' },

  // Fallback / legacy statuses
  draft: { label: 'Draft', className: 'border-slate-200 bg-slate-50 text-slate-600 font-medium' },
  cancel: { label: 'Cancel', className: 'border-red-200 bg-red-50 text-red-700 font-medium' },
  rejected: { label: 'Rejected', className: 'border-red-200 bg-red-50 text-red-700 font-medium' },
  prepare: { label: 'Prepare', className: 'border-amber-200 bg-amber-50 text-amber-700 font-medium' },
  inbound_purchase_order: { label: 'Purchase Order', className: 'border-blue-200 bg-blue-50 text-blue-700 font-medium' },
  inbound_incoming_goods: { label: 'In Transit', className: 'border-blue-200 bg-blue-50 text-blue-700 font-medium' },
  inbound_receipt: { label: 'Available', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold' },
  inbound_return: { label: 'Refund', className: 'border-orange-200 bg-orange-50 text-orange-700 font-medium' },
  outbound_reserved: { label: 'Reserved', className: 'border-orange-200 bg-orange-50 text-orange-700 font-medium' },
  outbound_in_transit: { label: 'In Transit', className: 'border-indigo-200 bg-indigo-50 text-indigo-700 font-medium' },
  outbound_delivered: { label: 'Delivered', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium' },
  outbound_return: { label: 'Return', className: 'border-rose-200 bg-rose-50 text-rose-700 font-medium' },
};

const renderStatus = (status: string) => {
  const config = statusConfig[status] ?? {
    label: status ? status.replace(/_/g, ' ') : '-',
    className: 'border-slate-200 bg-slate-50 text-slate-700 font-medium',
  };

  return (
    <Badge variant="outline" className={cn('capitalize', config.className)}>
      {config.label}
    </Badge>
  );
};

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
        header: 'Kode Unit',
        accessorKey: 'unit_type.code',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.unit_type?.code || '-'} />
      },
      {
        header: 'Tipe Unit',
        accessorKey: 'unit_type.name',
        sortable: true,
        alignment: 'left',
        cell: (item) => item.unit_type?.name ? <ReferenceLink href={`/dashboard/${slugStr}/master/type-unit?search=${item.unit_type?.name}`}>
          {item.unit_type?.name}
        </ReferenceLink> : '-',
      },
      {
        header: 'Warna',
        accessorKey: 'color',
        sortable: true,
        alignment: 'left',
        cell: (item) => item.color || '-',
      },
      {
        header: 'Nomor Mesin',
        accessorKey: 'machine_number',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.machine_number || '-'} />
      },
      {
        header: 'Nomor Rangka',
        accessorKey: 'chassis_number',
        sortable: true,
        alignment: 'left',
        cell: (item) => <CopyBox text={item.chassis_number || '-'} />
      },
      {
        header: 'Harga Beli',
        accessorKey: 'purchase_price',
        sortable: true,
        alignment: 'right',
        cell: (item) => currenciesFormat('idr', item.purchase_price),
      },
      {
        header: 'Tersedia',
        accessorKey: 'stock_available',
        sortable: true,
        alignment: 'center',
        cell: (item) => (item.stock_available || 0).toLocaleString('id-ID'),
      },
      {
        header: 'Stock Status',
        accessorKey: 'stock_status',
        sortable: true,
        alignment: 'center',
        cell: (item) => {
          const config: Record<string, { label: string; name: string; className: string }> = {
            draft: { label: 'Draft', name: 'Draft', className: 'border-slate-200 bg-slate-50 text-slate-600 font-medium' },
            cancel: { label: 'Cancel', name: 'Batal', className: 'border-rose-200 bg-rose-50 text-rose-700 font-medium' },
            prepare: { label: 'Prepare', name: 'Disiapkan', className: 'border-amber-200 bg-amber-50 text-amber-700 font-medium' },
            purchase_order: { label: 'Purchase Order', name: 'Purchase Order', className: 'border-blue-200 bg-blue-50 text-blue-700 font-semibold' },
            in_transit: { label: 'In Transit', name: 'Dalam Perjalanan', className: 'border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold' },
            receipt: { label: 'Receipt', name: 'Diterima', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold' },
          };
          const stateVal = item?.stock_status ?? 'draft';
          const match = config[stateVal] ?? {
            label: stateVal.replace(/_/g, ' '),
            className: 'border-slate-200 bg-slate-50 text-slate-700',
          };
          return (
            <Badge variant="outline" className={cn('capitalize font-semibold', match.className)}>
              {item?.isSoldUnit || item?.is_sold_unit ? 'Terkirim' : (match.name || match.label)}
            </Badge>
          );
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        sortable: true,
        alignment: 'center',
        cell: (item) => renderStatus(item.status),
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
