'use client';

import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { PenerimaanUnit } from '@/@types/penerimaan-unit.types';
import DeletePenerimaanUnitDialog from './DeletePenerimaanUnitDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTableSort } from '@/hooks/useTableSort';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  data: PenerimaanUnit[];
}

export default function PenerimaanUnitTable({ data }: Props) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data,
  });

  const renderSortHeader = (key: keyof PenerimaanUnit, label: string) => {
    const isSorted = sortKey === key;
    return (
      <TableHead
        onClick={() => handleSort(key as any)}
        className="px-4 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer select-none group whitespace-nowrap text-left"
      >
        <div className="flex items-center gap-1 justify-start">
          {label}
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
      </TableHead>
    );
  };

  const formatDate = (val: string) => {
    if (!val) return '-';
    const date = new Date(val);
    if (Number.isNaN(date.getTime())) return val;
    return format(date, 'dd MMMM yyyy', { locale: id });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
      <Table className="w-full text-sm">
        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
          <TableRow className="hover:bg-[#f8f9fa]">
            {renderSortHeader('noPenerimaan', 'NO PENERIMAAN')}
            {renderSortHeader('tanggal', 'TANGGAL')}
            {renderSortHeader('supplier', 'SUPPLIER')}
            {renderSortHeader('keterangan', 'KETERANGAN')}
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-[60px] whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.id} className="group bg-white hover:bg-slate-50 transition-colors">
              <TableCell className="text-center px-4 py-4 sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">{item.noPenerimaan}</TableCell>
              <TableCell className="px-4 py-4 text-left text-sm">{formatDate(item.tanggal)}</TableCell>
              <TableCell className="px-4 py-4 text-left text-sm">{item.supplier}</TableCell>
              <TableCell className="px-4 py-4 text-left text-sm">{item.keterangan || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                      {slug ? <Link href={`/dashboard/${slug}/warehouse/penerimaan-unit/${item.id}/edit`}>Edit</Link> : <span className="text-gray-400">Edit</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {deleteId && <DeletePenerimaanUnitDialog id={deleteId} open={!!deleteId} onClose={() => setDeleteId(null)} />}
    </div>
  );
}
