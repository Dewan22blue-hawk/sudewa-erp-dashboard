import React from 'react';
import { Search, Plus, MoreVertical, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { Dealer } from '@/@types/dealer.types';
import { cn } from '@/lib/utils';

interface DealerTableProps {
    dealers: Dealer[];
    search: string;
    onSearchChange: (value: string) => void;
    page: number;
    perPage: number;
    totalData: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onAdd: () => void;
    onImport?: () => void;
    onExport?: () => void;
    onEdit: (dealer: Dealer) => void;
    onDelete: (dealer: Dealer) => void;
    isExporting?: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export function DealerTable({
    dealers,
    search,
    onSearchChange,
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
}: DealerTableProps) {
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
                    className={cn(
                        'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                        p === page
                            ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                            : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                    )}
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
                className={cn(
                    'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                    p === page
                        ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                        : p === '...'
                            ? 'border-transparent bg-transparent text-slate-500 cursor-default hover:bg-transparent hover:border-transparent'
                            : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                )}
            >
                {p}
            </Button>
        ));
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
                    {onExport && (
                        <Button
                            onClick={onExport}
                            variant="outline"

                            className="w-full sm:w-auto"
                            disabled={isExporting}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export'}
                        </Button>
                    )}
                    {canCreate && (
                        <>
                            {onImport && (
                                <Button onClick={onImport} variant="outline" className="w-full sm:w-auto">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import
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

            <Card className="rounded-xl overflow-hidden border border-gray-200 shadow-none">
                <Table>
                    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow className="hover:bg-[#f8f9fa]">
                            <TableHead className="text-xs font-semibold text-slate-500 w-[15%] uppercase px-4 py-4 text-left">KODE DEALER</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 w-[25%] uppercase px-4 py-4 text-left">NAMA DEALER</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 w-[30%] uppercase px-4 py-4 text-left">ALAMAT</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 w-[15%] uppercase px-4 py-4 text-left">PIC</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 w-[15%] uppercase px-4 py-4 text-left">PHONE</TableHead>
                            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dealers.length > 0 ? (
                            dealers.map((dealer) => (
                                <TableRow key={dealer.id} className="group hover:bg-gray-50 transition-colors">
                                    <TableCell className="text-center px-4 py-4 sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                                        {dealer.code || '-'}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 text-left truncate">
                                        {dealer.namaDealer}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">
                                        <span className="line-clamp-2">{dealer.alamat || '-'}</span>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">
                                        {dealer.pic || '-'}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-left">
                                        {dealer.handphone || '-'}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-center">
                                        <div className="flex justify-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                                                    <DropdownMenuItem onClick={() => onEdit(dealer)} disabled={!canEdit} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDelete(dealer)} disabled={!canDelete} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="group">
                                <TableCell colSpan={100} className="py-16 h-32 text-center text-gray-500 text-sm">
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
                            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>

                        {renderPaginationNumbers()}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
