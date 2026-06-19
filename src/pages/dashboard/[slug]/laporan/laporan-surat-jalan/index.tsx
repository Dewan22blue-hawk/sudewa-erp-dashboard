"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown, MoreVertical, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useExpeditionReport } from '@/hooks/report/useExpeditionReport';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export default function LaporanSuratJalanPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  const resolvedCompanyId = resolveCompanyId(slugParam, companyId) || 4; // Transindo defaults to 4
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  // States
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(25);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [orderBy, setOrderBy] = useState<string>('created_at');
  const [orderSort, setOrderSort] = useState<'asc' | 'desc'>('desc');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch report data
  const { data, pagination, isLoading, isError, error } = useExpeditionReport({
    page,
    perPage,
    search: debouncedSearch,
    orderBy,
    orderSort,
  });

  const visiblePages = getVisiblePageNumbers(pagination.lastPage, page, 5);

  // Formatting helpers
  const formatDateString = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, 'dd/MM/yyyy');
  };

  // Sorting handler
  const handleSort = (field: string) => {
    if (orderBy === field) {
      setOrderSort(orderSort === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrderSort('desc');
    }
    setPage(1);
  };

  // Print triggering handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 px-1">
        {/* Header Section */}
        <div className="flex justify-between items-start no-print">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Laporan Surat Jalan</h1>
            <p className="text-sm text-slate-500 mt-1">Laporan data surat jalan ekspedisi</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="gap-2 rounded-xl px-4 py-2 border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm">
            <Printer className="h-4.5 w-4.5 text-slate-700" /> Print
          </Button>
        </div>

        {/* Filtering Block (Search and Show Page dropdown) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between no-print mb-5">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search here"
                className="pl-9 bg-white rounded-xl border-slate-200 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }}>
                <SelectTrigger className="w-[80px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="5">5</SelectItem>
                  <SelectItem className="cursor-pointer" value="10">10</SelectItem>
                  <SelectItem className="cursor-pointer" value="25">25</SelectItem>
                  <SelectItem className="cursor-pointer" value="50">50</SelectItem>
                  <SelectItem className="cursor-pointer" value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>
        </div>

        {/* Print Letter Wrapping Container */}
        <PrintLetterPage
          id="laporan-surat-jalan-print"
          className="laporan-penerimaan-print-area"
          letterheadSrc={selectedPrintBackground}
        >
          <div className="laporan-penerimaan-print-content print-letter-content">
            {/* Cover Letter Heading - Visible only in Print */}
            <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
              <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                Laporan Surat Jalan
              </h2>
              <p className="text-[15px] font-bold text-gray-900 tracking-wide">
                PT WAJIRA TRANSINDO
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
              <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                        <TableHead onClick={() => handleSort('code')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          KODE SURAT JALAN <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">KODE ORDER</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">TANGGAL</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">CUSTOMER</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">NO POLISI</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">TIPE ARMADA</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">DRIVER</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">LOADING IN</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">LOADING OUT</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">TUJUAN KIRIM</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">STATUS PRINT</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap text-center no-print">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.length > 0 ? (
                        data.map((item, idx) => {
                          const indexNumber = idx + 1 + (page - 1) * perPage;

                          const code = item.code || '-';
                          const orderCode = item.order_list?.code || '-';
                          const dateStr = formatDateString(item.date);
                          const customerName = item.order_list?.customer?.name || '-';
                          const registrationNumber = item.vehicle?.registration_number || '-';
                          const vehicleType = item.vehicle?.type || item.order_list?.vehicle_type || '-';
                          const driverName = item.driver?.name || '-';
                          const loadingIn = item.order_list?.loading_in || '-';
                          const loadingOut = item.order_list?.loading_out || '-';
                          const destination = item.order_list?.do_delivery_destination || '-';

                          return (
                            <TableRow key={item.uuid || idx} className="border-slate-100 hover:bg-slate-50/50">
                              <TableCell className="text-center font-medium text-slate-500">{indexNumber}</TableCell>
                              <TableCell className="font-mono text-[13px] text-slate-700 whitespace-nowrap">{code}</TableCell>
                              <TableCell className="font-mono text-[13px] text-slate-600 whitespace-nowrap">{orderCode}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{dateStr}</TableCell>
                              <TableCell className="font-semibold text-slate-800 whitespace-nowrap">{customerName}</TableCell>
                              <TableCell className="font-mono text-[13px] text-slate-600 whitespace-nowrap">{registrationNumber}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{vehicleType}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{driverName}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{loadingIn}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{loadingOut}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{destination}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {item.is_printed === true ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                    <CheckCircle2 className="h-3 w-3" /> Sudah Print
                                  </span>
                                ) : item.is_printed === false ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    <XCircle className="h-3 w-3" /> Belum Print
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell className="text-center no-print">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                      <MoreVertical className="h-4 w-4 text-slate-500" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[140px]">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        router.push(`/dashboard/${slugParam}/laporan/laporan-surat-jalan/${item.id}`);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      Detail
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={13} className="h-28 text-center text-slate-500 font-medium">
                            Tidak ada data laporan ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </PrintLetterPage>

        {/* Pagination Footer */}
        {!isLoading && !isError && pagination.total > 0 && (
          <div className="flex flex-col gap-4 px-1 py-4 md:flex-row md:items-center md:justify-between no-print">
            <div className="text-sm text-slate-500">
              Showing {pagination.from}-{pagination.to} of {pagination.total} data
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] cursor-pointer"
              >
                Previous
              </Button>
              {visiblePages[0] > 1 && <span className="px-1.5 text-slate-400">...</span>}
              {visiblePages.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === page ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(pageNumber)}
                  className={cn(
                    "h-9 min-w-9 rounded-xl border-slate-200 text-[13px] font-semibold cursor-pointer",
                    pageNumber === page
                      ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200 hover:bg-slate-50"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {pageNumber}
                </Button>
              ))}
              {visiblePages[visiblePages.length - 1] < pagination.lastPage && <span className="px-1.5 text-slate-400">...</span>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.lastPage}
                className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
