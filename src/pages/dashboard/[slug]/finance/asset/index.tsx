import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FinanceAssetTable } from '@/components/features/finance/asset/FinanceAssetTable';
import { useFinanceAssets, useDeleteFinanceAsset, useExportFinanceAsset } from '@/hooks/useFinanceAsset';
import { useCompany } from '@/contexts/CompanyContext';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DeleteAssetModal } from '@/components/features/master/asset/DeleteAssetModal';
import type { FinanceAsset } from '@/@types/finance-asset.types';

export default function FinanceAssetPage() {
    const { companyId } = useCompany();
    const router = useRouter();
    const { slug } = router.query;

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const { data: assetsData, isLoading } = useFinanceAssets(companyId, { page, perPage, search });
    const deleteMutation = useDeleteFinanceAsset();
    const exportMutation = useExportFinanceAsset();

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<FinanceAsset | null>(null);

    const filteredAssets = useMemo(() => {
        const assets = assetsData?.data || [];
        if (!companyId) return assets;

        return assets.filter((asset) => {
            if (asset.company_id === undefined || asset.company_id === null) {
                return true;
            }

            return String(asset.company_id) === String(companyId);
        });
    }, [assetsData?.data, companyId]);

    const totalAssets = useMemo(() => {
        const apiTotal = assetsData?.meta.total ?? 0;
        const hasCompanyIdOnEveryRow = filteredAssets.every(
            (asset) => asset.company_id !== undefined && asset.company_id !== null,
        );

        return hasCompanyIdOnEveryRow ? filteredAssets.length : apiTotal;
    }, [assetsData?.meta.total, filteredAssets]);

    const handleEdit = (asset: FinanceAsset) => {
        router.push(`/dashboard/${slug}/finance/asset/${asset.id}/edit`);
    };

    const handleDetail = (asset: FinanceAsset) => {
        router.push(`/dashboard/${slug}/finance/asset/${asset.id}`);
    };

    const handleDelete = (asset: FinanceAsset) => {
        setSelectedAsset(asset);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAsset) return;
        try {
            await deleteMutation.mutateAsync(selectedAsset.id);
            toast.success('Data aset berhasil dihapus');
            setIsDeleteOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus data');
        }
    };

    const handleExport = async () => {
        try {
            await exportMutation.mutateAsync();
            toast.success('Data aset berhasil diekspor');
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengekspor data');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Aset</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola seluruh aset dengan mudah</p>
                </div>

                <FinanceAssetTable
                    assets={filteredAssets}
                    search={search}
                    onSearchChange={(v) => {
                        setSearch(v);
                        setPage(1);
                    }}
                    page={page}
                    perPage={perPage}
                    totalData={totalAssets}
                    onPageChange={setPage}
                    onPerPageChange={(v) => {
                        setPerPage(v);
                        setPage(1);
                    }}
                    onExport={handleExport}
                    isExporting={exportMutation.isPending}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDetail={handleDetail}
                    isLoading={isLoading}
                />
            </div>

            <DeleteAssetModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMutation.isPending}
            />
        </DashboardLayout>
    );
}
