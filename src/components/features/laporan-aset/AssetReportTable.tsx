import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { FinanceAsset } from '@/@types/finance-asset.types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface AssetReportTableProps {
  data: FinanceAsset[];
}

export default function AssetReportTable({ data }: AssetReportTableProps) {

  const columns = useMemo<ColumnDef<FinanceAsset>[]>(() => [
    {
      accessorKey: 'no',
      header: 'NO',
      cell: (info) => (
        <div className="text-center w-full">{info.row.index + 1}</div>
      ),
      size: 60,
    },
    {
      accessorKey: 'code',
      header: 'KODE ASET',
      size: 130,
    },
    {
      id: 'purchase_date',
      accessorFn: (row) => {
        if (!row.purchase_date) return '-';
        const d = new Date(row.purchase_date);
        return isNaN(d.getTime()) ? row.purchase_date : d.toLocaleDateString('id-ID');
      },
      header: 'TGL BELI',
      size: 120,
    },
    {
      accessorKey: 'name',
      header: 'NAMA BARANG',
      size: 200,
    },
    {
      accessorKey: 'type',
      header: 'TIPE ASET',
      size: 180,
    },
    {
      accessorKey: 'serial_number',
      header: 'SERIAL NUMBER',
      size: 150,
    },
    {
      accessorKey: 'price',
      header: () => <div className="text-right">HARGA BELI</div>,
      cell: (info) => (
        <div className="text-right">{formatCurrency(info.getValue() as number)}</div>
      ),
      size: 150,
    },
    {
      accessorKey: 'economic_age',
      header: () => <div className="text-center">UMUR EKONOMIS</div>,
      cell: (info) => (
        <div className="text-center">{info.getValue() as number} Bulan</div>
      ),
      size: 160,
    },
    {
      accessorKey: 'depreciation_per_month',
      header: () => <div className="text-right">PENYUSUTAN/BULAN</div>,
      cell: (info) => (
        <div className="text-right">{formatCurrency(info.getValue() as number)}</div>
      ),
      size: 180,
    },
    {
      accessorKey: 'final_value',
      header: () => <div className="text-right">NILAI AKHIR</div>,
      cell: (info) => (
        <div className="text-right">{formatCurrency(info.getValue() as number)}</div>
      ),
      size: 150,
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full mt-6 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm print:mt-0 print:bg-transparent print:rounded-none print:border-none print:shadow-none">
      <div className="w-full overflow-x-auto print:overflow-visible">
        <table className="w-full text-sm text-left whitespace-nowrap min-w-max print:whitespace-normal print:min-w-full">
          <thead className="bg-[#f8f9fa] border-b border-gray-100 print:bg-transparent print:border-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-4 font-semibold text-[13px] text-gray-700 uppercase tracking-wider print:text-black print:text-[9px] print:px-1 print:py-1 print:border print:border-gray-800"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white print:bg-transparent print:divide-none">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id}
                  className="hover:bg-[#fcfdfd] transition-colors duration-150 ease-in-out print:hover:bg-transparent print:border-b print:border-gray-800 print:break-inside-avoid"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3.5 text-[13px] text-gray-600 print:text-black print:text-[9px] print:px-1 print:py-1 print:border-l print:border-r print:border-gray-800"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-gray-500 font-medium"
                >
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
