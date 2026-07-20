import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateUI } from '@/lib/utils/date';
import type { WithholdingTaxItem } from '@/@types/withholding-tax.types';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface LaporanBuktiPotongTableProps {
  data: WithholdingTaxItem[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
}

export function LaporanBuktiPotongTable({
  data,
  onSort,
  sortKey,
  sortOrder,
}: LaporanBuktiPotongTableProps) {
  const renderSortIndicator = (key: string) => {
    if (sortKey === key) {
      return sortOrder === 'asc' 
        ? <ArrowUp className="inline-block h-3.5 w-3.5 ml-1 text-indigo-600 shrink-0 transition-colors" />
        : <ArrowDown className="inline-block h-3.5 w-3.5 ml-1 text-indigo-600 shrink-0 transition-colors" />;
    }
    return <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto shadow-none">
      <Table>
        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
          <TableRow className="hover:bg-[#f8f9fa]">
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-[60px]">
              No
            </TableHead>
            <TableHead 
              className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-700 whitespace-nowrap min-w-[180px] group"
              onClick={() => onSort?.('withholding_number')}
            >
              No Bukti Potong
              {renderSortIndicator('withholding_number')}
            </TableHead>
            <TableHead 
              className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-700 whitespace-nowrap min-w-[180px] group"
              onClick={() => onSort?.('no_invoice')}
            >
              No Invoice
              {renderSortIndicator('no_invoice')}
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">
              Source
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 min-w-[150px]">
              Cash
            </TableHead>
            <TableHead 
              className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-700 whitespace-nowrap min-w-[150px] group"
              onClick={() => onSort?.('pph_amount')}
            >
              Nilai PPh
              {renderSortIndicator('pph_amount')}
            </TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap min-w-[150px]">
              Nominal Bayar
            </TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap min-w-[140px]">
              Tgl Bayar
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 min-w-[200px]">
              Keterangan
            </TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
              Umur BP (Masa)
            </TableHead>
            <TableHead 
              className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-700 whitespace-nowrap min-w-[140px] group"
              onClick={() => onSort?.('created_at')}
            >
              Tanggal Dibuat
              {renderSortIndicator('created_at')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center">
                Belum ada data laporan bukti potong.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="px-4 py-4 text-center text-sm text-gray-900 border-b border-gray-100">
                  {index + 1}
                </TableCell>
                <TableCell className="px-4 py-4 text-left text-sm font-medium text-gray-900 border-b border-gray-100">
                  {item.withholding_number || '-'}
                </TableCell>
                <TableCell className="px-4 py-4 text-left text-sm text-gray-700 border-b border-gray-100">
                  {item.no_invoice || '-'}
                </TableCell>
                <TableCell className="px-4 py-4 text-left text-sm text-gray-700 border-b border-gray-100 uppercase">
                  {item.source === 'internal' ? 'Internal' : 'Client / Supplier'}
                </TableCell>
                <TableCell className="px-4 py-4 text-left text-sm text-gray-700 border-b border-gray-100">
                  {item.cash ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{item.cash.code}</span>
                      <span className="text-xs text-slate-500">{item.cash.cash_name || item.cash.description || '-'}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-sm font-semibold text-slate-900 border-b border-gray-100">
                  {item.pph_amount != null ? formatCurrency(item.pph_amount) : '-'}
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-gray-900 border-b border-gray-100">
                  {item.payment_amount != null ? formatCurrency(item.payment_amount) : '-'}
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-gray-700 border-b border-gray-100">
                  {item.payment_date ? formatDateUI(item.payment_date) : '-'}
                </TableCell>
                <TableCell className="px-4 py-4 text-left text-sm text-gray-700 border-b border-gray-100">
                  {item.pph_description || '-'}
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-gray-900 border-b border-gray-100">
                  {item.withholding_age != null ? item.withholding_age : '-'}
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-gray-700 border-b border-gray-100">
                  {item.created_at ? formatDateUI(item.created_at) : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
