'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/contexts/CompanyContext';
import { DataImportModal } from '../../master-data/DataImportModal';
import { useImportDealer } from '@/hooks/useDealer';

export const DealerListPage = () => {
    const { companyId } = useCompany();
    const [openImport, setOpenImport] = useState(false);
    const importMutation = useImportDealer();

    const handleImport = async (file: File) => {
        await importMutation.mutateAsync({ companyId: companyId ?? '', file });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Dealer</h1>
                        <p className="text-sm text-muted-foreground">Kelola data dealer</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setOpenImport(true)} variant="outline" className="gap-2">
                            Import
                        </Button>
                        <Button className="gap-2">
                            + Tambah
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                    Table data dealer akan segera hadir.
                </div>
            </div>

            <DataImportModal
                open={openImport}
                onOpenChange={setOpenImport}
                title="Import Data Dealer"
                description="Unggah file .xlsx untuk mengimport data dealer."
                onImport={handleImport}
                isPending={importMutation.isPending}
                templateUrl="https://docs.google.com/spreadsheets/d/1wQmTkJSGyt7vb6DA21TdHyYiDD3tLqlXxUwQA88Qb1M/edit?usp=sharing"
            />
        </DashboardLayout>
    );
};
