import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LaporanKasTable } from '@/components/features/laporan-kas/LaporanKasTable';
import {
    DUMMY_TRANSAKSI_KAS,
    DUMMY_NERACA,
    DUMMY_PPN_MASUKAN,
    DUMMY_PPN_KELUARAN,
    DUMMY_PPN_PERTAHUN
} from '@/components/features/laporan-kas/laporan-kas.data';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

export default function LaporanTransaksiKasPage() {
    const [activeTab, setActiveTab] = useState('Laporan Rugi Laba');
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(2025, 0, 20),
        to: addDays(new Date(2025, 0, 20), 20),
    });

    const tabs = [
        'Laporan Rugi Laba',
        'Neraca',
        'Laporan PPN Masukan Perbulan',
        'Laporan PPN Keluaran Perbulan',
        'Laporan PPN Pertahun'
    ];

    const getActiveData = () => {
        switch (activeTab) {
            case 'Laporan Rugi Laba': return DUMMY_TRANSAKSI_KAS;
            case 'Neraca': return DUMMY_NERACA;
            case 'Laporan PPN Masukan Perbulan': return DUMMY_PPN_MASUKAN;
            case 'Laporan PPN Keluaran Perbulan': return DUMMY_PPN_KELUARAN;
            case 'Laporan PPN Pertahun': return DUMMY_PPN_PERTAHUN;
            default: return [];
        }
    };

    const handleShowData = () => {
        setIsLoading(true);
        // Simulate API fetch delay (800ms)
        setTimeout(() => {
            setIsLoading(false);
        }, 800);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        // Optional: trigger loading on tab switch as well to match "fetching" behavior
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
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

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#f3f4f6] rounded-md border border-gray-100 max-w-fit mt-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Main Table Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <LaporanKasTable data={getActiveData()} />
                )}
            </div>
        </DashboardLayout>
    );
}