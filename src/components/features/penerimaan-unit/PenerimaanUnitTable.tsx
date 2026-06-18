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

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <Table className="w-full text-sm">
        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
          <TableRow>
            {renderSortHeader('noPenerimaan', 'NO PENERIMAAN')}
            {renderSortHeader('tanggal', 'TANGGAL')}
            {renderSortHeader('supplier', 'SUPPLIER')}
            {renderSortHeader('keterangan', 'KETERANGAN')}
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-[60px] whitespace-nowrap">ACTION</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.id} className="border-b hover:bg-gray-50/70 transition-colors">
              <TableCell className="px-4 py-4 font-medium text-gray-900 text-left text-sm">{item.noPenerimaan}</TableCell>
              <TableCell className="px-4 py-4 text-left text-sm">{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
              <TableCell className="px-4 py-4 text-left text-sm">{item.supplier}</TableCell>
              <TableCell className="px-4 py-4 text-left text-sm">{item.keterangan || '-'}</TableCell>
              <TableCell className="px-4 py-4 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>{slug ? <Link href={`/dashboard/${slug}/warehouse/penerimaan-unit/${item.id}/edit`}>Edit</Link> : <span className="text-gray-400">Edit</span>}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="text-red-600">
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
