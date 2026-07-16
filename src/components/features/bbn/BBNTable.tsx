import React from 'react';
import { Search, Plus, MoreVertical, Upload, Download, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { BBN } from '@/@types/bbn.types';

interface BBNTableProps {
    bbns: BBN[];
    search: string;
    onSearchChange: (value: string) => void;
    isLoading?: boolean;
    page: number;
    perPage: number;
    totalData: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onAdd: () => void;
    onImport?: () => void;
    onExport?: () => void;
    onEdit: (bbn: BBN) => void;
    onDelete: (bbn: BBN) => void;
    isExporting?: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export function BBNTable({
    bbns,
    search,
    onSearchChange,
    isLoading = false,
    page,
    perPage,
    totalData,
    onPageChange,
    onPerPageChange,
    onAdd,
    onImport,
    onExport,
    onEdit,
    onDelete,
    isExporting = false,
    canCreate,
    canEdit,
    canDelete,
}: BBNTableProps) {

    const totalPages = Math.ceil(totalData / perPage);
    const startData = (page - 1) * perPage + 1;
    const endData = Math.min(page * perPage, totalData);

    const renderPaginationNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                    key={p}
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className={
                        p === page
                            ? 'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-sm border-slate-200 bg-white text-slate-950'
                            : 'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white'
                    }
                >
                    {p}
                </Button>
            ));
        }

        const pages = [];
        if (page <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (page >= totalPages - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            pages.push(page - 1, page, page + 1);
            pages.push('...');
            pages.push(totalPages);
        }

        return pages.map((p, idx) => (
            <Button
                key={idx}
                variant="ghost"
                size="sm"
                disabled={p === '...'}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                className={
                    p === page
                        ? 'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-sm border-slate-200 bg-white text-slate-950'
                        : p === '...'
                        ? 'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium border-transparent bg-transparent text-slate-500 cursor-default hover:bg-transparent hover:border-transparent'
                        : 'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white'
                }
            >
                {p}
            </Button>
        ));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search here"
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                        <span>Show</span>
                        <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(Number(v))}>
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

                <div className="flex flex-wrap items-center gap-2">
                    {canCreate && (
                        <>
                            {onImport && (
                                <Button onClick={onImport} variant="outline" className="w-full sm:w-auto">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import
                                </Button>
                            )}
                            {onExport && (
                                <Button onClick={onExport} variant="outline" className="w-full sm:w-auto" disabled={isExporting}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isExporting ? 'Exporting...' : 'Export'}
                                </Button>
                            )}
                            <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4 w-[20%]">DEALER</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4 text-center">KODE TNBK</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4">WILAYAH</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4 text-center">JENIS</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4">UN NOTICE</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4">GARWIL</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4">BIRO/LOKET</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4">BIAYA LAIN</TableHead>
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4 text-center sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</TableHead>
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
) : bbns.length > 0 ? (
                                bbns.map((item) => (
                                    <TableRow key={item.uuid} className="group bg-white hover:bg-slate-50 transition-colors">
                                        <TableCell className="px-4 py-4 text-sm text-gray-600 font-medium">
                                            {item.dealer?.namaDealer || item.dealer?.code || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">
                                            {item.tnbkCode || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-600 uppercase">
                                            {item.region?.name || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-600 uppercase text-center font-medium">
                                            {item.vehicleType || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-600">
                                            {formatCurrency(item.unNoticeFee)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-600">
                                            {formatCurrency(item.garwilFee)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-600">
                                            {formatCurrency(item.countershopFee)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-600">
                                            {item.otherFee === 0 ? '0' : formatCurrency(item.otherFee)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuItem onClick={() => onEdit(item)} disabled={!canEdit} className="cursor-pointer text-gray-700">
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDelete(item)} disabled={!canDelete} className="text-red-600 cursor-pointer focus:text-red-600">
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className="group">
                                    <TableCell colSpan={100} className="py-16 h-32 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-slate-50 p-4 mb-2">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                        <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
                <div>
                    Showing {totalData === 0 ? 0 : startData}-{endData} of {totalData} data
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                        >
                            Previous
                        </Button>
                        
                        {renderPaginationNumbers()}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
