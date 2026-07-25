import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { usePermissions } from '@/hooks/usePermission';
import { useRoleDetail, useUpdateRole } from '@/hooks/useRole';
import { toast } from 'sonner';
import { ChevronLeft, Shield } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';

export default function EditRolePage() {
  const router = useRouter();
  const { slug, id } = router.query;

  const { data: permissions = [], isLoading: isLoadingPerms } = usePermissions();
  const { data: role, isLoading: isLoadingRole, isError: isErrorRole } = useRoleDetail(id as string);
  const updateMutation = useUpdateRole();

  const [name, setName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  // Pre-fill form when role data is fetched
  useEffect(() => {
    if (role) {
      setName(role.name);
      setSelectedPerms(role.permissions?.map((p) => p.name) ?? []);
    }
  }, [role]);

  // Group permissions by prefix (e.g. "master-data:create" -> Group: "master-data")
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof permissions> = {};
    permissions.forEach((perm) => {
      const parts = perm.name.split(':');
      const groupName = parts[0] || 'lainnya';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(perm);
    });
    return groups;
  }, [permissions]);

  const togglePerm = (permName: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSelectAllGroup = (groupPerms: typeof permissions, checked: boolean) => {
    const permNames = groupPerms.map((p) => p.name);
    if (checked) {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...permNames])));
    } else {
      setSelectedPerms((prev) => prev.filter((p) => !permNames.includes(p)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama peran wajib diisi');
      return;
    }
    if (!id) return;

    try {
      await updateMutation.mutateAsync({ id: id as string, payload: { name, permissions: selectedPerms } });
      toast.success('Role berhasil diperbarui');
      router.push(`/dashboard/${slug}/settings/roles`);
    } catch (err: any) {
      toast.error(err?.message || 'Gagal memperbarui role');
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/${slug}/settings/roles`);
  };



  const isPending = updateMutation.isPending || isLoadingRole;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            { label: 'Hak Akses', onClick: () => router.push(`/dashboard/${slug}/settings/roles`) },
            { label: 'Edit' }
          ]}
          title="Ubah Peran"
          subtitle="Edit detail peran dan perbarui daftar permissions."
          onBack={handleBack}
        />

        {isLoadingRole ? (
          <LoadingState variant="page" />
        ) : isErrorRole || !role ? (
          <div className="bg-white rounded-2xl border p-12 text-center text-red-500 font-medium">
            Gagal memuat data peran atau peran tidak ditemukan.
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card: Role Name */}
            <div className="bg-white rounded-2xl border p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="text-indigo-600 h-4 w-4" />
                Informasi Utama Peran
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Peran</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="misal: finance-supervisor"
                  className="max-w-md bg-white rounded-md h-11"
                  disabled={isPending || role.name.toLowerCase() === 'admin'}
                  required
                />
                <p className="text-xs text-gray-500">Gunakan format lowercase, pisahkan dengan tanda hubung (-) jika lebih dari satu kata.</p>
              </div>
            </div>

            {/* Card: Permissions Selection */}
            <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="text-indigo-600 h-4 w-4" />
                    Hak Akses (Permissions)
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Tentukan fitur mana saja yang dapat diakses oleh peran ini.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPerms(permissions.map((p) => p.name))}
                    disabled={isLoadingPerms || isPending}
                    className="rounded-lg text-xs"
                  >
                    Pilih Semua
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPerms([])}
                    disabled={isLoadingPerms || isPending}
                    className="rounded-lg text-xs"
                  >
                    Hapus Pilihan
                  </Button>
                </div>
              </div>

              {isLoadingPerms ? (
                <LoadingState variant="page" />
              ) : Object.keys(groupedPermissions).length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 font-medium">Tidak ada permissions tersedia.</div>
              ) : (
                <div className="space-y-6 divide-y divide-gray-100">
                  {Object.entries(groupedPermissions).map(([group, groupPerms], idx) => {
                    const allSelected = groupPerms.every((p) => selectedPerms.includes(p.name));
                    const someSelected = groupPerms.some((p) => selectedPerms.includes(p.name)) && !allSelected;

                    return (
                      <div key={group} className={`pt-6 ${idx === 0 ? 'pt-0' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider capitalize">
                            {group.replace(/-/g, ' ')}
                          </h3>
                          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                            <Checkbox
                              checked={allSelected ? true : (someSelected ? 'indeterminate' : false)}
                              onCheckedChange={(checked) => handleSelectAllGroup(groupPerms, !!checked)}
                              disabled={isPending}
                            />
                            <span>Pilih Grup</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {groupPerms.map((perm) => {
                            const isSelected = selectedPerms.includes(perm.name);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-3 p-3 rounded-md border transition-all cursor-pointer select-none ${isSelected
                                    ? 'border-indigo-600/30 bg-indigo-50/20'
                                    : 'border-gray-100 bg-gray-50/20 hover:bg-gray-50/60'
                                  }`}
                              >
                                <div className="pt-0.5">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => togglePerm(perm.name)}
                                    disabled={isPending}
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="block text-xs font-mono font-bold text-indigo-950">
                                    {perm.name}
                                  </span>
                                  <span className="block text-[11px] text-gray-500 leading-normal font-medium">
                                    {perm.description || 'Tidak ada deskripsi.'}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
                className="h-11 px-6 rounded-md text-slate-800 border-slate-200"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending || !name.trim()}
                className="h-11 px-6 rounded-md bg-indigo-950 hover:bg-indigo-900 text-white font-semibold shadow-sm transition-all"
              >
                {updateMutation.isPending ? 'Menyimpan...' : 'Perbarui Peran'}
              </Button>

            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
