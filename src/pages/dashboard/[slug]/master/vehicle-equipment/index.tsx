import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleEquipmentTable } from '@/components/features/vehicle-equipment/VehicleEquipmentTable';
import { VehicleEquipmentFormModal } from '@/components/features/vehicle-equipment/VehicleEquipmentFormModal';
import { DeleteVehicleEquipmentModal } from '@/components/features/vehicle-equipment/DeleteVehicleEquipmentModal';
import { useVehicleEquipments, useCreateVehicleEquipment, useUpdateVehicleEquipment, useDeleteVehicleEquipment } from '@/hooks/useVehicleEquipment';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { VehicleEquipment } from '@/@types/vehicle-equipment.types';

export default function VehicleEquipmentPage() {
    // Table state
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10); // Standard default show 10 entries as in mockup

    // React query operations
    const { data: listData, isLoading, isError } = useVehicleEquipments({ page, perPage, search });
    const createMutation = useCreateVehicleEquipment();
    const updateMutation = useUpdateVehicleEquipment();
    const deleteMutation = useDeleteVehicleEquipment();

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<VehicleEquipment | null>(null);

    // Handlers
    const handleAddClick = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (item: VehicleEquipment) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (item: VehicleEquipment) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    const handleSaveForm = async (formData: { code: string; name: string }) => {
        try {
            if (selectedItem) {
                // Edit / Update
                await updateMutation.mutateAsync({ id: selectedItem.id, data: formData });
                toast.success('Data perlengkapan berhasil diubah');
            } else {
                // Add / Create
                await createMutation.mutateAsync(formData);
                toast.success('Data perlengkapan berhasil ditambahkan');
            }
            setIsFormOpen(false);
            setSelectedItem(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan data perlengkapan');
        }
    };

    const handleConfirmDelete = async () => {
        if (selectedItem) {
            try {
                await deleteMutation.mutateAsync(selectedItem.id);
                toast.success('Data perlengkapan berhasil dihapus');
                setIsDeleteOpen(false);
                setSelectedItem(null);
            } catch (error: any) {
                toast.error(error.message || 'Gagal menghapus data perlengkapan');
            }
        }
    };

    const equipmentsList = listData?.data || [];
    const totalEquipments = listData?.meta?.total ?? 0;

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header Title */}
                <div>
                    <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-none">
                        Perlengkapan
                    </h1>
                    <p className="text-[15px] text-gray-500 mt-2 font-medium">
                        Kelola data perlengkapan dengan mudah
                    </p>
                </div>

                {/* Loading / Error States */}
                {isLoading ? (
                    <Card className="rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#15305B]"></div>
                            <p className="text-sm font-semibold text-gray-500">Memuat data perlengkapan...</p>
                        </div>
                    </Card>
                ) : isError ? (
                    <Card className="rounded-2xl border border-red-100 bg-red-50/50 p-12 text-center shadow-sm">
                        <p className="text-sm font-semibold text-red-600">Gagal memuat data perlengkapan</p>
                    </Card>
                ) : (
                    /* Main Table component */
                    <VehicleEquipmentTable
                        equipments={equipmentsList}
                        search={search}
                        onSearchChange={(v) => {
                            setSearch(v);
                            setPage(1);
                        }}
                        page={page}
                        perPage={perPage}
                        totalData={totalEquipments}
                        onPageChange={setPage}
                        onPerPageChange={(v) => {
                            setPerPage(v);
                            setPage(1);
                        }}
                        onAdd={handleAddClick}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                )}
            </div>

            {/* Modals Form and Deletion */}
            <VehicleEquipmentFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setTimeout(() => setSelectedItem(null), 300);
                }}
                onSave={handleSaveForm}
                initialData={selectedItem}
                isSaving={createMutation.isPending || updateMutation.isPending}
            />

            <DeleteVehicleEquipmentModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setTimeout(() => setSelectedItem(null), 300);
                }}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMutation.isPending}
            />
        </DashboardLayout>
    );
}
