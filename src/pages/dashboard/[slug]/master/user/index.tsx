import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUser';
import { UserTable } from '@/components/features/user/UserTable';
import { UserFormDialog } from '@/components/features/user/UserFormDialog';
import { DeleteUserDialog } from '@/components/features/user/DeleteUserDialog';
import { User } from '@/@types/user.types';

export default function UserPage() {
  const { data: users = [], isLoading, isError } = useUsers();

  const sortedUsers = useMemo(() => {
    return [...users].sort((a: any, b: any) => {
      const dateA = a.created_at || a.createdAt ? new Date(a.created_at || a.createdAt).getTime() : 0;
      const dateB = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;

      const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id)) || 0;
      const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id)) || 0;
      if (idA !== idB) return idB - idA;

      return (a.name || '').localeCompare(b.name || '');
    });
  }, [users]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Handlers
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setOpenForm(true);
  };

  // Modal Close
  const handleOpenFormChange = (open: boolean) => {
    setOpenForm(open);
    if (!open) setSelectedUser(null);
  };

  const handleOpenDeleteChange = (open: boolean) => {
    setOpenDelete(open);
    if (!open) setSelectedUser(null);
  };

  // --- RENDER ---

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Pengguna"
            subtitle="Kelola data Pengguna"
          />
          <Card className="rounded-md p-8 flex justify-center items-center h-[300px]">
            <div className="text-muted-foreground animate-pulse">Loading...</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Pengguna"
            subtitle="Kelola data Pengguna"
          />
          <Card className="rounded-md p-8 flex justify-center items-center h-[300px]">
            <div className="text-destructive font-medium">Terjadi kesalahan saat mengambil data</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <PageHeader
          title="Pengguna"
          subtitle="Kelola data Pengguna"
        />

        {/* TABLE CARD */}
        <div className="">
          <UserTable data={sortedUsers} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleCreate} />
        </div>

        <UserFormDialog open={openForm} onOpenChange={handleOpenFormChange} user={selectedUser} />

        <DeleteUserDialog open={openDelete} onOpenChange={handleOpenDeleteChange} user={selectedUser} />
      </div>
    </DashboardLayout>
  );
}
