"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Search, Printer, Loader2, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useJumlahPenyerahanReport } from '@/hooks/report/useJumlahPenyerahanReport';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export default function LPJumlahPenyerahanPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  const resolvedCompanyId = resolveCompanyId(slugParam, companyId);
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  // States
  const [activeTab, setActiveTab] = useState<'bpkb' | 'stnk' | 'skpd' | 'tnkb'>('stnk');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(25);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page, search and sorting when tab changes
  const handleTabChange = (val: string) => {
    setActiveTab(val as 'bpkb' | 'stnk' | 'skpd' | 'tnkb');
    setPage(1);
    setSearchTerm('');
    setDebouncedSearch('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  // Fetch report data
  const { data, pagination, isLoading, isError, error } = useJumlahPenyerahanReport({
    activeTab,
    page,
    perPage,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const visiblePages = getVisiblePageNumbers(pagination.lastPage, page, 5);

  const formatVehicleType = (type?: string | null) => {
    if (!type) return '-';
    const t = type.toLowerCase().trim();
    if (t === 'r2') return 'Roda Dua';
    if (t === 'r3') return 'Roda Tiga';
    if (t === 'r4') return 'Roda Empat';
    return type;
  };

  const formatDateString = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, 'dd MMMM yyyy', { locale: id });
  };

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Print triggering handler
  const handlePrint = () => {
    window.print();
  };

  const renderPagination = () => {
    const showLastPage = pagination.lastPage > 5 && !visiblePages.includes(pagination.lastPage);

    return (
      <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
          disabled={page <= 1 || isLoading}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        {visiblePages.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant="ghost"
            size="sm"
            className={cn(
              'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
              pageNumber === page
                ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
            )}
            disabled={isLoading}
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        {showLastPage && <span className="px-1 text-slate-500">...</span>}
        {showLastPage && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 min-w-9 rounded-xl border border-transparent bg-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white"
            disabled={isLoading}
            onClick={() => setPage(pagination.lastPage)}
          >
            {pagination.lastPage}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
          disabled={page >= pagination.lastPage || pagination.total === 0 || isLoading}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Laporan Jumlah Penyerahan - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-2xl font-semibold">Laporan Jumlah Penyerahan</h1>
            <p className="text-sm text-muted-foreground">Laporan jumlah penyerahan dokumen ke customer</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>

        {/* Tabs Wrapper */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          {/* Tab triggers wrapped to look like pills */}
          <div className="flex no-print">
            <TabsList className="flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-xl">
              <TabsTrigger value="stnk" className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer">
                LP Jumlah Penyerahan STNK
              </TabsTrigger>
              <TabsTrigger value="bpkb" className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer">
                LP Jumlah Penyerahan BPKB
              </TabsTrigger>
              <TabsTrigger value="skpd" className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer">
                LP Jumlah Penyerahan SKPD
              </TabsTrigger>
              <TabsTrigger value="tnkb" className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer">
                LP Jumlah Penyerahan TNKB
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-4">
            {/* Filtering Block (Search and Show Page dropdown) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search here"
                    className="pl-9 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                  <span>Show</span>
                  <Select value={String(perPage)} onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }}>
                    <SelectTrigger className="w-[70px] bg-white">
                      <SelectValue placeholder="25" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>Page</span>
                </div>
              </div>
            </div>

            {/* Print Letter Wrapping Container */}
            <PrintLetterPage
              id="laporan-jumlah-penyerahan-print"
              className="laporan-penerimaan-print-area"
              letterheadSrc={selectedPrintBackground}
            >
              <div className="laporan-penerimaan-print-content print-letter-content">
                {/* Cover Letter Heading - Visible only in Print */}
                <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
                  <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                    Laporan Jumlah Penyerahan {activeTab.toUpperCase()}
                  </h2>
                  <p className="text-[15px] font-bold text-gray-900 tracking-wide">
                    PT WAJIRA YANOTAMA
                  </p>
                  <p className="text-[12px] text-gray-600">
                    Tanggal Cetak: {formatDate(new Date())}
                  </p>
                </div>

                {/* Table Rendering */}
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow className="hover:bg-[#f8f9fa]">
                          <TableHead className="w-12 px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
                          <TableHead onClick={() => handleSort('stnk_name')} className="cursor-pointer select-none px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            {activeTab === 'bpkb' ? 'NAMA BPKB' : 'NAMA STNK'} <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead onClick={() => handleSort('region')} className="cursor-pointer select-none px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            WILAYAH <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead onClick={() => handleSort('dealer')} className="cursor-pointer select-none px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            DEALER <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead onClick={() => handleSort('vendor')} className="cursor-pointer select-none px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            VENDOR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead onClick={() => handleSort('tnkb_number')} className="cursor-pointer select-none px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            NO POLISI <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            JENIS
                          </TableHead>
                          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            NO RANGKA
                          </TableHead>
                          <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            NO MESIN
                          </TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            TGL DAFTAR
                          </TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            {activeTab === 'stnk' && 'TGL TERIMA STNK'}
                            {activeTab === 'bpkb' && 'TGL TERIMA BPKB'}
                            {activeTab === 'skpd' && 'TGL TERIMA SKPD'}
                            {activeTab === 'tnkb' && 'TGL TERIMA TNKB'}
                          </TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            TGL PENYERAHAN
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={12} className="h-32 text-center">
                              <div className="flex items-center justify-center gap-2 text-slate-400">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">Memuat data...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : isError ? (
                          <TableRow>
                            <TableCell colSpan={12} className="h-32 text-center text-red-600 font-semibold p-4">
                              <p className="mb-0.5">Gagal memuat data laporan</p>
                              <p className="text-xs text-slate-500 font-normal">{(error as any)?.message || 'Terjadi kesalahan pada server backend'}</p>
                            </TableCell>
                          </TableRow>
                        ) : data.length > 0 ? (
                          data.map((item, idx) => {
                            const indexNumber = idx + 1 + (page - 1) * perPage;

                            // Determine STNK Name
                            const stnkName = item.stnk_name || item.vehicle_data?.stnk_name || '-';
                            // Determine Region
                            const region = item.region || item.vehicle_data?.region?.name || '-';
                            // Determine Dealer
                            const dealer = item.dealer || item.vehicle_data?.dealer?.name || '-';

                            // Determine Vendor
                            let vendor = '-';
                            if (item.vendor) {
                              if (typeof item.vendor === 'string') {
                                vendor = item.vendor;
                              } else {
                                vendor = item.vendor.name || '-';
                              }
                            }

                            // Determine Vehicle Type/Jenis
                            const vehicleType = item.vehicle_type || item.vehicle_data?.motorcycle_type || '-';
                            // Determine Chassis Number
                            const chassisNumber = item.chassis_number || item.vehicle_data?.chassis_number || '-';
                            // Determine Machine Number
                            const machineNumber = item.machine_number || item.vehicle_data?.machine_number || '-';

                            // Determine TGL DAFTAR field
                            const tglDaftar = formatDateString(item.process_date || item.stnk_registration_date || item.bpkb_registration_date);

                            // Determine TGL TERIMA field dynamically
                            let tglTerimaValue = '-';
                            if (activeTab === 'stnk') {
                              tglTerimaValue = formatDateString(item.stnk_received_date);
                            } else if (activeTab === 'bpkb') {
                              tglTerimaValue = formatDateString(item.bpkb_received_date);
                            } else if (activeTab === 'skpd') {
                              tglTerimaValue = formatDateString(item.skpd_received_date);
                            } else if (activeTab === 'tnkb') {
                              tglTerimaValue = formatDateString(item.tnkb_received_date);
                            }

                            return (
                              <TableRow key={item.id} className="border-slate-200 hover:bg-gray-50 transition-colors">
                                <TableCell className="px-4 py-4 text-center font-medium text-slate-500 text-sm">{indexNumber}</TableCell>
                                <TableCell className="px-4 py-4 text-left font-semibold text-gray-900 whitespace-nowrap text-sm">{stnkName}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-slate-600 whitespace-nowrap text-sm">{region}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-slate-600 whitespace-nowrap text-sm">{dealer}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-slate-600 whitespace-nowrap text-sm">{vendor}</TableCell>
                                <TableCell className="px-4 py-4 text-left font-medium text-gray-900 whitespace-nowrap text-sm">{item.tnkb_number || '-'}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-slate-600 whitespace-nowrap text-sm">{formatVehicleType(vehicleType)}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-slate-600 font-mono text-xs whitespace-nowrap">{chassisNumber}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-slate-600 font-mono text-xs whitespace-nowrap">{machineNumber}</TableCell>

                                {/* Dates rendering */}
                                <TableCell className="px-4 py-4 text-center text-slate-600 whitespace-nowrap text-sm">{tglDaftar}</TableCell>
                                <TableCell className="px-4 py-4 text-center text-slate-600 whitespace-nowrap text-sm">{tglTerimaValue}</TableCell>
                                <TableCell className="px-4 py-4 text-center text-slate-600 whitespace-nowrap text-sm">{formatDateString(item.customer_delivery_date)}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={12} className="h-28 text-center text-slate-500 font-medium">
                              Tidak ada data laporan ditemukan.
                              </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </PrintLetterPage>

            {/* Pagination Footer */}
            {!isLoading && !isError && pagination.total > 0 && (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between no-print">
                <p className="text-sm text-slate-500">
                  Showing {pagination.from}-{pagination.to} of {pagination.total} data
                </p>
                {renderPagination()}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
