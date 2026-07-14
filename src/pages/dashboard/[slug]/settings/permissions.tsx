import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePermissions, usePermission } from '@/hooks/usePermission';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, Shield, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { Permission } from '@/@types/permission.types';

export default function PermissionsPage() {
  const { data: permissions = [], isLoading } = usePermissions();

  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const { data: detail, isLoading: detailLoading } = usePermission(selectedId ?? undefined);

  const filtered = useMemo(
    () => permissions.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    ),
    [permissions, search],
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentData = filtered.slice(startIndex, endIndex);

  const handleRowClick = (perm: Permission) => {
    setSelectedId(perm.id);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value));
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Izin Akses</h1>
          <p className="text-sm text-muted-foreground">Daftar Izin Akses yang tersedia pada sistem</p>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search here"
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[70px] bg-white">
                  <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow className="hover:bg-[#f8f9fa]">
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Nama Izin Akses
                </TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Deksripsi
                </TableHead>
                <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Dibuat
                </TableHead>
                <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(perPage)].map((_, i) => (
                  <TableRow key={i} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-4 py-4"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="px-4 py-4 text-center"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-10 text-sm">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((perm) => (
                  <TableRow
                    key={perm.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(perm)}
                  >
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{perm.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">
                        {perm.description || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className="text-sm text-slate-500">
                        {perm.created_at
                          ? format(new Date(perm.created_at), 'dd MMM yyyy', { locale: localeId })
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        onClick={() => handleRowClick(perm)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
          <div>
            Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} data
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                    page === pageNum
                      ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                  )}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-1 text-sm text-slate-500">...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 min-w-9 rounded-xl border border-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white"
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* DETAIL DIALOG */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Permission</DialogTitle>
            <DialogDescription>Informasi lengkap permission yang dipilih.</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <div className="pt-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ) : detail ? (
            <div className="space-y-6 py-2">
              {/* INFO */}
              <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Shield className="h-5 w-5 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{detail.name}</p>
                    {detail.description && (
                      <p className="text-xs text-gray-500">{detail.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Shield className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Guard:</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal text-xs">
                      {detail.guard_name || '-'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Dibuat:</span>
                    <span className="text-sm text-gray-700">
                      {detail.created_at
                        ? format(new Date(detail.created_at), 'dd MMMM yyyy, HH:mm', { locale: localeId })
                        : '-'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Diperbarui:</span>
                    <span className="text-sm text-gray-700">
                      {detail.updated_at
                        ? format(new Date(detail.updated_at), 'dd MMMM yyyy, HH:mm', { locale: localeId })
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ROLES */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  Roles yang memiliki permission ini
                </h4>
                {detail.roles && detail.roles.length > 0 ? (
                  <div className="space-y-2">
                    {detail.roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5"
                      >
                        <span className="text-sm font-medium text-gray-900">{role.name}</span>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs">
                          {role.guard_name || 'api'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Tidak ada role yang terkait.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">Gagal memuat detail permission.</p>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}