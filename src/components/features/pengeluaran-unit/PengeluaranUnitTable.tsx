'use client';

import { useRouter } from 'next/router';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { PengeluaranUnit } from '@/@types/pengeluaran-unit.types';
import { PaginationMeta } from '@/@types/pagination.types';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ReferenceLink } from '@/components/ui/reference-link';
import { CopyBox } from '@/components/ui/copy-box';
import { TextTruncate } from '@/components/ui/text-truncate';

interface Props {
  data: PengeluaranUnit[];
  meta: PaginationMeta;
  search: string;
  perPage: number;
  page: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
  onPageChange: (value: number) => void;
  onRetry: () => void;
}

const formatDate = (value: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'dd MMMM yyyy', { locale: id });
};

export default function PengeluaranUnitTable({
  data,
  meta,
  search,
  perPage,
  page,
  isLoading,
  onSearchChange,
  onPerPageChange,
  onPageChange,
}: Props) {
  const router = useRouter();
  const slugValue = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;
  const slug = slugValue ? String(slugValue) : '';

  const resolveBasePath = (): string => {
    if (slug) {
      return `/dashboard/${slug}/warehouse/pengeluaran-unit`;
    }
    const cleanPath = router.asPath.split('?')[0];
    if (cleanPath.includes('/warehouse/pengeluaran-unit')) {
      return cleanPath.replace(/\/+$/, '');
    }
    return '/dashboard/warehouse/pengeluaran-unit';
  };

  const navigateToDetail = (id: number): void => {
    const base = resolveBasePath();
    void router.push(`${base}/${id}`);
  };

  const navigateToEdit = (id: number): void => {
    const base = resolveBasePath();
    void router.push(`${base}/${id}/edit`);
  };

  const columns: ColumnDef<PengeluaranUnit>[] = [
    {
      header: 'NO PENGELUARAN',
      accessorKey: 'activityNumber',
      alignment: 'left',
      cell: (item) => <CopyBox text={item.activityNumber} />,
    },
    {
      header: 'TANGGAL',
      accessorKey: 'activityDate',
      alignment: 'left',
      cell: (item) => formatDate(item.activityDate),
    },
    {
      header: 'CUSTOMER',
      alignment: 'left',
      cell: (item) => (
        <ReferenceLink href={`/dashboard/${slug}/master/customer?search=${item.person?.name ?? '-'}`}>
          {item.person?.name ?? '-'}
        </ReferenceLink>
      ),
    },
    {
      header: 'WAREHOUSE',
      alignment: 'left',
      cell: (item) => item.warehouse?.name ?? '-',
    },
    {
      header: 'KETERANGAN',
      alignment: 'left',
      cell: (item) => <TextTruncate text={item.description || '-'} maxLength={20} />
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
              onClick={() => navigateToDetail(item.id)}
              className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
            >
              Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigateToEdit(item.id)}
              className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
            >
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
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
  );
}
