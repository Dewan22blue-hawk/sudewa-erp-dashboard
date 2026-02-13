import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useCompany } from "@/contexts/CompanyContext"
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/useSupplier"
import { createSupplierSchema, type CreateSupplierFormValues } from "@/scheme/supplier.schema"
import { SupplierTable } from "@/components/features/supplier/SupplierTable"
import { SupplierFormDialog } from "@/components/features/supplier/SupplierFormDialog"
import { DeleteSupplierDialog } from "@/components/features/supplier/DeleteSupplierDialog"
import type { Supplier } from "@/@types/supplier.types"

export default function SupplierPage() {
    const { companyId } = useCompany()
    const { data, isLoading, isError } = useSuppliers(companyId)
    const createSupplier = useCreateSupplier()
    const updateSupplier = useUpdateSupplier()
    const deleteSupplier = useDeleteSupplier()

    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null)
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

    const createForm = useForm<CreateSupplierFormValues>({
        resolver: zodResolver(createSupplierSchema),
        defaultValues: {
            name: "",
            address: "",
            npwp: "",
            pic: "",
            phone: "",
        },
    })

    const editForm = useForm<CreateSupplierFormValues>({
        resolver: zodResolver(createSupplierSchema),
        defaultValues: {
            name: "",
            address: "",
            npwp: "",
            pic: "",
            phone: "",
        },
    })

    useEffect(() => {
        if (supplierToEdit) {
            editForm.reset({
                name: supplierToEdit.name,
                address: supplierToEdit.address,
                npwp: supplierToEdit.npwp,
                pic: supplierToEdit.pic,
                phone: supplierToEdit.phone,
            })
        }
    }, [supplierToEdit, editForm])

    const handleCreateClick = () => {
        setCreateModalOpen(true)
    }

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false)
        createForm.reset()
    }

    const handleCloseEditModal = () => {
        setEditModalOpen(false)
        setSupplierToEdit(null)
        editForm.reset()
    }

    const onSubmitCreate = async (values: CreateSupplierFormValues) => {
        if (!companyId) {
            toast.error("Company ID tidak ditemukan")
            return
        }

        try {
            await createSupplier.mutateAsync({
                ...values,
                companyId,
            })
            handleCloseCreateModal()
            toast.success("Data berhasil ditambahkan")
        } catch (error) {
            console.error("Failed to create supplier:", error)
            toast.error("Gagal menambahkan data supplier")
        }
    }

    const onSubmitEdit = async (values: CreateSupplierFormValues) => {
        if (!supplierToEdit) return

        try {
            await updateSupplier.mutateAsync({
                id: supplierToEdit.id,
                payload: values,
            })
            handleCloseEditModal()
            toast.success("Data berhasil diperbarui")
        } catch (error) {
            console.error("Failed to update supplier:", error)
            toast.error("Gagal memperbarui data supplier")
        }
    }

    const handleEditSupplier = (supplier: Supplier) => {
        setSupplierToEdit(supplier)
        setEditModalOpen(true)
    }

    const handleDeleteClick = (supplier: Supplier) => {
        setSupplierToDelete(supplier)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!supplierToDelete) return

        try {
            await deleteSupplier.mutateAsync(supplierToDelete.id)
            setDeleteDialogOpen(false)
            setSupplierToDelete(null)
            toast.success("Data berhasil dihapus")
        } catch (error) {
            console.error("Failed to delete supplier:", error)
            toast.error("Gagal menghapus data supplier")
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Supplier</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola data supplier dengan mudah
                            </p>
                        </div>
                    </div>
                    <Card className="rounded-xl p-6">
                        <div className="text-center text-muted-foreground">
                            Loading...
                        </div>
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
                            <h1 className="text-2xl font-semibold">Supplier</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola data supplier dengan mudah
                            </p>
                        </div>
                    </div>
                    <Card className="rounded-xl p-6">
                        <div className="text-center text-destructive">
                            Gagal memuat data
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Supplier</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data supplier dengan mudah
                        </p>
                    </div>
                    <Button onClick={handleCreateClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                <Card className="rounded-xl p-6">
                    <SupplierTable
                        suppliers={data?.data || []}
                        onEdit={handleEditSupplier}
                        onDelete={handleDeleteClick}
                    />
                </Card>
            </div>

            <SupplierFormDialog
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                form={createForm}
                onSubmit={onSubmitCreate}
                title="Tambah Data Supplier"
                description="Masukkan detail supplier baru"
                isSubmitting={createSupplier.isPending}
            />

            <SupplierFormDialog
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                form={editForm}
                onSubmit={onSubmitEdit}
                title="Edit Data Supplier"
                description="Perbarui detail supplier"
                submitLabel="Perbarui"
                isSubmitting={updateSupplier.isPending}
            />

            <DeleteSupplierDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteSupplier.isPending}
            />
        </DashboardLayout>
    )
}
