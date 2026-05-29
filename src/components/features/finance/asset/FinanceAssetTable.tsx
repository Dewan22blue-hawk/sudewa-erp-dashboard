import React from 'react';
import { Search, MoreVertical, Download } from 'lucide-react';
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
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search here"
                            className="pl-10 bg-white border-gray-200"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 whitespace-nowrap">Show</span>
                        <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                            <SelectTrigger className="w-20 bg-white border-gray-200">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500 whitespace-nowrap">Page</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border-gray-200 text-gray-600"
                        onClick={onExport}
                        disabled={isExporting}
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="w-12 font-semibold text-gray-900">NO</TableHead>
                                <TableHead className="font-semibold text-gray-900">KODE ASET</TableHead>
                                <TableHead className="font-semibold text-gray-900">TGL BELI</TableHead>
                                <TableHead className="font-semibold text-gray-900">NAMA BARANG</TableHead>
                                <TableHead className="font-semibold text-gray-900">TIPE ASET</TableHead>
                                <TableHead className="font-semibold text-gray-900">SERIAL NUMBER</TableHead>
                                <TableHead className="font-semibold text-gray-900">HARGA BELI</TableHead>
                                <TableHead className="font-semibold text-gray-900">UMUR EKONOMIS</TableHead>
                                <TableHead className="font-semibold text-gray-900">PENYUSUTAN/BULAN</TableHead>
                                <TableHead className="font-semibold text-gray-900">NILAI AKHIR</TableHead>
                                <TableHead className="w-12 font-semibold text-gray-900">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="hover:bg-transparent border-gray-100 last:border-0">
                                        {Array.from({ length: 11 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : assets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-24 text-center text-gray-500">
                                        No data found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assets.map((asset, index) => (
                                    <TableRow key={asset.id} className="hover:bg-gray-50/50 border-gray-100 last:border-0">
                                        <TableCell className="text-gray-600">{(page - 1) * perPage + index + 1}</TableCell>
                                        <TableCell className="font-medium text-gray-900 uppercase">{asset.code}</TableCell>
                                        <TableCell className="text-gray-600">
                                            {asset.purchase_date ? format(new Date(asset.purchase_date), 'dd/MM/yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="text-gray-600">{asset.name}</TableCell>
                                        <TableCell className="text-gray-600 uppercase">{asset.type}</TableCell>
                                        <TableCell className="text-gray-600 uppercase">{asset.serial_number || '-'}</TableCell>
                                        <TableCell className="text-gray-600">{formatMoney(asset.price, 'IDR')}</TableCell>
                                        <TableCell className="text-gray-600">{asset.economic_age ? `${asset.economic_age} TAHUN` : '-'}</TableCell>
                                        <TableCell className="text-gray-600">{formatMoney(asset.depreciation_per_month ?? asset.depreciation ?? 0, 'IDR')}</TableCell>
                                        <TableCell className="text-gray-600">{formatMoney(asset.final_value ?? 0, 'IDR')}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32">
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => onDetail?.(asset)}>
                                                        Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(asset)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => onDelete(asset)}>
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
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
