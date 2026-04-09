"use client"

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LaporanPengirimanFilter from '@/components/features/laporan-pengiriman/LaporanPengirimanFilter';
import LaporanPengirimanTable from '@/components/features/laporan-pengiriman/LaporanPengirimanTable';
import LaporanPengirimanPerTipe from '@/components/features/laporan-pengiriman/LaporanPengirimanPerTipe';
import LaporanPengirimanPerCustomer from '@/components/features/laporan-pengiriman/LaporanPengirimanPerCustomer';
import { useLaporanPengiriman } from '@/hooks/useLaporanPengiriman';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';

type TabType = 'per-nota' | 'per-tipe' | 'per-customer';

export default function LaporanPengirimanPage() {
  const [activeTab, setActiveTab] = useState<TabType>('per-nota');

  const router = useRouter();
  const { companyId } = useCompany();
  const {
    data,
    pagination,
    isLoading,
    startDate,
    endDate,
    setPage,
    setPerPage,
    setDateRange,
    setCustomer,
    setUnitType,
  } = useLaporanPengiriman();

  const slugParam = router.query.slug;
  const resolvedCompanyId = resolveCompanyId(slugParam, companyId);
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setCustomer(null);
    setUnitType(null);
  };

  const handleApplyFilters = (filters: {
    startDate: string | null;
    endDate: string | null;
    customerId: number | null;
    unitTypeId: number | null;
    perPage: number;
  }) => {
    setDateRange(filters.startDate, filters.endDate);
    setCustomer(filters.customerId);
    setUnitType(filters.unitTypeId);
    setPerPage(filters.perPage);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      alert('Tidak ada data untuk diunduh');
      return;
    }

    const headers: string[] = [
      'NO',
      'NO PENGIRIMAN',
      'TGL KIRIM',
      'NAMA CUSTOMER',
      'TIPE UNIT',
      'WARNA',
      'NO MESIN',
      'NO RANGKA',
    ];

    const rows: (string | number)[][] = data.map((item, idx) => [
      idx + 1 + (pagination.currentPage - 1) * pagination.perPage,
      item.transaction_code,
      new Date(item.receipt_date).toLocaleDateString('id-ID'),
      item.person,
      item.unit_type.name,
      item.color,
      item.machine_number,
      item.chassis_number,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-pengiriman-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen laporan-pengiriman-page laporan-penerimaan-page">
        <div className="no-print">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-none mb-2">Laporan Pengiriman</h1>
          <p className="text-[15px] text-gray-500">Pantau semua transaksi pengiriman unit</p>
        </div>

        <LaporanPengirimanFilter
          activeTab={activeTab}
          startDate={startDate}
          endDate={endDate}
          onApplyFilters={handleApplyFilters}
          onPrint={handlePrint}
          onDownload={exportToCSV}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
          <div className="flex mb-12 no-print">
            <TabsList className="flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-xl">
              <TabsTrigger value="per-nota" className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
                Laporan Pengiriman
              </TabsTrigger>
              <TabsTrigger value="per-tipe" className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
                Laporan Pengiriman Per Tipe
              </TabsTrigger>
              <TabsTrigger value="per-customer" className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
                Laporan Pengiriman Per Customer
              </TabsTrigger>
            </TabsList>
          </div>

          <PrintLetterPage
            id="laporan-pengiriman-print"
            className="laporan-pengiriman-print-area laporan-penerimaan-print-area"
            letterheadSrc={selectedPrintBackground}
          >
            <div className="laporan-pengiriman-print-content laporan-penerimaan-print-content">
              <div className="flex flex-col items-center justify-center text-center space-y-1 mb-8">
                <h2 className="text-[13px] font-bold uppercase text-gray-900 tracking-wide">
                  REKAP PENGIRIMAN {activeTab.replace('-', ' ')}
                </h2>
                <p className="text-[13px] font-bold text-gray-900 tracking-wide">
                  PT WAJIRA JAGRATARA MORINDO
                </p>
                <p className="text-[13px] font-semibold text-gray-800 opacity-90">
                  {startDate && endDate
                    ? `Periode: ${format(new Date(startDate), 'dd/MM/yyyy')} s.d. ${format(new Date(endDate), 'dd/MM/yyyy')}`
                    : '2026'}
                </p>
              </div>

              <TabsContent value="per-nota" className="mt-0">
                <LaporanPengirimanTable
                  data={data}
                  pagination={pagination}
                  isLoading={isLoading}
                  onPageChange={setPage}
                />
              </TabsContent>

              <TabsContent value="per-tipe" className="mt-0">
                <LaporanPengirimanPerTipe
                  data={data}
                  pagination={pagination}
                  isLoading={isLoading}
                  onPageChange={setPage}
                />
              </TabsContent>

              <TabsContent value="per-customer" className="mt-0">
                <LaporanPengirimanPerCustomer
                  data={data}
                  pagination={pagination}
                  isLoading={isLoading}
                  onPageChange={setPage}
                />
              </TabsContent>
            </div>
          </PrintLetterPage>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
