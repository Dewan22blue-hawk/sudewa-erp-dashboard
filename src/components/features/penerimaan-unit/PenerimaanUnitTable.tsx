'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { PenerimaanUnit } from '@/@types/penerimaan-unit.types';
import DeletePenerimaanUnitDialog from './DeletePenerimaanUnitDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';

interface Props {
  data: PenerimaanUnit[];
  meta?: {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
  };
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  perPage?: number;
  onPerPageChange?: (value: number) => void;
  onPageChange?: (page: number) => void;
}

export default function PenerimaanUnitTable({
  data,
  meta,
  isLoading,
  search,
  onSearchChange,
  perPage = 25,
  onPerPageChange,
  onPageChange,
}: Props) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formatDate = (val: string) => {
    if (!val) return '-';
    const date = new Date(val);
    if (Number.isNaN(date.getTime())) return val;
    return format(date, 'dd MMMM yyyy', { locale: id });
  };

  const columns: ColumnDef<PenerimaanUnit>[] = [
    {
      header: 'NO PENERIMAAN',
      accessorKey: 'noPenerimaan',
      sortable: true,
      alignment: 'left',
      cell: (item) => <CopyBox text={item?.noPenerimaan || '-'} />,
    },
    {
      header: 'TANGGAL',
      accessorKey: 'tanggal',
      sortable: true,
      alignment: 'left',
      cell: (item) => formatDate(item.tanggal),
    },
    {
      header: 'SUPPLIER',
      accessorKey: 'supplier',
      sortable: true,
      alignment: 'left',
      cell: (item) =>
        item?.person ? (
          <ReferenceLink href={`/dashboard/${slug}/master/supplier?search=${item?.person?.name}`}>
            {item.supplier}
          </ReferenceLink>
        ) : (
          item.supplier
        ),
    },
    {
      header: 'KETERANGAN',
      accessorKey: 'keterangan',
      sortable: true,
      alignment: 'left',
      cell: (item) => item.keterangan || '-',
    },
    {
      header: 'Aksi',
      alignment: 'center',
      sticky: 'right',
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1 hover:bg-slate-100 transition-colors duration-200 hover:scale-110 active:scale-95 transform">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
            <DropdownMenuItem
              asChild
              className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
            >
              {slug ? (
                <a href={`/dashboard/${slug}/warehouse/penerimaan-unit/${item.id}/edit`}>Detail</a>
              ) : (
                <span className="text-gray-400">Detail</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(item.id)}
              className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <BaseTable
        data={data}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search here"
        search={search}
        onSearchChange={onSearchChange}
        showLimitChange
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        meta={meta}
        onPageChange={onPageChange}
      />

      {deleteId && (
        <DeletePenerimaanUnitDialog
          id={deleteId}
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
