'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/contexts/CompanyContext';
import { DataImportModal } from '../../master-data/DataImportModal';
import { Plus, Upload } from 'lucide-react';
import { useImportCustomer } from '@/hooks/useCustomer';

export const CustomerListPage = () => {
    const { companyId } = useCompany();
    const [openImport, setOpenImport] = useState(false);
    const importMutation = useImportCustomer();

    const handleImport = async (file: File) => {
        await importMutation.mutateAsync({ companyId: companyId ?? '', file });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Customer</h1>
                        <p className="text-sm text-muted-foreground">Kelola data customer</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setOpenImport(true)} variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Import
                        </Button>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                    Table data customer akan segera hadir.
                </div>
            </div>

            <DataImportModal
                open={openImport}
                onOpenChange={setOpenImport}
                title="Import Data Customer"
                description="Unggah file .xlsx untuk mengimport data customer."
                onImport={handleImport}
                isPending={importMutation.isPending}
                templateUrl="https://docs.google.com/spreadsheets/d/1wQmTkJSGyt7vb6DA21TdHyYiDD3tLqlXxUwQA88Qb1M/edit?usp=sharing"
            />
        </DashboardLayout>
    );
};
