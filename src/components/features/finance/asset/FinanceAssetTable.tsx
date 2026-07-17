import React from 'react';
import { Search, MoreVertical, Download, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { FinanceAsset } from '@/@types/finance-asset.types';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

interface FinanceAssetTableProps {
    assets: FinanceAsset[];
    search: string;
    onSearchChange: (value: string) => void;
    page: number;
    perPage: number;
    totalData: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onExport: () => void;
    isExporting?: boolean;
    onEdit: (asset: FinanceAsset) => void;
    onDelete: (asset: FinanceAsset) => void;
    onDetail?: (asset: FinanceAsset) => void;
    isLoading?: boolean;
}

export function FinanceAssetTable({
    assets,
    search,
    onSearchChange,
    page,
    perPage,
    totalData,
    onPageChange,
    onPerPageChange,
    onExport,
    isExporting = false,
    onEdit,
    onDelete,
    onDetail,
    isLoading = false,
}: FinanceAssetTableProps) {
    const totalPages = Math.ceil(totalData / perPage);

    return (
        <Card className="p-0 border-none shadow-none bg-transparent space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search here"
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                        <span>Show</span>
                        <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                            <SelectTrigger className="w-[70px] bg-white cursor-pointer">
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

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                        onClick={onExport}
                        disabled={isExporting}
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto shadow-none">
                    <Table className="min-w-[1200px]">
                        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">NO</TableHead>
                                <TableHead className="text-left text-xs font-semibold uppercase text-slate-500 px-4 py-4">KODE ASET</TableHead>
                                <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">TGL BELI</TableHead>
                                <TableHead className="text-left text-xs font-semibold uppercase text-slate-500 px-4 py-4">NAMA BARANG</TableHead>
                                <TableHead className="text-left text-xs font-semibold uppercase text-slate-500 px-4 py-4">TIPE ASET</TableHead>
                                <TableHead className="text-left text-xs font-semibold uppercase text-slate-500 px-4 py-4">SERIAL NUMBER</TableHead>
                                <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">HARGA BELI</TableHead>
                                <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">UMUR EKONOMIS</TableHead>
                                <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">PENYUSUTAN/BULAN</TableHead>
                                <TableHead className="text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">NILAI AKHIR</TableHead>
                                <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={100} className="px-4 py-16 text-center bg-white">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
                                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                            <span className="text-sm font-medium text-slate-500">Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <TableRow className="group">
                                    <TableCell colSpan={100} className="py-16 h-32 text-center text-sm text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="rounded-full bg-slate-50 p-4 mb-2">
                                                <Search className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                                            <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assets.map((asset, index) => (
                                    <TableRow key={asset.id} className="group border-b hover:bg-gray-50/70 border-slate-100 last:border-0 transition-colors">
                                        <TableCell className="px-4 py-4 text-center text-sm text-slate-500">{(page - 1) * perPage + index + 1}</TableCell>
                                        <TableCell className="px-4 py-4 text-left text-sm font-medium text-slate-900 uppercase">{asset.code}</TableCell>
                                        <TableCell className="px-4 py-4 text-center text-sm text-slate-500">
                                            {asset.purchase_date ? format(new Date(asset.purchase_date), 'dd/MM/yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-left text-sm text-slate-700">{asset.name}</TableCell>
                                        <TableCell className="px-4 py-4 text-left text-sm text-slate-700 uppercase">{asset.type}</TableCell>
                                        <TableCell className="px-4 py-4 text-left text-sm text-slate-700 uppercase">{asset.serial_number || '-'}</TableCell>
                                        <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatMoney(asset.price, 'IDR')}</TableCell>
                                        <TableCell className="px-4 py-4 text-center text-sm text-slate-500">{asset.economic_age ? `${asset.economic_age} TAHUN` : '-'}</TableCell>
                                        <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatMoney(asset.depreciation_per_month ?? asset.depreciation ?? 0, 'IDR')}</TableCell>
                                        <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatMoney(asset.final_value ?? 0, 'IDR')}</TableCell>
                                        <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                                            <div className="flex justify-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="min-w-[100px] rounded-2xl p-2">
                                                    <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5" onClick={() => onDetail?.(asset)}>
                                                        Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5" onClick={() => onEdit(asset)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 cursor-pointer rounded-xl px-3 py-2.5" onClick={() => onDelete(asset)}>
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
            </div>

            {/* Pagination Info & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                <span className="text-sm text-gray-500">
                    Showing {Math.min((page - 1) * perPage + 1, totalData)}-{Math.min(page * perPage, totalData)} of {totalData} data
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="text-gray-500"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <Button
                                    key={pageNum}
                                    variant={page === pageNum ? 'outline' : 'ghost'}
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${page === pageNum ? 'border-gray-200 text-[#1e3a5f] font-semibold' : 'text-gray-500'}`}
                                    onClick={() => onPageChange(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        {totalPages > 5 && <span className="text-gray-400 px-1">...</span>}
                        {totalPages > 5 && (
                            <Button
                                variant={page === totalPages ? 'outline' : 'ghost'}
                                size="sm"
                                className={`h-8 w-8 p-0 ${page === totalPages ? 'border-gray-200 text-[#1e3a5f] font-semibold' : 'text-gray-500'}`}
                                onClick={() => onPageChange(totalPages)}
                            >
                                {totalPages}
                            </Button>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => onPageChange(page + 1)}
                        className="text-gray-500"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Card>
    );
}
