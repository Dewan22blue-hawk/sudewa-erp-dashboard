import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LaporanKasTable } from '@/components/features/laporan-kas/LaporanKasTable';
import { DUMMY_TRANSAKSI_KAS } from '@/components/features/laporan-kas/laporan-kas.data';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

export default function LaporanTransaksiKasPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(2025, 0, 20),
        to: addDays(new Date(2025, 0, 20), 20),
    });

    const handleShowData = () => {
        setIsLoading(true);
        // Simulate API fetch delay (800ms)
        setTimeout(() => {
            setIsLoading(false);
        }, 800);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporan Transaksi Kas</h1>
                    <p className="text-sm text-gray-500 mt-1">Pantau semua pemasukan dan pengeluaran</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 max-w-md">
                    <label className="text-sm font-semibold text-gray-900">Periode Transaksi</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <DatePickerWithRange
                                date={dateRange}
                                onChange={setDateRange}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="bg-[#f8f9fa] shadow-sm text-gray-700 gap-2 shrink-0"
                            onClick={handleShowData}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                            Show
                        </Button>
                    </div>
                </div>

                {/* Main Table Content */}
                <div className="pt-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <LaporanKasTable data={DUMMY_TRANSAKSI_KAS} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}