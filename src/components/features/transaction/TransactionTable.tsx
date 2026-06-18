import { Transaction } from '@/@types/transaction.types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { useTableSort } from '@/hooks/useTableSort';

interface Props {
  data: Transaction[];
  onEdit: (trx: Transaction) => void;
  onDelete: (trx: Transaction) => void;
}

export function TransactionTable({ data, onEdit, onDelete }: Props) {
  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data,
  });

  if (!sortedData.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-white h-64">
        <p className="text-muted-foreground">Tidak ada data transaksi</p>
      </div>
    );
  }

  const renderSortHeader = (key: keyof Transaction, label: string, alignment: 'left' | 'center' | 'right' = 'left') => {
    const isSorted = sortKey === key;
    const justifyClass = alignment === 'right' ? 'justify-end' : alignment === 'center' ? 'justify-center' : 'justify-start';
    const textAlignment = alignment === 'right' ? 'text-right' : alignment === 'center' ? 'text-center' : 'text-left';
    return (
      <div
        onClick={() => handleSort(key as any)}
        className={`flex items-center gap-1 cursor-pointer select-none group w-full px-4 py-4 text-xs font-semibold uppercase text-slate-500 ${textAlignment} ${justifyClass}`}
      >
        <span>{label}</span>
        {isSorted ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0" />
          ) : (
            <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-150 shrink-0" />
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="p-0 text-center min-w-[120px] align-middle" rowSpan={2}>
                {renderSortHeader('date', 'TANGGAL', 'center')}
              </th>
              <th className="p-0 text-left min-w-[150px] align-middle" rowSpan={2}>
                {renderSortHeader('name', 'TRANSAKSI', 'left')}
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-500 border-l border-r align-middle" colSpan={4}>
                BANK
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-500 border-r align-middle" colSpan={2}>
                CASH
              </th>
              <th className="p-0 text-left min-w-[150px] align-middle" rowSpan={2}>
                {renderSortHeader('description', 'KETERANGAN', 'left')}
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 align-middle" rowSpan={2}>
                ACTION
              </th>
            </tr>
            <tr className="border-t border-gray-200">
              {/* BANK SUBHEADER */}
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500 border-l">Debet BCA USD</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Kredit BCA USD</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Debet BCA IDR</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500 border-r">Kredit BCA IDR</th>

              {/* CASH SUBHEADER */}
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Debet</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500 border-r">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((trx) => (
              <tr key={trx.id} className="border-b hover:bg-slate-50/70 transition-colors border-slate-100">
                <td className="px-4 py-4 text-center text-sm text-slate-700 whitespace-nowrap">{trx.date}</td>
                <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{trx.name}</td>

                {/* BANK */}
                <td className={`px-4 py-4 text-center text-sm ${trx.debitUSD ? 'text-green-600 font-medium' : 'text-slate-400'}`}>{trx.debitUSD ? formatCurrency(trx.debitUSD, 'USD') : '0'}</td>
                <td className={`px-4 py-4 text-center text-sm ${trx.creditUSD ? 'text-red-600 font-medium' : 'text-slate-400'}`}>{trx.creditUSD ? formatCurrency(trx.creditUSD, 'USD') : '0'}</td>
                <td className={`px-4 py-4 text-center text-sm ${trx.debitIDR ? 'text-green-600 font-medium' : 'text-slate-400'}`}>{trx.debitIDR ? formatCurrency(trx.debitIDR, 'IDR') : '0'}</td>
                <td className={`px-4 py-4 text-center text-sm border-r ${trx.creditIDR ? 'text-red-600 font-medium' : 'text-slate-400'}`}>{trx.creditIDR ? formatCurrency(trx.creditIDR, 'IDR') : '0'}</td>

                {/* CASH */}
                <td className={`px-4 py-4 text-center text-sm ${trx.debitCash ? 'text-green-600 font-medium' : 'text-slate-400'}`}>{trx.debitCash ? formatCurrency(trx.debitCash, 'IDR') : '0'}</td>
                <td className={`px-4 py-4 text-center text-sm border-r ${trx.creditCash ? 'text-red-600 font-medium' : 'text-slate-400'}`}>{trx.creditCash ? formatCurrency(trx.creditCash, 'IDR') : '0'}</td>

                <td className="px-4 py-4 text-left text-sm text-slate-500 max-w-[150px] truncate" title={trx.description}>
                  {trx.description || '-'}
                </td>
                <td className="px-4 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(trx)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(trx)}>
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
