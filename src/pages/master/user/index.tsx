import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useUsers } from "@/hooks/useUser"
import { UserTable } from "@/components/features/user/UserTable"
import { UserFormDialog } from "@/components/features/user/UserFormDialog"
import { DeleteUserDialog } from "@/components/features/user/DeleteUserDialog"
import { Plus } from "lucide-react"
import { useCompany } from "@/contexts/CompanyContext"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { User } from "@/@types/user.types"

export default function UserPage() {
    const { companyId } = useCompany()
    const safeCompanyId = companyId || ""

    const { data: users = [], isLoading, isError } = useUsers(safeCompanyId)

    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [openForm, setOpenForm] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)

    // Handlers
    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setOpenForm(true)
    }

    const handleDelete = (user: User) => {
        setSelectedUser(user)
        setOpenDelete(true)
    }

    const handleCreate = () => {
        setSelectedUser(null)
        setOpenForm(true)
    }

    // Modal Close
    const handleOpenFormChange = (open: boolean) => {
        setOpenForm(open)
        if (!open) setSelectedUser(null)
    }

    const handleOpenDeleteChange = (open: boolean) => {
        setOpenDelete(open)
        if (!open) setSelectedUser(null)
    }

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
        )
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
        )
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

                    <Button
                        className="bg-black text-white hover:bg-black/90"
                        onClick={handleCreate}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                {/* FILTERS & ENTRIES */}
                <div className="flex items-center gap-2 text-sm">
                    <span>Show</span>
                    <Select defaultValue="10">
                        <SelectTrigger className="h-8 w-[70px]">
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

                {/* TABLE CARD */}
                <Card className="rounded-xl overflow-hidden border p-0 shadow-none">
                    <UserTable
                        data={users}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </Card>

                {/* PAGINATION CONTROLS */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing 1-{users.length} of {users.length} data
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="cursor-pointer hover:text-foreground">Previous</span>
                        <div className="rounded-md border bg-muted px-3 py-1 text-foreground font-medium">
                            1
                        </div>
                        <span className="cursor-pointer hover:text-foreground">Next</span>
                    </div>
                </div>

                <UserFormDialog
                    open={openForm}
                    onOpenChange={handleOpenFormChange}
                    user={selectedUser}
                    companyId={safeCompanyId}
                />

                <DeleteUserDialog
                    open={openDelete}
                    onOpenChange={handleOpenDeleteChange}
                    user={selectedUser}
                    companyId={safeCompanyId}
                />
            </div>
        </DashboardLayout>
    )
}
