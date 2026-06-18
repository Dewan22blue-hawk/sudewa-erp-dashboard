import { useMemo, useState } from 'react';
import { User } from '@/@types/user.types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MoreVertical, Plus, ArrowUp, ArrowDown, ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTableSort } from '@/hooks/useTableSort';
import { Switch } from '@/components/ui/switch';
import { useActivateUser, useDeactivateUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAdd?: () => void;
}

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: any }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  return <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
}

export function UserTable({ data, onEdit, onDelete, onAdd }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((user) => {
      const matchUsername = user.username?.toLowerCase().includes(lower);
      const matchName = user.name?.toLowerCase().includes(lower);
      const matchRoles = user.roles?.some((r) => r.name.toLowerCase().includes(lower));
      return matchUsername || matchName || matchRoles;
    });
  }, [data, search]);

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: filteredData,
  });

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = useMemo(() => sortedData.slice(startIndex, endIndex), [sortedData, startIndex, endIndex]);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleToggleStatus = async (user: User, checked: boolean) => {
    try {
      if (checked) {
        await activateMutation.mutateAsync(user.id);
        toast.success(`User ${user.name} berhasil diaktifkan`);
      } else {
        await deactivateMutation.mutateAsync(user.id);
        toast.success(`User ${user.name} berhasil dinonaktifkan`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah status user');
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
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
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>Page</span>
          </div>
        </div>

        {onAdd && (
          <Button onClick={onAdd} className="bg-[#1e3a5f] hover:bg-[#152e4d] text-white px-4 h-10 rounded-xl shadow-sm gap-2">
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
            <TableRow className="hover:bg-transparent border-gray-100">
              {/* User ID */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[20%]',
                  sortKey === 'username' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                )}
                onClick={() => handleSort('username')}
              >
                <div className="flex items-center gap-1">
                  User ID
                  <SortIcon sortKey="username" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Nama Pengguna */}
              <TableHead
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors w-[25%]',
                  sortKey === 'name' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                )}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Nama Pengguna
                  <SortIcon sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </TableHead>
              {/* Role */}
              <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Role
              </TableHead>
              {/* Status */}
              <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-[160px]">
                Status
              </TableHead>
              {/* Action */}
              <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-10 text-sm">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((user) => {
                const roleNames = user.roles?.map((r) => r.name).join(', ') || '-';
                const userIdLabel = user.username || user.id;
                const isActive = user.isActive === true || user.isActive === 1;

                const isActivating = activateMutation.isPending && activateMutation.variables === user.id;
                const isDeactivating = deactivateMutation.isPending && deactivateMutation.variables === user.id;
                const isUpdating = isActivating || isDeactivating;

                return (
                  <tr key={user.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                    <td className="px-4 py-4 font-semibold text-slate-900 text-sm text-left">{userIdLabel}</td>
                    <td className="px-4 py-4 text-slate-700 text-sm text-left">{user.name}</td>
                    <td className="px-4 py-4 text-slate-700 text-sm text-left">{roleNames}</td>
                    <td className="px-4 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isUpdating ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            <span className="text-xs font-medium text-slate-400 italic">Memproses...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isActive}
                              onCheckedChange={(checked) => handleToggleStatus(user, checked)}
                              disabled={activateMutation.isPending || deactivateMutation.isPending}
                            />
                            <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-slate-400'}`}>
                              {isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                            <DropdownMenuItem onClick={() => onEdit(user)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(user)} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300">
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                    currentPage === pageNum
                      ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                  )}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-1 text-sm text-slate-500">...</span>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)} className="h-9 min-w-9 rounded-xl border border-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white">
                  {totalPages}
                </Button>
              </>
            )}

            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
