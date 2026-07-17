'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { useDeleteSales, useSalesList } from '@/hooks/useSales';
import { toast } from 'sonner';
import { SalesItem } from './sales.data';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { Badge } from '@/components/ui/badge';
import { CopyBox } from '@/components/ui/copy-box';
import { ReferenceLink } from '@/components/ui/reference-link';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical } from 'lucide-react';
import SearchVehicleModal from '@/components/features/vehicle/SearchVehicleModal';
import { useCompany } from '@/contexts/CompanyContext';

interface Props {
  onAdd?: () => void;
}

export function SalesTable({ onAdd }: Props) {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isVehicleSearchOpen, setIsVehicleSearchOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SalesItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('transaction:create');
  const canEdit = hasPermission('transaction:edit');
  const canDelete = hasPermission('transaction:delete');

  const { data, isLoading } = useSalesList({
    page: currentPage,
    perPage: itemsPerPage,
    search: searchTerm,
  });

  const deleteMutation = useDeleteSales();

  const salesData = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Data berhasil dihapus');
      setDeleteTarget(null);
    } catch {
      toast.error('Gagal menghapus data');
    } finally {
      setIsDeleting(false);
    }
  };

  const getSlug = () => slug;

  const columns: ColumnDef<SalesItem>[] = [
    {
      header: 'KODE JUAL',
      accessorKey: 'kodeJual',
      sortable: true,
      alignment: 'left',
      cell: (item) => <CopyBox text={item.kodeJual} />,
    },
    {
      header: 'TANGGAL',
      accessorKey: 'tanggal',
      sortable: true,
      alignment: 'center',
      cell: (item) => item.tanggal || '-',
    },
    {
      header: 'CUSTOMER',
      accessorKey: 'customer',
      sortable: true,
      alignment: 'left',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <ReferenceLink href={`/dashboard/${getSlug()}/customer?search=${item.customer}`}>
            {item.customer || '-'}
          </ReferenceLink>
          {item.isRefunded && (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
              Sudah Refund
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'BIAYA EKSPEDISI',
      accessorKey: 'biayaEkspedisi',
      sortable: true,
      alignment: 'center',
      cell: (item) => currenciesFormat('idr', item.biayaEkspedisi),
    },
    {
      header: 'TOTAL BIAYA',
      accessorKey: 'totalBiaya',
      sortable: true,
      alignment: 'center',
      cell: (item) => currenciesFormat('idr', item.totalBiaya),
    },
    {
      header: 'TOTAL DPP',
      accessorKey: 'totalDpp',
      sortable: true,
      alignment: 'center',
      cell: (item) => currenciesFormat('idr', item.totalDpp),
    },
    {
      header: 'TOTAL PPN',
      accessorKey: 'totalPpn',
      sortable: true,
      alignment: 'center',
      cell: (item) => currenciesFormat('idr', item.totalPpn),
    },
    {
      header: 'TOTAL JUAL',
      accessorKey: 'totalJual',
      sortable: true,
      alignment: 'center',
      cell: (item) => (
        <span className="font-semibold text-slate-900">
          {currenciesFormat('idr', item.totalJual)}
        </span>
      ),
    },
    {
      header: 'KURANG BAYAR',
      accessorKey: 'kurangBayar',
      sortable: true,
      alignment: 'center',
      cell: (item) => (
        <span className="text-red-600 font-semibold">
          {currenciesFormat('idr', item.kurangBayar)}
        </span>
      ),
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
              className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
              onClick={() => router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/edit/${item.id}` : `/transaksi/penjualan-unit/edit/${item.id}`)}
              disabled={!canEdit}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
              onClick={() => router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/${item.id}` : `/transaksi/penjualan-unit/${item.id}`)}
            >
              Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
              onClick={() => router.push(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/${item.id}/refund` : `/transaksi/penjualan-unit/${item.id}/refund`)}
              disabled={Boolean(item.isRefunded) || !canEdit}
            >
              {item.isRefunded ? 'Sudah Refund' : 'Refund'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
              onClick={() => window.open(slug ? `/dashboard/${slug}/transaksi/penjualan-unit/print/${item.id}` : `/transaksi/penjualan-unit/print/${item.id}`, '_blank')}
              disabled={!canEdit}
            >
              Print
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteTarget(item)}
              className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
              disabled={!canDelete}
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50 h-9"
        onClick={() => setIsVehicleSearchOpen(true)}
      >
        Cari Data Kendaraan
      </button>
      {canCreate && onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white shadow-none hover:bg-[#152e4d] h-9"
        >
          Tambah
        </button>
      )}
    </div>
  );

  return (
    <>
      <BaseTable
        data={salesData}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search No. Rangka / No. Mesin..."
        search={searchTerm}
        onSearchChange={setSearchTerm}
        showLimitChange
        perPage={itemsPerPage}
        onPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(key, dir) => {
          setSortBy(key);
          setSortDirection(dir);
        }}
        meta={meta}
        onPageChange={setCurrentPage}
        headerActions={headerActions}
      />

      <SearchVehicleModal
        open={isVehicleSearchOpen}
        onOpenChange={setIsVehicleSearchOpen}
        type="sales"
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Data penjualan {deleteTarget?.kodeJual} akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
