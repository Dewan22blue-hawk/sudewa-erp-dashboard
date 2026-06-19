"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown } from 'lucide-react';


import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useJumlahOutstandingReport } from '@/hooks/report/useJumlahOutstandingReport';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';
import { OutstandingReportItem } from '@/services/report/jumlahOutstandingReport.service';

export default function LPJumlahOutstandingPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  const resolvedCompanyId = resolveCompanyId(slugParam, companyId);
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  // States
  const [activeTab, setActiveTab] = useState<'bpkb' | 'stnk' | 'skpd' | 'tnkb'>('bpkb');
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

  // Reset page when tab changes
  const handleTabChange = (val: string) => {
    setActiveTab(val as 'bpkb' | 'stnk' | 'skpd' | 'tnkb');
    setPage(1);
  };

  // Fetch report data
  const { data, pagination, isLoading, isError, error } = useJumlahOutstandingReport({
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

  // Helpers for Outstanding Status & Keterangan
  const getOutstandingStatus = (
    type: 'bpkb' | 'stnk' | 'skpd' | 'tnkb',
    item: OutstandingReportItem
  ) => {
    let status: boolean | null = null;
    if (type === 'bpkb') status = item.bpkb_physical_status;
    else if (type === 'stnk') status = item.stnk_physical_status;
    else if (type === 'skpd') status = item.skpd_physical_status;
    else if (type === 'tnkb') status = item.tnkb_physical_status;

    if (status === true) return 'Sudah Diterima';
    if (status === false) return 'Outstanding / Belum Diterima';
    return '-';
  };

  const getOutstandingKeterangan = (
    type: 'bpkb' | 'stnk' | 'skpd' | 'tnkb',
    item: OutstandingReportItem
  ) => {
    const parts: string[] = [];

    if (type === 'bpkb') {
      if (item.bpkb_physical_status === false || !item.bpkb_received_date) {
        parts.push('BPKB belum diterima.');
      }
      if (!item.bpkb_number) {
        parts.push('Nomor BPKB belum tersedia.');
      }
    } else if (type === 'stnk') {
      if (item.stnk_physical_status === false || !item.stnk_received_date) {
        parts.push('STNK belum diterima.');
      }
    } else if (type === 'skpd') {
      if (item.skpd_physical_status === false || !item.skpd_received_date) {
        parts.push('SKPD belum diterima.');
      }
    } else if (type === 'tnkb') {
      if (item.tnkb_physical_status === false || !item.tnkb_received_date) {
        parts.push('TNKB belum diterima.');
      }
      if (!item.tnkb_number) {
        parts.push('Nomor TNKB belum tersedia.');
      }
    }

    const allComplete =
      item.bpkb_physical_status === true &&
      item.stnk_physical_status === true &&
      item.skpd_physical_status === true &&
      item.tnkb_physical_status === true &&
      Boolean(item.bpkb_number) &&
      Boolean(item.tnkb_number);

    if (allComplete) {
      return 'Dokumen sudah lengkap.';
    }

    return parts.join(' ') || '-';
  };

  const renderOutstandingStatusBadge = (statusText: string) => {
    if (statusText === 'Sudah Diterima') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          Sudah Diterima
        </span>
      );
    }
    if (statusText === 'Outstanding / Belum Diterima') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
          Outstanding / Belum Diterima
        </span>
      );
    }
    return <span className="text-slate-400">-</span>;
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

  // Print Header Title based on active tab
  const getPrintTitle = () => {
    if (activeTab === 'bpkb') return 'LP Jumlah Outstanding BPKB';
    if (activeTab === 'stnk') return 'LP Jumlah Outstanding STNK';
    if (activeTab === 'skpd') return 'LP Jumlah Outstanding SKPD';
    return 'LP Jumlah Outstanding TNKB';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-2xl font-semibold">Laporan Jumlah Outstanding</h1>
            <p className="text-sm text-muted-foreground">Laporan jumlah data outstanding dokumen kendaraan</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs Navigation */}
          <div className="flex mb-6 no-print">
            <TabsList className="flex h-auto p-1 bg-slate-100 border border-slate-200/60 rounded-xl">
              <TabsTrigger
                value="bpkb"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Outstanding BPKB
              </TabsTrigger>
              <TabsTrigger
                value="stnk"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Outstanding STNK
              </TabsTrigger>
              <TabsTrigger
                value="skpd"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Outstanding SKPD
              </TabsTrigger>
              <TabsTrigger
                value="tnkb"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Outstanding TNKB
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filtering Block (Search and Show Page dropdown) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between no-print">
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
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
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
            id="laporan-jumlah-outstanding-print"
            className="laporan-penerimaan-print-area"
            letterheadSrc={selectedPrintBackground}
          >
            <div className="laporan-penerimaan-print-content print-letter-content">
              {/* Cover Letter Heading - Visible only in Print */}
              <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
                <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                  {getPrintTitle()}
                </h2>
                <p className="text-[15px] font-bold text-gray-900 tracking-wide">
                  PT WAJIRA YANOTAMA
                </p>
                <p className="text-[12px] text-gray-600">
                  Tanggal Cetak: {formatDate(new Date())}
                </p>
              </div>

              {/* Loader and Table Rendering */}
              {isLoading ? (
                <div className="flex justify-center items-center py-24 w-full bg-white rounded-xl border border-slate-200">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : isError ? (
                <div className="flex flex-col justify-center items-center py-20 w-full bg-white rounded-xl border border-red-100 text-center p-6">
                  <p className="text-red-600 font-semibold mb-1">Gagal memuat data laporan</p>
                  <p className="text-sm text-slate-500">{(error as any)?.message || 'Terjadi kesalahan pada server backend'}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
                          <TableHead onClick={() => handleSort('stnk_name')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            {activeTab === 'bpkb' ? 'NAMA BPKB' : 'NAMA STNK'} <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead onClick={() => handleSort('region')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            WILAYAH <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead onClick={() => handleSort('dealer')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            DEALER <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead onClick={() => handleSort('vendor')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            VENDOR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead onClick={() => handleSort('tnkb_number')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            NO POLISI <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            JENIS
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            NO RANGKA
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            NO MESIN
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            STATUS
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            KETERANGAN
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length > 0 ? (
                          data.map((item, idx) => {
                            const indexNumber = idx + 1 + (page - 1) * perPage;
                            
                            // Determine Names & Fallbacks
                            const stnkName = item.stnk_name || item.vehicle_data?.stnk_name || '-';
                            const region = item.region || item.vehicle_data?.regency || item.vehicle_data?.region?.name || '-';
                            const dealer = item.dealer || item.vehicle_data?.dealer?.name || '-';
                            
                            let vendor = '-';
                            if (item.vendor) {
                              if (typeof item.vendor === 'string') {
                                vendor = item.vendor;
                              } else {
                                vendor = item.vendor.name || '-';
                              }
                            }

                            const vehicleType = item.vehicle_type || item.vehicle_data?.motorcycle_type || '-';
                            const chassisNumber = item.chassis_number || item.vehicle_data?.chassis_number || '-';
                            const machineNumber = item.machine_number || item.vehicle_data?.machine_number || '-';

                            // Determine status and description
                            const statusText = getOutstandingStatus(activeTab, item);
                            const keterangan = getOutstandingKeterangan(activeTab, item);

                            return (
                              <TableRow key={item.id} className="border-slate-200 hover:bg-gray-50 transition-colors">
                                <TableCell className="text-center font-medium text-slate-500 text-sm">{indexNumber}</TableCell>
                                <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">{stnkName}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{region}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{dealer}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{vendor}</TableCell>
                                <TableCell className="font-medium text-gray-900 whitespace-nowrap text-sm">{item.tnkb_number || '-'}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{formatVehicleType(vehicleType)}</TableCell>
                                <TableCell className="text-slate-600 font-mono text-sm whitespace-nowrap">{chassisNumber}</TableCell>
                                <TableCell className="text-slate-600 font-mono text-sm whitespace-nowrap">{machineNumber}</TableCell>
                                <TableCell className="whitespace-nowrap text-sm">{renderOutstandingStatusBadge(statusText)}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{keterangan}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={11} className="h-28 text-center text-slate-500 font-medium">
                              Tidak ada data laporan ditemukan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </PrintLetterPage>

          {/* Pagination Footer */}
          {!isLoading && !isError && pagination.total > 0 && (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between no-print">
              <p className="text-sm text-slate-500">
                Showing {pagination.from}-{pagination.to} of {pagination.total} data
              </p>
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
                {pagination.lastPage > 5 && !visiblePages.includes(pagination.lastPage) && (
                  <>
                    <span className="px-1 text-slate-500">...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 min-w-9 rounded-xl border border-transparent bg-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white"
                      disabled={isLoading}
                      onClick={() => setPage(pagination.lastPage)}
                    >
                      {pagination.lastPage}
                    </Button>
                  </>
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
            </div>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
