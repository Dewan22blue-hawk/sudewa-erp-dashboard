import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useCompany } from "@/contexts/CompanyContext"
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomer"
import { customerSchema, type CustomerFormValues } from "@/scheme/customer.schema"
import { CustomerTable } from "@/components/features/customer/CustomerTable"
import { CustomerFormDialog } from "@/components/features/customer/CustomerFormDialog"
import { DeleteCustomerDialog } from "@/components/features/customer/DeleteCustomerDialog"
import type { Customer } from "@/@types/customer.types"

export default function CustomerPage() {
    const { companyId } = useCompany()
    const { data, isLoading, isError } = useCustomers(companyId)
    const createCustomer = useCreateCustomer()
    const updateCustomer = useUpdateCustomer()
    const deleteCustomer = useDeleteCustomer()

    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null)
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

    const createForm = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            address: "",
            npwp: "",
            pic: "",
            phone: "",
        },
    })

    const editForm = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            address: "",
            npwp: "",
            pic: "",
            phone: "",
        },
    })

    useEffect(() => {
        if (customerToEdit) {
            editForm.reset({
                name: customerToEdit.name,
                address: customerToEdit.address,
                npwp: customerToEdit.npwp,
                pic: customerToEdit.pic,
                phone: customerToEdit.phone,
            })
        }
    }, [customerToEdit, editForm])

    const handleCreateClick = () => {
        setCreateModalOpen(true)
    }

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false)
        createForm.reset()
    }

    const handleCloseEditModal = () => {
        setEditModalOpen(false)
        setCustomerToEdit(null)
        editForm.reset()
    }

    const onSubmitCreate = async (values: CustomerFormValues) => {
        if (!companyId) {
            toast.error("Company ID tidak ditemukan")
            return
        }

        try {
            await createCustomer.mutateAsync({
                ...values,
                companyId,
            })
            handleCloseCreateModal()
            toast.success("Data berhasil ditambahkan")
        } catch (error) {
            console.error("Failed to create customer:", error)
            toast.error("Gagal menambahkan data customer")
        }
    }

    const onSubmitEdit = async (values: CustomerFormValues) => {
        if (!customerToEdit) return

        try {
            await updateCustomer.mutateAsync({
                id: customerToEdit.id,
                payload: values,
            })
            handleCloseEditModal()
            toast.success("Data berhasil diperbarui")
        } catch (error) {
            console.error("Failed to update customer:", error)
            toast.error("Gagal memperbarui data customer")
        }
    }

    const handleEditCustomer = (customer: Customer) => {
        setCustomerToEdit(customer)
        setEditModalOpen(true)
    }

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!customerToDelete) return

        try {
            await deleteCustomer.mutateAsync(customerToDelete.id)
            setDeleteDialogOpen(false)
            setCustomerToDelete(null)
            toast.success("Data berhasil dihapus")
        } catch (error) {
            console.error("Failed to delete customer:", error)
            toast.error("Gagal menghapus data customer")
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Customer</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola data customer dengan mudah
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
                            <h1 className="text-2xl font-semibold">Customer</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola data customer dengan mudah
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
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Customer</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data customer dengan mudah
                        </p>
                    </div>
                </div>

                {/* TABLE CARD */}
                <div className="">
                    <CustomerTable
                        customers={data?.data || []}
                        onEdit={handleEditCustomer}
                        onDelete={handleDeleteClick}
                        onAdd={handleCreateClick}
                    />
                </div>
            </div>

            <CustomerFormDialog
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                form={createForm}
                onSubmit={onSubmitCreate}
                title="Tambah Data Customer"
                description="Masukkan detail customer baru"
                isSubmitting={createCustomer.isPending}
            />

            <CustomerFormDialog
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                form={editForm}
                onSubmit={onSubmitEdit}
                title="Edit Data Customer"
                description="Perbarui detail customer"
                submitLabel="Perbarui"
                isSubmitting={updateCustomer.isPending}
            />

            <DeleteCustomerDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteCustomer.isPending}
            />
        </DashboardLayout>
    )
}
