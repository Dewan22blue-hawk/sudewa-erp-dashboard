import { useMemo, useState } from 'react';
import { User } from '@/@types/user.types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MoreVertical, Plus } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Switch } from '@/components/ui/switch';
import { useActivateUser, useDeactivateUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface Props {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAdd?: () => void;
}

export function UserTable({ data, onEdit, onDelete, onAdd }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {' '}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-700">
            <span>Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[68px] h-9 border-slate-200">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>Entries</span>
          </div>

          {onAdd && (
            <Button onClick={onAdd} className="bg-[#1f304f] hover:bg-[#1a2842] text-white px-4 h-9 rounded-md shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow className="border-slate-200">
              <TableHead className="py-3">
                <SortableHeader title="User ID" sortKey="username" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-xs" />
              </TableHead>
              <TableHead className="py-3">
                <SortableHeader title="Nama Pengguna" sortKey="name" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-xs" />
              </TableHead>
              <TableHead className="py-3 text-sm font-semibold uppercase text-slate-700 tracking-wide">Role</TableHead>
              <TableHead className="py-3 text-sm font-semibold uppercase text-slate-700 tracking-wide">Status</TableHead>
              <TableHead className="py-3 pr-6 text-right text-sm font-semibold uppercase text-slate-700 tracking-wide">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Tidak ada data
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
                  <TableRow key={user.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-medium text-slate-800 text-sm">{userIdLabel}</TableCell>
                    <TableCell className="text-slate-700 text-sm">{user.name}</TableCell>
                    <TableCell className="text-slate-700 text-sm">{roleNames}</TableCell>
                    <TableCell className="text-slate-700 text-sm">
                      <div className="flex items-center gap-2">
                        {isUpdating ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
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
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="text-sm text-slate-500">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-8 px-3 border-slate-200">
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
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 p-0 text-xs ${currentPage === pageNum ? 'bg-[#1f304f] hover:bg-[#1a2842]' : 'border-slate-200'}`}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2 text-slate-500">...</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} className="h-8 w-8 p-0 text-xs border-slate-200">
                  {totalPages}
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="h-8 px-3 border-slate-200">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
