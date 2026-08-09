"use client"

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LaporanPembelianFilter from '@/components/features/laporan-pembelian/LaporanPembelianFilter';
import LaporanPembelianPerNota from '@/components/features/laporan-pembelian/LaporanPembelianPerNota';
import LaporanPembelianPerTipe from '@/components/features/laporan-pembelian/LaporanPembelianPerTipe';
import LaporanPembelianPerSupplier from '@/components/features/laporan-pembelian/LaporanPembelianPerSupplier';
import { useLaporanPembelian } from '@/hooks/useLaporanPembelian';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';

export default function LaporanPembelianPage() {
  const [activeTab, setActiveTab] = useState('per-nota');
  const router = useRouter();
  const { companyId } = useCompany();
  const {
    data,
    pagination,
    isLoading,
    setPage,
    applyFilters,
    resetFiltersForTab,
    startDate,
    endDate,
  } = useLaporanPembelian();

  const slugParam = router.query.slug;
  const resolvedCompanyId = resolveCompanyId(slugParam, companyId);
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetFiltersForTab(tab);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    let csvContent = "";

    const getReportTitle = () => {
      switch (activeTab) {
        case 'per-tipe': return 'REKAP PEMBELIAN PER TIPE';
        case 'per-supplier': return 'REKAP PEMBELIAN PER SUPPLIER';
        default: return 'REKAP PEMBELIAN PER NOTA';
      }
    };

    const periodText = startDate && endDate
      ? `Periode: ${format(new Date(startDate), 'dd/MM/yyyy')} s.d. ${format(new Date(endDate), 'dd/MM/yyyy')}`
      : 'Tahun 2026';

    csvContent += `"${getReportTitle()}"\n`;
    csvContent += `"PT DERALY  "\n`;
    csvContent += `"${periodText}"\n\n`;

    if (activeTab === 'per-nota') {
      csvContent += "NO,NO PEMBELIAN,TGL BELI,TIPE UNIT,QTY,HARGA BELI,BIAYA BBN,BIAYA EKSPEDISI,BIAYA LAINNYA,HPP,DPP,PPN,JUMLAH\n";

      data.forEach((item, idx) => {
        csvContent += `${idx + 1},`;
        csvContent += `"${item.transaction_code}",`;
        csvContent += `"${new Date(item.transaction_date).toLocaleDateString('id-ID')}",`;
        csvContent += `"${item.unit_name || '-'}",`;
        csvContent += `${item.qty || 0},`;
        csvContent += `${item.price || 0},`;
        csvContent += `${item.bbn || 0},`;
        csvContent += `${item.expedition_fee || 0},`;
        csvContent += `${item.other_fee || 0},`;
        csvContent += `${item.hpp_fee || 0},`;
        csvContent += `${item.dpp || 0},`;
        csvContent += `${item.ppn || 0},`;
        csvContent += `${item.total || 0}\n`;
      });
    } else if (activeTab === 'per-tipe') {
      csvContent += "NO,NO PEMBELIAN,TGL BELI,TIPE UNIT,QTY,HARGA,BIAYA BBN,BIAYA EKSPEDISI,BIAYA LAIN,TOTAL BELI\n";

      data.forEach((item, idx) => {
        csvContent += `${idx + 1},`;
        csvContent += `"${item.transaction_code}",`;
        csvContent += `"${new Date(item.transaction_date).toLocaleDateString('id-ID')}",`;
        csvContent += `"${item.unit_name || '-'}",`;
        csvContent += `${item.qty || 0},`;
        csvContent += `${item.price || 0},`;
        csvContent += `${item.bbn || 0},`;
        csvContent += `${item.expedition_fee || 0},`;
        csvContent += `${item.other_fee || 0},`;
        csvContent += `${item.total || 0}\n`;
      });
    } else {
      csvContent += "NO,NO PEMBELIAN,TGL BELI,NAMA SUPPLIER,QTY,HARGA,BIAYA BBN,BIAYA EKSPEDISI,BIAYA LAIN,TOTAL BELI\n";

      data.forEach((item, idx) => {
        csvContent += `${idx + 1},`;
        csvContent += `"${item.transaction_code}",`;
        csvContent += `"${new Date(item.transaction_date).toLocaleDateString('id-ID')}",`;
        csvContent += `"${item.person_name || '-'}",`;
        csvContent += `${item.qty || 0},`;
        csvContent += `${item.price || 0},`;
        csvContent += `${item.bbn || 0},`;
        csvContent += `${item.expedition_fee || 0},`;
        csvContent += `${item.other_fee || 0},`;
        csvContent += `${item.total || 0}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const uniqueId = new Date().getTime();
    const fileName = `Laporan_Pembelian_${activeTab}_${uniqueId}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="no-print">
          <PageHeader
            title="Laporan Pembelian"
            subtitle="Pantau semua transaksi pembelian"
          />
        </div>

        <div className="space-y-4">
          <LaporanPembelianFilter
            activeTab={activeTab}
            startDate={startDate}
            endDate={endDate}
            onApplyFilters={applyFilters}
            onPrint={handlePrint}
            onDownload={exportToCSV}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            {/* Tab triggers wrapped to look like pills */}
            <div className="flex no-print">
              <TabsList className="flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-md">
                <TabsTrigger
                  value="per-nota"
                  className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  Laporan Pembelian Per Nota
                </TabsTrigger>
                <TabsTrigger
                  value="per-tipe"
                  className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  Laporan Pembelian Per Tipe
                </TabsTrigger>
                <TabsTrigger
                  value="per-supplier"
                  className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  Laporan Pembelian Per Supplier
                </TabsTrigger>
              </TabsList>
            </div>

            <PrintLetterPage
              id="laporan-pembelian-print"
              className="laporan-pembelian-print-area"
              letterheadSrc={selectedPrintBackground}
            >
              <div className="laporan-pembelian-print-content">
                <div className="flex flex-col items-center justify-center text-center space-y-1 mb-8">
                  <h2 className="text-[13px] font-bold uppercase text-gray-900 tracking-wide">
                    REKAP PEMBELIAN {activeTab.replace('-', ' ')}
                  </h2>
                  <p className="text-[13px] font-bold text-gray-900 tracking-wide">
                    PT DERALY
                  </p>
                  <p className="text-[13px] font-semibold text-gray-800 opacity-90">
                    {startDate && endDate
                      ? `Periode: ${format(new Date(startDate), 'dd/MM/yyyy')} s.d. ${format(new Date(endDate), 'dd/MM/yyyy')}`
                      : '2026'}
                  </p>
                </div>

                <TabsContent value="per-nota" className="mt-0">
                  <LaporanPembelianPerNota
                    data={data}
                    pagination={pagination}
                    isLoading={isLoading}
                    onPageChange={setPage}
                  />
                </TabsContent>

                <TabsContent value="per-tipe" className="mt-0">
                  <LaporanPembelianPerTipe
                    data={data}
                    pagination={pagination}
                    isLoading={isLoading}
                    onPageChange={setPage}
                  />
                </TabsContent>

                <TabsContent value="per-supplier" className="mt-0">
                  <LaporanPembelianPerSupplier
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
      </div>
    </DashboardLayout>
  );
}