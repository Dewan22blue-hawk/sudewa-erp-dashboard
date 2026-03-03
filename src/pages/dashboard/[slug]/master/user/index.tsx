import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUser';
import { UserTable } from '@/components/features/user/UserTable';
import { UserFormDialog } from '@/components/features/user/UserFormDialog';
import { DeleteUserDialog } from '@/components/features/user/DeleteUserDialog';
import { User } from '@/@types/user.types';

export default function UserPage() {
  const { data: users = [], isLoading, isError } = useUsers();

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">User</h1>
              <p className="text-sm text-muted-foreground">Kelola user role</p>
            </div>
          </div>
          <Card className="rounded-xl p-8 flex justify-center items-center h-[300px]">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">User</h1>
              <p className="text-sm text-muted-foreground">Kelola user role</p>
            </div>
          </div>
          <Card className="rounded-xl p-8 flex justify-center items-center h-[300px]">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">User</h1>
            <p className="text-sm text-muted-foreground">Kelola user role</p>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="">
          <UserTable data={users} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleCreate} />
        </div>

        <UserFormDialog open={openForm} onOpenChange={handleOpenFormChange} user={selectedUser} />

        <DeleteUserDialog open={openDelete} onOpenChange={handleOpenDeleteChange} user={selectedUser} />
      </div>
    </DashboardLayout>
  );
}
