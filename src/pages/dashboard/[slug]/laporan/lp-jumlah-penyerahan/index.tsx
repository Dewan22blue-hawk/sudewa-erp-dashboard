"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

  // Fetch report data
  const { data, pagination, isLoading, isError, error } = useJumlahPenyerahanReport({
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
    return format(date, 'dd/MM/yyyy');
  };

  const renderDocBadge = (label: string, isDelivered: boolean) => {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all",
          isDelivered
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
            : "bg-slate-50 text-slate-400 border-slate-200/80"
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", isDelivered ? "bg-emerald-500" : "bg-slate-300")} />
        {label}
      </span>
    );
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center no-print">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Laporan Jumlah Penyerahan</h1>
            <p className="text-sm text-slate-500">Laporan jumlah penyerahan dokumen ke customer</p>
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
          id="laporan-jumlah-penyerahan-print"
          className="laporan-penerimaan-print-area"
          letterheadSrc={selectedPrintBackground}
        >
          <div className="laporan-penerimaan-print-content print-letter-content">
            {/* Cover Letter Heading - Visible only in Print */}
            <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
              <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                Laporan Jumlah Penyerahan
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
              <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                        <TableHead onClick={() => handleSort('stnk_name')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          NAMA STNK <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                        </TableHead>
                        <TableHead onClick={() => handleSort('region')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          WILAYAH <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                        </TableHead>
                        <TableHead onClick={() => handleSort('dealer')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          DEALER <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                        </TableHead>
                        <TableHead onClick={() => handleSort('vendor')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          VENDOR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                        </TableHead>
                        <TableHead onClick={() => handleSort('tnkb_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          NO POLISI <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          JENIS
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          NO RANGKA
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          NO MESIN
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          TGL DAFTAR
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          TGL TERIMA STNK
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          TGL TERIMA BPKB
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          STATUS PENYERAHAN
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                          TGL PENYERAHAN
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.length > 0 ? (
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

                          return (
                            <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50">
                              <TableCell className="text-center font-medium text-slate-500">{indexNumber}</TableCell>
                              <TableCell className="font-semibold text-slate-800 whitespace-nowrap">{stnkName}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{region}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{dealer}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{vendor}</TableCell>
                              <TableCell className="font-medium text-slate-800 whitespace-nowrap">{item.tnkb_number || '-'}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{formatVehicleType(vehicleType)}</TableCell>
                              <TableCell className="text-slate-600 font-mono text-[13px] whitespace-nowrap">{chassisNumber}</TableCell>
                              <TableCell className="text-slate-600 font-mono text-[13px] whitespace-nowrap">{machineNumber}</TableCell>
                              
                              {/* Dates rendering */}
                              <TableCell className="text-slate-600 whitespace-nowrap">{tglDaftar}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{formatDateString(item.stnk_received_date)}</TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{formatDateString(item.bpkb_received_date)}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {renderDocBadge('STNK', Boolean(item.customer_delivery_date && item.stnk_received_date))}
                                  {renderDocBadge('TNKB', Boolean(item.customer_delivery_date && item.tnkb_received_date))}
                                  {renderDocBadge('SKPD', Boolean(item.customer_delivery_date && item.skpd_received_date))}
                                  {renderDocBadge('BPKB', Boolean(item.customer_delivery_date && item.bpkb_received_date))}
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-600 whitespace-nowrap">{formatDateString(item.customer_delivery_date)}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={14} className="h-28 text-center text-slate-500 font-medium">
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
