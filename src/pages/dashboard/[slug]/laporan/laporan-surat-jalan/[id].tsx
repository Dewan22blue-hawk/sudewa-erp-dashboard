"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Search, Loader2, ArrowLeft, Download } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useExpeditionReportDetail } from '@/hooks/report/useExpeditionReport';

export default function LaporanSuratJalanDetailPage() {
  const router = useRouter();
  const { slug, id } = router.query;

  // Search and page state (kept for layout consistency)
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useState('10');

  // Fetch detail data
  const { data: detailData, isLoading, isError, error } = useExpeditionReportDetail(id as string);

  // Formatting helpers
  const formatIDR = (value?: number | null) => {
    if (value === null || value === undefined || value === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Back navigation handler
  const handleBack = () => {
    router.push(`/dashboard/${slug}/laporan/laporan-surat-jalan`);
  };

  const getRows = () => {
    if (!detailData) return [];

    const orderList = (detailData as any).order_list;
    if (!orderList) return [];

    const tarifs = orderList.tarifs;

    if (Array.isArray(tarifs) && tarifs.length > 0) {
      return tarifs.map((tarif: any, idx: number) => {
        const pivot = tarif.pivot || {};
        return {
          no: idx + 1,
          customer: orderList.customer?.name || '-',
          lokasi: pivot.delivery_destination || tarif.delivery_destination || orderList.do_delivery_destination || '-',
          loadingIn: tarif.loading_in || orderList.loading_in || '-',
          loadingOut: tarif.loading_out || orderList.loading_out || '-',
          ujDriver: pivot.uj_driver || tarif.uj_driver || orderList.uj_driver || 0,
          ujLainnya: pivot.other_fee || tarif.other_fee || orderList.uj_lainnya || orderList.other_fee || 0,
          invoice: pivot.bill_invoice || tarif.bill_invoice || orderList.bill_invoice || 0,
          invTambahan: pivot.additional_cost_fee || tarif.additional_cost_fee || orderList.inv_tambahan || orderList.additional_cost_fee || 0,
          ppn: pivot.ppn || tarif.ppn || orderList.ppn || 0,
          muatan: pivot.load_content || tarif.load_content || orderList.muatan || orderList.load_content || '-',
        };
      });
    }

    return [
      {
        no: 1,
        customer: orderList.customer?.name || '-',
        lokasi: orderList.do_delivery_destination || '-',
        loadingIn: orderList.loading_in || '-',
        loadingOut: orderList.loading_out || '-',
        ujDriver: orderList.uj_driver || 0,
        ujLainnya: orderList.uj_lainnya || orderList.other_fee || 0,
        invoice: orderList.bill_invoice || 0,
        invTambahan: orderList.inv_tambahan || orderList.additional_cost_fee || 0,
        ppn: orderList.ppn || 0,
        muatan: orderList.muatan || orderList.load_content || '-',
      }
    ];
  };

  const rows = getRows();

  // Search filtering
  const filteredRows = rows.filter((row: any) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      row.customer.toLowerCase().includes(term) ||
      row.lokasi.toLowerCase().includes(term) ||
      row.loadingIn.toLowerCase().includes(term) ||
      row.loadingOut.toLowerCase().includes(term) ||
      row.muatan.toLowerCase().includes(term)
    );
  });

  // Client-side CSV exporter
  const handleExport = () => {
    if (!filteredRows || filteredRows.length === 0) return;

    const headers = [
      'NO',
      'CUSTOMER',
      'LOKASI',
      'LOADING IN',
      'LOADING OUT',
      'UJ DRIVER',
      'UJ LAINNYA',
      'INVOICE',
      'INV TAMBAHAN',
      'PPN',
      'MUATAN'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredRows.map((row: any) => [
        row.no,
        `"${row.customer.replace(/"/g, '""')}"`,
        `"${row.lokasi.replace(/"/g, '""')}"`,
        `"${row.loadingIn.replace(/"/g, '""')}"`,
        `"${row.loadingOut.replace(/"/g, '""')}"`,
        row.ujDriver || 0,
        row.ujLainnya || 0,
        row.invoice || 0,
        row.invTambahan || 0,
        row.ppn || 0,
        `"${row.muatan.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `informasi_surat_jalan_${id || 'detail'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Informasi Surat Jalan</h1>
            <p className="text-sm text-muted-foreground">Informasi lengkap mengenai surat jalan</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Filters and Search Row */}
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
                <Select value={perPage} onValueChange={setPerPage}>
                  <SelectTrigger className="w-[80px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="10">10</SelectItem>
                    <SelectItem className="cursor-pointer" value="25">25</SelectItem>
                    <SelectItem className="cursor-pointer" value="50">50</SelectItem>
                    <SelectItem className="cursor-pointer" value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span>Page</span>
              </div>
            </div>

            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>

          {/* Data Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24 w-full bg-white rounded-xl border border-slate-200">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center py-20 w-full bg-white rounded-xl border border-red-100 text-center p-6">
              <p className="text-red-600 font-semibold mb-1">Gagal memuat rincian informasi surat jalan</p>
              <p className="text-sm text-slate-500">{(error as any)?.message || 'Terjadi kesalahan pada server backend'}</p>
            </div>
          ) : filteredRows.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">NO</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">CUSTOMER</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">LOKASI</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">LOADING IN</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">LOADING OUT</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">UJ DRIVER</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">UJ LAINNYA</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">INVOICE</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">INV TAMBAHAN</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">PPN</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-left whitespace-nowrap">MUATAN</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.map((row: any) => (
                        <TableRow key={row.no} className="border-slate-200 hover:bg-gray-50 transition-colors">
                          <TableCell className="text-center font-medium text-slate-500 text-sm">{row.no}</TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">
                            {row.customer}
                          </TableCell>
                          <TableCell className="text-slate-600 whitespace-nowrap text-sm">
                            {row.lokasi}
                          </TableCell>
                          <TableCell className="text-slate-600 whitespace-nowrap text-sm">
                            {row.loadingIn}
                          </TableCell>
                          <TableCell className="text-slate-600 whitespace-nowrap text-sm">
                            {row.loadingOut}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">
                            {formatIDR(row.ujDriver)}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">
                            {formatIDR(row.ujLainnya)}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">
                            {formatIDR(row.invoice)}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">
                            {formatIDR(row.invTambahan)}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">
                            {formatIDR(row.ppn)}
                          </TableCell>
                          <TableCell className="text-slate-600 whitespace-nowrap text-sm">
                            {row.muatan}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between no-print">
                <p className="text-sm text-slate-500">
                  Showing 1-{filteredRows.length} of {filteredRows.length} data
                </p>
                <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                    disabled={true}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 min-w-9 rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm"
                    disabled={true}
                  >
                    1
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                    disabled={true}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-12 text-center border border-slate-200 rounded-xl bg-white">
              <p className="text-slate-500 font-medium text-sm">Tidak ada data laporan ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
