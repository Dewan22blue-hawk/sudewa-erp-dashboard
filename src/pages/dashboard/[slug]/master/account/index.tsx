import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAccounts, useDeleteAccount, useCreateAccount, useUpdateAccount, useAccount } from "@/hooks/useAccount"
import { useCompany } from "@/contexts/CompanyContext"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Plus } from "lucide-react"
import { Account, AccountType } from "@/@types/account.types"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { AccountFormModal } from "@/components/features/account/AccountFormModal"
import { DeleteAccountDialog } from "@/components/features/account/DeleteAccountDialog"
import { toast } from "sonner"

type FilterTab = "ALL" | AccountType

// Simple schema for modal with only 4 fields
const createAccountModalSchema = z.object({
    code: z.string().min(1, "Kode akun wajib diisi"),
    group: z.string().min(1, "Grup akun wajib diisi"),
    category: z.enum(["DEBET", "KREDIT"]),
    description: z.string().min(1, "Deskripsi wajib diisi"),
})

type CreateAccountModalFormValues = z.infer<typeof createAccountModalSchema>

export default function AccountPage() {
    const router = useRouter()
    const { companyId } = useCompany()
    const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL")
    const deleteAccount = useDeleteAccount()
    const createAccount = useCreateAccount()
    const updateAccount = useUpdateAccount()

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null)

    const filter = activeFilter === "ALL" ? undefined : activeFilter
    const { data, isLoading, isError } = useAccounts(companyId, filter)

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)

    // Form for create modal
    const form = useForm<CreateAccountModalFormValues>({
        resolver: zodResolver(createAccountModalSchema),
        defaultValues: {
            code: "",
            group: "",
            category: "DEBET",
            description: "",
        },
    })

    // Form for edit modal
    const editForm = useForm<CreateAccountModalFormValues>({
        resolver: zodResolver(createAccountModalSchema),
        defaultValues: {
            code: "",
            group: "",
            category: "DEBET",
            description: "",
        },
    })

    // Populate edit form when account changes
    useEffect(() => {
        if (accountToEdit) {
            editForm.reset({
                code: accountToEdit.code,
                group: accountToEdit.group,
                category: accountToEdit.category,
                description: accountToEdit.description,
            })
        }
    }, [accountToEdit, editForm])

    const handleCreateAccount = () => {
        setCreateModalOpen(true)
    }

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false)
        form.reset()
    }

    const handleCloseEditModal = () => {
        setEditModalOpen(false)
        setAccountToEdit(null)
        editForm.reset()
    }

    const onSubmitCreate = async (values: CreateAccountModalFormValues) => {
        if (!companyId) {
            console.error("Company ID not found")
            return
        }

        try {
            // Set default values for fields not in modal
            await createAccount.mutateAsync({
                ...values,
                accountType: "AKTIVA", // default value
                parentId: undefined, // no parent
                isActive: true, // active by default
                companyId,
            })
            handleCloseCreateModal()
            toast.success("Data berhasil ditambahkan")
        } catch (error: any) {
            console.error("Failed to create account:", error)

            if (error.message === "Kode akun sudah digunakan") {
                form.setError("code", {
                    type: "manual",
                    message: "Kode akun sudah digunakan",
                })
            } else {
                toast.error("Gagal menambahkan data akun")
            }
        }
    }

    const onSubmitEdit = async (values: CreateAccountModalFormValues) => {
        if (!accountToEdit) return

        try {
            await updateAccount.mutateAsync({
                id: accountToEdit.id,
                payload: {
                    ...values,
                    // Keep existing values for fields not in modal
                    accountType: accountToEdit.accountType,
                    parentId: accountToEdit.parentId,
                    isActive: accountToEdit.isActive,
                },
            })
            handleCloseEditModal()
            toast.success("Data berhasil diperbarui")
        } catch (error: any) {
            console.error("Failed to update account:", error)

            if (error.message === "Kode akun sudah digunakan") {
                editForm.setError("code", {
                    type: "manual",
                    message: "Kode akun sudah digunakan",
                })
            } else {
                toast.error("Gagal memperbarui data akun")
            }
        }
    }

    const handleEditAccount = (account: Account) => {
        setAccountToEdit(account)
        setEditModalOpen(true)
    }

    const handleDeleteClick = (account: Account) => {
        setAccountToDelete(account)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!accountToDelete) return

        try {
            await deleteAccount.mutateAsync(accountToDelete.id)
            setDeleteDialogOpen(false)
            setAccountToDelete(null)
            toast.success("Data berhasil dihapus")
        } catch (error) {
            console.error("Failed to delete account:", error)
            toast.error("Gagal menghapus data akun")
        }
    }

    const getTypeBadge = (type: AccountType) => {
        if (type === "AKTIVA") {
            return (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    Aktiva
                </Badge>
            )
        }
        return (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Pasiva
            </Badge>
        )
    }

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Active
                </Badge>
            )
        }
        return (
            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                Inactive
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Akun</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola akun finance dengan mudah
                        </p>
                    </div>
                </div>
                <Card className="rounded-xl p-6">
                    <div className="text-center text-muted-foreground">
                        Loading...
                    </div>
                </Card>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Akun</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola akun finance dengan mudah
                        </p>
                    </div>
                </div>
                <Card className="rounded-xl p-6">
                    <div className="text-center text-destructive">
                        Gagal memuat data
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Akun</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola akun finance dengan mudah
                        </p>
                    </div>

                    <Button onClick={handleCreateAccount} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                {/* FILTER TABS & TABLE CARD */}
                <Card className="rounded-xl overflow-hidden">
                    <div className="p-6">
                        {/* FILTER TABS */}
                        <div className="mb-6 flex items-center gap-2">
                            <Button
                                variant={
                                    activeFilter === "ALL"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setActiveFilter("ALL")}
                            >
                                Semua
                            </Button>
                            <Button
                                variant={
                                    activeFilter === "AKTIVA"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setActiveFilter("AKTIVA")}
                            >
                                Aktiva
                            </Button>
                            <Button
                                variant={
                                    activeFilter === "PASIVA"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setActiveFilter("PASIVA")}
                            >
                                Pasiva
                            </Button>
                        </div>

                        {/* SHOW ENTRIES (sesuai Figma) */}
                        <div className="mb-4 flex items-center gap-2 text-sm">
                            <span>Show</span>
                            <div className="rounded-md border px-3 py-1">
                                25
                            </div>
                            <span>Entries</span>
                        </div>

                        {/* TABLE */}
                        <div className="rounded-xl border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted hover:bg-muted">
                                        <TableHead className="font-semibold">
                                            KODE AKUN
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            GRUP AKUN
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            DESKRIPSI
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            CASH FLOW
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            ACTION
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {data?.data.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center text-muted-foreground"
                                            >
                                                Tidak ada data
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {data?.data.map((account) => (
                                        <TableRow
                                            key={account.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                {account.code}
                                            </TableCell>
                                            <TableCell>
                                                {account.group}
                                            </TableCell>
                                            <TableCell>
                                                {account.description}
                                            </TableCell>
                                            <TableCell>
                                                {account.cashFlow}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleEditAccount(
                                                                    account
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    account
                                                                )
                                                            }
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* PAGINATION */}
                        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                Showing 1-{data?.data.length || 0} of{" "}
                                {data?.meta.total} data
                            </span>

                            <div className="flex items-center gap-2">
                                <span className="cursor-pointer hover:text-foreground">
                                    Previous
                                </span>
                                <div className="rounded-md border bg-muted px-3 py-1 text-foreground font-medium">
                                    1
                                </div>
                                <span className="cursor-pointer hover:text-foreground">
                                    Next
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* DELETE CONFIRMATION DIALOG */}
            <DeleteAccountDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteAccount.isPending}
            />

            {/* CREATE ACCOUNT MODAL */}
            <AccountFormModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                form={form}
                onSubmit={onSubmitCreate}
                title="Tambah Data Akun Transasaasi"
                description="Masukkan detail akun baru"
                isSubmitting={createAccount.isPending}
            />

            {/* EDIT ACCOUNT MODAL */}
            <AccountFormModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                form={editForm}
                onSubmit={onSubmitEdit}
                title="Edit Data Akun Transasaasi"
                description="Perbarui detail akun"
                submitLabel="Perbarui"
                isSubmitting={updateAccount.isPending}
            />
        </DashboardLayout>
    )
}
