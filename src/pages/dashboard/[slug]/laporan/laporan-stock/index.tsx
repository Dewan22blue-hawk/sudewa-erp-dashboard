"use client";

import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer } from 'lucide-react';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import StockTab from '@/components/features/laporan-warehouse/StockTab';
import StockDetailTab from '@/components/features/laporan-warehouse/StockDetailTab';
import PurchaseOrderTab from '@/components/features/laporan-warehouse/PurchaseOrderTab';
import SalesOrderTab from '@/components/features/laporan-warehouse/SalesOrderTab';

const reportMeta = {
    stock: { title: 'Stock Unit', subtitle: 'Pantau semua stock unit' },
    'stock-detail': { title: 'Stock Unit Detail', subtitle: 'Pantau detail stock unit' },
    'purchase-order': { title: 'Purchase Order Outstanding', subtitle: 'Pantau semua purchase order' },
    'sales-order': { title: 'Sales Order Outstanding', subtitle: 'Pantau semua sales order' },
} as const;

export default function LaporanStockPage() {
    const [activeTab, setActiveTab] = useState('stock');
    const [currentActions, setCurrentActions] = useState<{ print: () => void; download: () => void } | null>(null);
    const [stockPerPage, setStockPerPage] = useState(50);

    const [stockDetailPerPage, setStockDetailPerPage] = useState(50);
    const [machineNumber, setMachineNumber] = useState('');
    const [appliedMachineNumber, setAppliedMachineNumber] = useState('');

    const [poPerPage, setPoPerPage] = useState(50);
    const [poDateRange, setPoDateRange] = useState<DateRange | undefined>();
    const [appliedPoDateRange, setAppliedPoDateRange] = useState<DateRange | undefined>();

    const [soPerPage, setSoPerPage] = useState(50);
    const [soDateRange, setSoDateRange] = useState<DateRange | undefined>();
    const [appliedSoDateRange, setAppliedSoDateRange] = useState<DateRange | undefined>();

    const router = useRouter();
    const { companyId } = useCompany();

    const slugParam = router.query.slug;
    const resolvedCompanyId = resolveCompanyId(slugParam, companyId);
    const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

    const activeMeta = reportMeta[activeTab as keyof typeof reportMeta] ?? reportMeta.stock;

    const pageFilter = useMemo(() => {
        switch (activeTab) {
            case 'stock-detail':
                return (
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <label className="text-[13px] font-medium text-slate-700">No Mesin</label>
                            <Input
                                value={machineNumber}
                                onChange={(event) => setMachineNumber(event.target.value)}
                                placeholder="Masukkan nomor mesin"
                                className="w-[240px] bg-white rounded-xl border-slate-200 shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-medium text-slate-700">Per Halaman</label>
                            <Select value={String(stockDetailPerPage)} onValueChange={(value) => setStockDetailPerPage(Number(value))}>
                                <SelectTrigger className="w-[120px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem className="cursor-pointer" value="25">25</SelectItem>
                                    <SelectItem className="cursor-pointer" value="50">50</SelectItem>
                                    <SelectItem className="cursor-pointer" value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-[#f8f9fa] shadow-sm text-gray-700 hover:bg-slate-50 gap-2 border border-slate-200 rounded-xl px-4 h-9 mb-[1px]"
                            onClick={() => setAppliedMachineNumber(machineNumber.trim())}
                        >
                            Show
                        </Button>
                    </div>
                );
            case 'purchase-order':
                return (
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <label className="text-[13px] font-medium text-slate-700">Periode Transaksi</label>
                            <div className="w-[280px]">
                                <DatePickerWithRange date={poDateRange} onChange={setPoDateRange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-medium text-slate-700">Per Halaman</label>
                            <Select value={String(poPerPage)} onValueChange={(value) => setPoPerPage(Number(value))}>
                                <SelectTrigger className="w-[120px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem className="cursor-pointer" value="25">25</SelectItem>
                                    <SelectItem className="cursor-pointer" value="50">50</SelectItem>
                                    <SelectItem className="cursor-pointer" value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-[#f8f9fa] shadow-sm text-gray-700 hover:bg-slate-50 gap-2 border border-slate-200 rounded-xl px-4 h-9 mb-[1px]"
                            onClick={() => setAppliedPoDateRange(poDateRange)}
                        >
                            Show
                        </Button>
                    </div>
                );
            case 'sales-order':
                return (
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <label className="text-[13px] font-medium text-slate-700">Periode Transaksi</label>
                            <div className="w-[280px]">
                                <DatePickerWithRange date={soDateRange} onChange={setSoDateRange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-medium text-slate-700">Per Halaman</label>
                            <Select value={String(soPerPage)} onValueChange={(value) => setSoPerPage(Number(value))}>
                                <SelectTrigger className="w-[120px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem className="cursor-pointer" value="25">25</SelectItem>
                                    <SelectItem className="cursor-pointer" value="50">50</SelectItem>
                                    <SelectItem className="cursor-pointer" value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-[#f8f9fa] shadow-sm text-gray-700 hover:bg-slate-50 gap-2 border border-slate-200 rounded-xl px-4 h-9 mb-[1px]"
                            onClick={() => setAppliedSoDateRange(soDateRange)}
                        >
                            Show
                        </Button>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                        <span>Show</span>
                        <Select value={String(stockPerPage)} onValueChange={(value) => setStockPerPage(Number(value))}>
                            <SelectTrigger className="w-[80px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value="25">25</SelectItem>
                                <SelectItem className="cursor-pointer" value="50">50</SelectItem>
                                <SelectItem className="cursor-pointer" value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>Page</span>
                    </div>
                );
        }
    }, [activeTab, machineNumber, poDateRange, poPerPage, soDateRange, soPerPage, stockDetailPerPage, stockPerPage]);

    return (
        <DashboardLayout>
            <div className="space-y-6 px-1">
                <div className="no-print">
                    <h1 className="text-2xl font-semibold text-slate-950">{activeMeta.title}</h1>
                    <p className="text-sm text-slate-500 mt-1">{activeMeta.subtitle}</p>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="no-print flex w-full flex-col gap-4">
                        <TabsList className="flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-xl self-start">
                            <TabsTrigger
                                value="stock"
                                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                            >
                                Jumlah Stock
                            </TabsTrigger>
                            <TabsTrigger
                                value="stock-detail"
                                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                            >
                                Stock Detail
                            </TabsTrigger>
                            <TabsTrigger
                                value="purchase-order"
                                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                            >
                                Purchase Order Outstanding
                            </TabsTrigger>
                            <TabsTrigger
                                value="sales-order"
                                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                            >
                                Sales Order Outstanding
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Unified Filter Toolbar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between w-full no-print">
                        <div className="flex items-end gap-4 w-full sm:w-auto">
                            {pageFilter}
                        </div>
                        <div className="flex items-center gap-3 self-start sm:self-auto">
                            <Button
                                variant="outline"
                                onClick={() => currentActions?.print()}
                                className="gap-2 rounded-xl px-4 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer"
                            >
                                <Printer className="h-4 w-4" /> Print
                            </Button>
                            <Button
                                onClick={() => currentActions?.download()}
                                className="gap-2 rounded-xl px-4 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-sm border-0 cursor-pointer"
                            >
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>
                    </div>

                    <PrintLetterPage
                        id="laporan-stock-print"
                        className="laporan-stock-print-area laporan-penerimaan-print-area"
                        letterheadSrc={selectedPrintBackground}
                    >
                        <div className="laporan-penerimaan-print-content laporan-stock-print-content">
                            <div className="flex flex-col items-center justify-center text-center space-y-0 mb-2">
                                <h2 className="text-[13px] font-bold uppercase text-gray-900 tracking-wide">
                                    {activeMeta.title}
                                </h2>
                                <p className="text-[13px] font-bold text-gray-900 tracking-wide">
                                    PT WAJIRA JAGRATARA MORINDO
                                </p>
                                <p className="text-[13px] font-semibold text-gray-800 opacity-90">
                                    {activeTab === 'purchase-order' && appliedPoDateRange?.from
                                        ? `Periode: ${appliedPoDateRange.from.toLocaleDateString('id-ID')} ${appliedPoDateRange.to ? `s.d. ${appliedPoDateRange.to.toLocaleDateString('id-ID')}` : ''}`
                                        : activeTab === 'sales-order' && appliedSoDateRange?.from
                                            ? `Periode: ${appliedSoDateRange.from.toLocaleDateString('id-ID')} ${appliedSoDateRange.to ? `s.d. ${appliedSoDateRange.to.toLocaleDateString('id-ID')}` : ''}`
                                            : 'Periode: Bulan Berjalan'}
                                </p>
                            </div>

                            <TabsContent value="stock">
                                <StockTab perPage={stockPerPage} onActionsChange={setCurrentActions} />
                            </TabsContent>

                            <TabsContent value="stock-detail">
                                <StockDetailTab perPage={stockDetailPerPage} machineNumber={appliedMachineNumber} onActionsChange={setCurrentActions} />
                            </TabsContent>

                            <TabsContent value="purchase-order">
                                <PurchaseOrderTab perPage={poPerPage} dateRange={appliedPoDateRange} onActionsChange={setCurrentActions} />
                            </TabsContent>

                            <TabsContent value="sales-order">
                                <SalesOrderTab perPage={soPerPage} dateRange={appliedSoDateRange} onActionsChange={setCurrentActions} />
                            </TabsContent>
                        </div>
                    </PrintLetterPage>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
