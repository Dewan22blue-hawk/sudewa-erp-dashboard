import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useRoles, useRoleDetail, useCreateRole, useAssignRolePermissions, useDeleteRole } from '@/hooks/useRole';
import { usePermissions } from '@/hooks/usePermission';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
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
  const { hasPermission } = usePermissionGuard();
  const { data: roles = [], isLoading } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const createMutation = useCreateRole();
  const assignMutation = useAssignRolePermissions();
  const deleteMutation = useDeleteRole();

  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Modal State
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingRoleId, setViewingRoleId] = useState<number | string | null>(null);
  const detailRoleQuery = useRoleDetail(viewingRoleId ?? undefined, { withoutPermission: false });

  // Delete State
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const detailQuery = useRoleDetail(selectedRole?.id, { withoutPermission: false });
  const currentPerms = useMemo(() => detailQuery.data?.permissions?.map((p) => p.name) ?? [], [detailQuery.data]);

  const resetForm = () => {
    setName('');
    setSelectedPerms([]);
    setSelectedRole(null);
  };

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

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openAssign = (role: Role) => {
    setSelectedRole(role);
    setName(role.name);
    setSelectedPerms([]); // akan diisi ulang setelah detail role selesai dimuat
    setOpen(true);
  };

  useEffect(() => {
    if (selectedRole && currentPerms.length) {
      setSelectedPerms(currentPerms);
    }
  }, [selectedRole, currentPerms]);

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const handleSubmit = async () => {
    try {
      if (selectedRole) {
        await assignMutation.mutateAsync({ id: selectedRole.id, permissions: selectedPerms });
        toast.success('Permissions berhasil diperbarui');
      } else {
        await createMutation.mutateAsync({ name, permissions: selectedPerms });
        toast.success('Role berhasil dibuat');
      }
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan role');
    }
  };

  const disabled = createMutation.isPending || assignMutation.isPending;

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
          <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500">Kelola role dan permission.</p>
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

          {hasPermission('roles:create') && (
            <Button
              className="bg-[#1e293b] hover:bg-[#0f172a]"
              onClick={openCreate}
              disabled={isLoading}
            >
              <Plus size={16} className="mr-2" />
              Tambah Role
            </Button>
          )}
        </div>

        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="min-w-full w-full text-sm">
            <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900">
              <tr className="text-center border-b border-gray-200">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Guard</th>
                <th className="px-4 py-3 text-left">Users</th>
                <th className="px-4 py-3 text-center">Action</th>
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
                            onClick={() => {
                              setViewingRoleId(role.id);
                              setDetailOpen(true);
                            }}
                          >
                            Lihat Detail
                          </DropdownMenuItem>

                          {role.name.toLowerCase() !== 'admin' && (
                            <>
                              {hasPermission('roles:edit') ? (
                                <DropdownMenuItem
                                  className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                                  onClick={() => openAssign(role)}
                                >
                                  Atur Permissions
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed" disabled>
                                  Atur Permissions
                                </DropdownMenuItem>
                              )}
                              
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

      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'Atur Permissions' : 'Buat Role Baru'}</DialogTitle>
            <DialogDescription>Role menentukan akses pengguna.</DialogDescription>
          </DialogHeader>

          {!selectedRole && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Role</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="misal: manager" />
            </div>
          )}

          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
            <p className="text-sm font-medium">Permissions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {permissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={selectedPerms.includes(perm.name)} onCheckedChange={() => togglePerm(perm.name)} />
                  <span>{perm.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={disabled}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={disabled || (!selectedRole && !name)}>
              {disabled ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onOpenChange={(val) => {
          setDetailOpen(val);
          if (!val) setViewingRoleId(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Peran</DialogTitle>
            <DialogDescription>
              Informasi lengkap mengenai peran dan pengguna yang terdaftar.
            </DialogDescription>
          </DialogHeader>

          {detailRoleQuery.isLoading ? (
            <div className="py-8 text-center text-gray-500">Memuat detail peran...</div>
          ) : detailRoleQuery.isError ? (
            <div className="py-8 text-center text-red-500">Gagal memuat detail peran.</div>
          ) : !detailRoleQuery.data ? (
            <div className="py-8 text-center text-gray-500">Data tidak ditemukan.</div>
          ) : (
            <div className="space-y-6">
              {/* Role General Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Peran</span>
                  <span className="text-base font-semibold text-gray-900 capitalize">{detailRoleQuery.data.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Guard Name</span>
                  <span className="text-base text-gray-700">{detailRoleQuery.data.guard_name || '-'}</span>
                </div>
              </div>

              {/* Users list */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>Daftar Pengguna</span>
                  <span className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded-full font-normal">
                    {detailRoleQuery.data.users?.length ?? 0}
                  </span>
                </h3>
                
                {!detailRoleQuery.data.users || detailRoleQuery.data.users.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50/50 rounded-lg p-4 text-center border border-dashed">
                    Tidak ada pengguna dengan peran ini.
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden bg-white max-h-60 overflow-y-auto">
                    <table className="min-w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold text-gray-700">Nama</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-700">Username / Email</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-700">Status</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-700">Login Terakhir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {detailRoleQuery.data.users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{user.name}</div>
                              <div className="text-gray-500 text-[10px]">
                                {user.firstname || ''} {user.lastname || ''}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-700">{user.username}</div>
                              <div className="text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                user.is_active === 1 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-slate-50 text-slate-700 border border-slate-200'
                              }`}>
                                {user.is_active === 1 ? 'Aktif' : 'Non-aktif'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {user.last_login 
                                ? new Date(user.last_login).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                  })
                                : '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Permissions list */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>Izin Akses (Permissions)</span>
                  <span className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded-full font-normal">
                    {detailRoleQuery.data.permissions?.length ?? 0}
                  </span>
                </h3>

                {!detailRoleQuery.data.permissions || detailRoleQuery.data.permissions.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50/50 rounded-lg p-4 text-center border border-dashed">
                    Tidak ada izin akses untuk peran ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {detailRoleQuery.data.permissions.map((perm) => (
                      <div key={perm.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col gap-0.5">
                        <span className="font-mono text-xs font-semibold text-indigo-700">{perm.name}</span>
                        <span className="text-[11px] text-gray-500">{perm.description || 'Tidak ada deskripsi'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setDetailOpen(false)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                Peran "{roleToDelete?.name}" yang dihapus tidak bisa dikembalikan lagi.
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
