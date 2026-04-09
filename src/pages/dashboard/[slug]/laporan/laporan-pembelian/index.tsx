"use client"

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
    csvContent += `"PT WAJIRA JAGRATARA MORINDO"\n`;
    csvContent += `"${periodText}"\n\n`;

    if (activeTab === 'per-nota') {
      csvContent += "NO,No Pembelian,TGL BELI,TIPE UNIT,QTY,HARGA BELI,BIAYA BBN,BIAYA EKSPEDISI,BIAYA LAINNYA,HPP,DPP,PPN,JUMLAH\n";
      
      let index = 1;
      data.forEach((item) => {
        const items = item.unit_transaction_items || [];
        items.forEach((unit) => {
          csvContent += `${index},`;
          csvContent += `"${item.code}",`;
          csvContent += `"${new Date(item.created_at).toLocaleDateString('id-ID')}",`;
          csvContent += `"${unit.unit_type?.name || '-'}",`;
          csvContent += `${unit.qty_total},`;
          csvContent += `${unit.price},`;
          csvContent += `${unit.bbn_price},`;
          csvContent += `${unit.expedition_fee},`;
          csvContent += `${unit.other_fee},`;
          csvContent += `${unit.hpp_total_price},`;
          csvContent += `${unit.dpp_total_price},`;
          csvContent += `${unit.ppn_total_price},`;
          csvContent += `${(unit.price * unit.qty_total) + (unit.bbn_price * unit.qty_total) + unit.expedition_fee + unit.other_fee}\n`;
          index++;
        });
      });
    } else if (activeTab === 'per-tipe') {
      csvContent += "NO,NO PEMBELIAN,TGL BELI,TIPE UNIT,QTY,HARGA,BIAYA BBN,BIAYA EKSPEDISI,BIAYA LAIN,TOTAL BELI\n";
      
      data.forEach((item, idx) => {
        const items = item.unit_transaction_items || [];
        const unitTypes = Array.from(new Set(items.map(u => u.unit_type?.name).filter(Boolean))).join(', ');
        const qty = items.reduce((acc, curr) => acc + curr.qty_total, 0);
        const harga = items.reduce((acc, curr) => acc + (curr.price * curr.qty_total), 0);
        const biayaBbn = items.reduce((acc, curr) => acc + (curr.bbn_price * curr.qty_total), 0);
        const biayaEkspedisi = items.reduce((acc, curr) => acc + curr.expedition_fee, 0);
        const biayaLain = items.reduce((acc, curr) => acc + curr.other_fee, 0);
        
        csvContent += `${idx + 1},`;
        csvContent += `"${item.code}",`;
        csvContent += `"${new Date(item.created_at).toLocaleDateString('id-ID')}",`;
        csvContent += `"${unitTypes || '-'}",`;
        csvContent += `${qty},`;
        csvContent += `${harga},`;
        csvContent += `${biayaBbn},`;
        csvContent += `${biayaEkspedisi},`;
        csvContent += `${biayaLain},`;
        csvContent += `${item.transaction_bruto_total}\n`;
      });
    } else {
      csvContent += "NO,NO PEMBELIAN,TGL BELI,NAMA SUPPLIER,QTY,HARGA,BIAYA BBN,BIAYA EKSPEDISI,BIAYA LAIN,TOTAL BELI\n";
      
      data.forEach((item, idx) => {
        const items = item.unit_transaction_items || [];
        const qty = items.reduce((acc, curr) => acc + curr.qty_total, 0);
        const harga = items.reduce((acc, curr) => acc + (curr.price * curr.qty_total), 0);
        const biayaBbn = items.reduce((acc, curr) => acc + (curr.bbn_price * curr.qty_total), 0);
        const biayaEkspedisi = items.reduce((acc, curr) => acc + curr.expedition_fee, 0);
        const biayaLain = items.reduce((acc, curr) => acc + curr.other_fee, 0);
        
        csvContent += `${idx + 1},`;
        csvContent += `"${item.code}",`;
        csvContent += `"${new Date(item.created_at).toLocaleDateString('id-ID')}",`;
        csvContent += `"${item.person?.name || '-'}",`;
        csvContent += `${qty},`;
        csvContent += `${harga},`;
        csvContent += `${biayaBbn},`;
        csvContent += `${biayaEkspedisi},`;
        csvContent += `${biayaLain},`;
        csvContent += `${item.transaction_bruto_total}\n`;
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
      <div className="p-6 space-y-6 bg-white min-h-screen laporan-pembelian-page">
        <div className="no-print">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-none mb-2">Laporan Pembelian</h1>
          <p className="text-[15px] text-gray-500">Pantau semua transaksi pembelian</p>
        </div>

        {/* Filter Component */}
        <div className="no-print">
          <LaporanPembelianFilter
            activeTab={activeTab}
            startDate={startDate}
            endDate={endDate}
            onApplyFilters={applyFilters}
            onPrint={handlePrint}
            onDownload={exportToCSV}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
          {/* Tab triggers wrapped to look like pills */}
          <div className="flex mb-12 no-print">
            <TabsList className="flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-xl">
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
                  PT WAJIRA JAGRATARA MORINDO
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
    </DashboardLayout>
  );
}