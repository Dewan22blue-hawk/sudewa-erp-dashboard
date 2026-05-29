import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DateRange } from 'react-day-picker';
import AssetReportFilters from '@/components/features/laporan-aset/AssetReportFilters';
import AssetReportTable from '@/components/features/laporan-aset/AssetReportTable';
import AssetReportPagination from '@/components/features/laporan-aset/AssetReportPagination';
import Head from 'next/head';
import { useFinanceAssets, useExportFinanceAsset } from '@/hooks/useFinanceAsset';
import { useCompany } from '@/contexts/CompanyContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';

export default function LaporanAsetPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [perPage, setPerPage] = useState('50');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const perPageNumber = parseInt(perPage, 10);

  const { data, isLoading, isError } = useFinanceAssets(companyId, {
    page: currentPage,
    perPage: perPageNumber,
    search: searchQuery || undefined,
  });

  const exportMutation = useExportFinanceAsset();

  const paginatedData = data?.data || [];
  const paginationMeta = data?.meta || { lastPage: 1, total: 0 };
  const totalPages = paginationMeta.lastPage;
  const totalData = paginationMeta.total;

  // Handle side effects of changing perPage (reset current page if out of bounds)
  const handlePerPageChange = (newPerPage: string) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.promise(exportMutation.mutateAsync(), {
      loading: 'Menyiapkan file download...',
      success: 'File berhasil didownload',
      error: 'Gagal mendownload file'
    });
  };

  const slugParam = router.query.slug;
  const resolvedCompanyId = resolveCompanyId(slugParam, companyId);
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  return (
    <>
      <Head>
        <title>Laporan Aset | Wajira Panel</title>
      </Head>
      <DashboardLayout>
        <div className="p-6 md:p-8 space-y-6 bg-white min-h-screen laporan-aset-page">
          <div className="no-print">
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-none mb-2">Laporan Aset</h1>
            <p className="text-[15px] text-gray-500">Laporan detail aset yang dipunyai</p>
          </div>

          <div className="no-print">
            <AssetReportFilters
              dateRange={dateRange}
              setDateRange={setDateRange}
              perPage={perPage}
              setPerPage={handlePerPageChange}
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              onPrint={handlePrint}
              onDownload={handleDownload}
            />
          </div>

          {isLoading ? (
            <div className="w-full flex items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm mt-6 no-print">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : isError ? (
            <div className="w-full flex items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm mt-6 text-red-500 no-print">
              Gagal memuat data laporan aset.
            </div>
          ) : (
            <>
              <PrintLetterPage
                id="laporan-aset-print"
                className="laporan-aset-print-area mt-6"
                letterheadSrc={selectedPrintBackground}
              >
                <div className="laporan-aset-print-content print:px-10">
                  <div className="flex flex-col items-center justify-center text-center space-y-1 mb-8 print:block hidden">
                    <h2 className="text-[13px] font-bold uppercase text-gray-900 tracking-wide">
                      LAPORAN ASET
                    </h2>
                    <p className="text-[13px] font-bold text-gray-900 tracking-wide">
                      PT WAJIRA JAGRATARA MORINDO
                    </p>
                  </div>
                  <AssetReportTable data={paginatedData} />
                </div>
              </PrintLetterPage>

              {/* Pagination */}
              <div className="no-print mt-6">
                <AssetReportPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalData={totalData}
                  perPage={perPageNumber}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
