import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DriverTable } from '@/components/features/driver/DriverTable';
import { DriverFormModal } from '@/components/features/driver/DriverFormModal';
import { DeleteDriverModal } from '@/components/features/driver/DeleteDriverModal';
import { ImportDriverModal } from '@/components/features/driver/ImportDriverModal';
import { toast } from 'sonner';
import {
    useDrivers,
    useCreateDriver,
    useUpdateDriver,
    useDeleteDriver,
    useImportDriver,
    useExportDriver,
} from '@/hooks/useDriver';
import { useCompany } from '@/contexts/CompanyContext';
import type { Driver, DriverPayload } from '@/@types/driver.types';
import { useAuthMe } from '@/features/auth/hooks/use-auth-me';

export default function DriverPage() {
    const { companyId: localCompanyId } = useCompany();
    const { data: profile } = useAuthMe();

    // Table state
    const [searchInput, setSearchInput] = useState('');   // immediate display value
    const [search, setSearch] = useState('');              // debounced (sent to API)
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Live search debounce — 400ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Data & mutations
    const { data: driversData, isLoading } = useDrivers({ page, perPage, search, company_id: localCompanyId ?? undefined });
    const createMutation = useCreateDriver();
    const updateMutation = useUpdateDriver();
    const deleteMutation = useDeleteDriver();
    const importMutation = useImportDriver();
    const exportMutation = useExportDriver();

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleAddClick = () => {
        setSelectedDriver(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsDeleteOpen(true);
    };

    const handleSaveForm = async (data: DriverPayload) => {
        const companyId = localCompanyId || 1;
        const userId = profile?.data?.id ? Number(profile.data.id) || profile.data.id : undefined;
        try {
            if (selectedDriver) {
                await updateMutation.mutateAsync({
                    id: selectedDriver.id,
                    data: { ...data, company_id: companyId, user_id: userId },
                });
                toast.success('Data driver berhasil diubah');
            } else {
                await createMutation.mutateAsync({ ...data, company_id: companyId, user_id: userId });
                toast.success('Data driver berhasil ditambahkan');
            }
            setIsFormOpen(false);
            setSelectedDriver(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan data driver');
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedDriver) return;
        try {
            await deleteMutation.mutateAsync(selectedDriver.id);
            toast.success('Data driver berhasil dihapus');
            setIsDeleteOpen(false);
            setSelectedDriver(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus data driver');
        }
    };

    const handleImport = async (file: File) => {
        const companyId = localCompanyId || 1;
        try {
            await importMutation.mutateAsync({ id: companyId, file });
            toast.success('Import data driver berhasil');
            setIsImportOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Import data driver gagal');
        }
    };

    const handleExport = async () => {
        try {
            await exportMutation.mutateAsync();
            toast.success('Berhasil export data driver');
        } catch (error: any) {
            toast.error(error.message || 'Gagal export data driver');
        }
    };

    const driverList = driversData?.data || [];
    const totalDrivers = driversData?.meta?.total || 0;

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Driver</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data driver dengan mudah</p>
                </div>

                {/* Content */}
                <DriverTable
                    drivers={driverList}
                    search={searchInput}
                    onSearchChange={(v) => setSearchInput(v)}
                    isLoading={isLoading}
                    page={page}
                    perPage={perPage}
                    totalData={totalDrivers}
                    onPageChange={setPage}
                    onPerPageChange={(v) => {
                        setPerPage(v);
                        setPage(1);
                    }}
                    onAdd={handleAddClick}
                    onImport={() => setIsImportOpen(true)}
                    onExport={handleExport}
                    isExporting={exportMutation.isPending}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            </div>

            {/* Modals */}
            <DriverFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setTimeout(() => setSelectedDriver(null), 300);
                }}
                onSave={handleSaveForm}
                initialData={selectedDriver}
                isSubmitting={isSaving}
                companyId={localCompanyId || 1}
                userId={profile?.data?.id}
            />

            <DeleteDriverModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMutation.isPending}
            />

            <ImportDriverModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleImport}
                isUploading={importMutation.isPending}
            />
        </DashboardLayout>
    );
}
