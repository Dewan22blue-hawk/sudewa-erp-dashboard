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
        return {
          no: idx + 1,
          customer: orderList.customer?.name || '-',
          lokasi: tarif.delivery_destination || orderList.do_delivery_destination || '-',
          loadingIn: tarif.loading_in || orderList.loading_in || '-',
          loadingOut: tarif.loading_out || orderList.loading_out || '-',
          ujDriver: tarif.uj_driver || orderList.uj_driver || 0,
          ujLainnya: tarif.other_fee || orderList.uj_lainnya || orderList.other_fee || 0,
          invoice: tarif.bill_invoice || orderList.bill_invoice || 0,
          invTambahan: tarif.additional_cost_fee || orderList.inv_tambahan || orderList.additional_cost_fee || 0,
          ppn: tarif.ppn || orderList.ppn || 0,
          muatan: tarif.load_content || orderList.muatan || orderList.load_content || '-',
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
      <div className="p-6 space-y-6 bg-white min-h-screen">
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
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-none mb-2">Informasi Surat Jalan</h1>
            <p className="text-[15px] text-gray-500">Informasi lengkap mengenai surat jalan</p>
          </div>
        </div>

        {/* Filters and Search Row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search here"
                className="h-11 rounded-xl border-slate-200 bg-white pl-11 shadow-sm focus-visible:ring-1"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span>Show</span>
              <Select value={perPage} onValueChange={setPerPage}>
                <SelectTrigger className="h-11 w-[90px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
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
            className="gap-2 rounded-xl h-11 px-4 border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm text-slate-700"
          >
            <Download className="h-4 w-4" /> Export
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
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm w-full">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">CUSTOMER</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">LOKASI</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">LOADING IN</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">LOADING OUT</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">UJ DRIVER</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">UJ LAINNYA</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">INVOICE</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">INV TAMBAHAN</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">PPN</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">MUATAN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row: any) => (
                      <TableRow key={row.no} className="border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="text-center font-medium text-slate-500">{row.no}</TableCell>
                        <TableCell className="font-semibold text-slate-800 whitespace-nowrap">
                          {row.customer}
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">
                          {row.lokasi}
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">
                          {row.loadingIn}
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">
                          {row.loadingOut}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700 whitespace-nowrap">
                          {formatIDR(row.ujDriver)}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700 whitespace-nowrap">
                          {formatIDR(row.ujLainnya)}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700 whitespace-nowrap">
                          {formatIDR(row.invoice)}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700 whitespace-nowrap">
                          {formatIDR(row.invTambahan)}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700 whitespace-nowrap">
                          {formatIDR(row.ppn)}
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">
                          {row.muatan}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Pagination Footer */}
            <div className="flex flex-col gap-4 px-1 py-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-500">
                Showing 1-{filteredRows.length} of {filteredRows.length} data
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={true}
                  className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] text-slate-400"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                  className="h-9 min-w-9 rounded-xl border-slate-200 text-[13px] font-semibold bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                >
                  1
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={true}
                  className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] text-slate-400"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center py-12 text-center border border-slate-200 rounded-xl">
            <p className="text-slate-500 font-medium">Tidak ada data laporan ditemukan.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
