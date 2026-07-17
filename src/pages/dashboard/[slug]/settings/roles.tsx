import { useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRoles, useDeleteRole } from '@/hooks/useRole';
import { Role } from '@/@types/role.types';
import { toast } from 'sonner';
import { Search, Plus, MoreVertical, CircleAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ApiResponseError } from '@/lib/api/response';

export default function RolesPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: roles = [], isLoading } = useRoles();
  const deleteMutation = useDeleteRole();

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);



  // Delete State
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      await deleteMutation.mutateAsync(roleToDelete.id);
      toast.success('Role berhasil dihapus');
      setRoleToDelete(null);
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus role';
      toast.error(message);
    }
  };

  const handleAdd = () => {
    router.push(`/dashboard/${slug}/settings/roles/create`);
  };

  const handleEdit = (role: Role) => {
    router.push(`/dashboard/${slug}/settings/roles/${role.id}/edit`);
  };

  // Filter Logic
  const filteredData = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / Number(itemsPerPage)) || 1;
  const startIndex = (currentPage - 1) * Number(itemsPerPage);
  const endIndex = startIndex + Number(itemsPerPage);
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 grid grid-cols-1">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hak Akses</h1>
          <p className="text-sm text-gray-500">Kelola Hak dan Izin Akses.</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search here"
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <Select
                value={itemsPerPage}
                onValueChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">Page</span>
            </div>
          </div>

          <Button onClick={handleAdd} disabled={isLoading} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
            <Plus size={16} className="mr-2" />
            Tambah Role
          </Button>
        </div>

        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="min-w-full w-full text-sm">
            <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900">
              <tr className="text-center border-b border-gray-200">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Guard</th>
                <th className="px-4 py-3 text-left">Users</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-gray-500">Memuat...</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-gray-500">Tidak ada data</td>
                </tr>
              ) : (
                currentData.map((role) => (
                  <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{role.name}</td>
                    <td className="px-4 py-3">{(role as any).guard_name || '-'}</td>
                    <td className="px-4 py-3">{(role as any).users_count}</td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 mx-auto p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                          <DropdownMenuItem
                            className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                            onClick={() => router.push(`/dashboard/${slug}/settings/roles/${role.id}`)}
                          >
                            Lihat Detail
                          </DropdownMenuItem>

                          {role.name.toLowerCase() !== 'admin' && (
                            <>
                              <DropdownMenuItem
                                className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                                onClick={() => handleEdit(role)}
                              >
                                Atur Permissions
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                                onClick={() => setRoleToDelete(role)}
                              >
                                Hapus
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} data
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-gray-100">
              {currentPage}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>





      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent className="max-w-[440px] rounded-[28px] border-0 p-0 shadow-2xl">
          <div className="px-8 pb-8 pt-10 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-red-500/90 text-red-500">
              <CircleAlert className="h-12 w-12" strokeWidth={2.5} />
            </div>

            <AlertDialogHeader className="mt-8 space-y-4 text-center">
              <AlertDialogTitle className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-slate-950">
                Hapus peran ini?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-lg leading-8 text-slate-500">
                Peran &quot;{roleToDelete?.name}&quot; yang dihapus tidak bisa dikembalikan lagi.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-8 flex-col gap-3 sm:flex-col">
              <AlertDialogAction
                className="h-14 rounded-2xl bg-[#1F3B5B] text-lg font-semibold text-white hover:bg-[#1B3450]"
                onClick={handleDeleteRole}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Ya'}
              </AlertDialogAction>
              <AlertDialogCancel className="h-14 rounded-2xl border-slate-200 text-lg font-semibold text-slate-950 shadow-none hover:bg-slate-50">
                Tidak
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
