import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useRoles, useRoleDetail, useCreateRole, useAssignRolePermissions } from '@/hooks/useRole';
import { usePermissions } from '@/hooks/usePermission';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { Role } from '@/@types/role.types';
import { toast } from 'sonner';
import { Search, Plus, MoreVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RolesPage() {
  const { hasPermission } = usePermissionGuard();
  const { data: roles = [], isLoading } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const createMutation = useCreateRole();
  const assignMutation = useAssignRolePermissions();

  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);

  const detailQuery = useRoleDetail(selectedRole?.id, { withoutPermission: false });
  const currentPerms = useMemo(() => detailQuery.data?.permissions?.map((p) => p.name) ?? [], [detailQuery.data]);

  const resetForm = () => {
    setName('');
    setSelectedPerms([]);
    setSelectedRole(null);
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
  }, [selectedRole?.id, currentPerms]);

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
                      <div className="relative group">
                        <MoreVertical size={18} className="cursor-pointer mx-auto" />
                        <div className="absolute right-0 hidden group-hover:block bg-white shadow-md rounded-md border text-sm z-10 w-32">
                          {hasPermission('roles:edit') ? (
                            <button
                              onClick={() => openAssign(role)}
                              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                              Atur Permissions
                            </button>
                          ) : (
                            <div className="px-4 py-2 text-gray-400 text-left">Akses ditolak</div>
                          )}
                        </div>
                      </div>
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
    </DashboardLayout>
  );
}
