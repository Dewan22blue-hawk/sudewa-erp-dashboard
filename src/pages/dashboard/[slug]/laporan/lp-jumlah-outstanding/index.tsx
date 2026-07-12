"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';


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

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: 'asc' | 'desc' }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3.5 w-3.5 text-indigo-600 shrink-0 transition-colors ml-1 inline-block" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3.5 w-3.5 text-indigo-600 shrink-0 transition-colors ml-1 inline-block" />;
  return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150 ml-1 inline-block" />;
}

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
        <div className="no-print">
          <h1 className="text-2xl font-semibold">Laporan Jumlah Outstanding</h1>
          <p className="text-sm text-muted-foreground">Laporan jumlah data outstanding dokumen kendaraan</p>
        </div>

        {/* Search + Print row */}
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
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs Navigation */}
          <div className="flex mb-4 no-print">
            <TabsList className="flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-xl">
              <TabsTrigger
                value="bpkb"
                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Outstanding BPKB
              </TabsTrigger>
              <TabsTrigger
                value="stnk"
                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Outstanding STNK
              </TabsTrigger>
              <TabsTrigger
                value="skpd"
                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Outstanding SKPD
              </TabsTrigger>
              <TabsTrigger
                value="tnkb"
                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Outstanding TNKB
              </TabsTrigger>
            </TabsList>
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

              {/* Table Rendering (static header, dynamic body) */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none w-full">
                <div className="overflow-x-auto">
                  <Table>
                      <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow className="hover:bg-[#f8f9fa]">
                          <TableHead className="w-12 px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
                          <TableHead
                            onClick={() => handleSort('stnk_name')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'stnk_name' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>{activeTab === 'bpkb' ? 'NAMA BPKB' : 'NAMA STNK'}</span>
                              <SortIcon sortKey="stnk_name" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('region')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'region' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>WILAYAH</span>
                              <SortIcon sortKey="region" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('dealer')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'dealer' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>DEALER</span>
                              <SortIcon sortKey="dealer" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('vendor')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'vendor' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>VENDOR</span>
                              <SortIcon sortKey="vendor" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('tnkb_number')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'tnkb_number' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>NO POLISI</span>
                              <SortIcon sortKey="tnkb_number" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">
                            JENIS
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">
                            NO RANGKA
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">
                            NO MESIN
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-center">
                            STATUS
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">
                            KETERANGAN
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={11} className="h-32 text-center">
                              <div className="flex items-center justify-center gap-2 text-slate-400">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">Memuat data...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : isError ? (
                          <TableRow>
                            <TableCell colSpan={11} className="h-32 text-center text-red-600 font-semibold p-4">
                              <p className="mb-0.5">Gagal memuat data laporan</p>
                              <p className="text-xs text-slate-500 font-normal">{(error as any)?.message || 'Terjadi kesalahan pada server backend'}</p>
                            </TableCell>
                          </TableRow>
                        ) : data.length > 0 ? (
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
                                <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-500">{indexNumber}</TableCell>
                                <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap text-left">{stnkName}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap text-left">{region}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap text-left">{dealer}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap text-left">{vendor}</TableCell>
                                <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap text-left">{item.tnkb_number || '-'}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap text-left">{formatVehicleType(vehicleType)}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-slate-600 font-mono whitespace-nowrap text-left">{chassisNumber}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-slate-600 font-mono whitespace-nowrap text-left">{machineNumber}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-center whitespace-nowrap">{renderOutstandingStatusBadge(statusText)}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap text-left">{keterangan}</TableCell>
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
