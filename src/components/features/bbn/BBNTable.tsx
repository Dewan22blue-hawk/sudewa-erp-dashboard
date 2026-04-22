import React from 'react';
import { Search, Plus, MoreVertical, Upload, Download } from 'lucide-react';
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
}: BBNTableProps) {

    const totalPages = Math.ceil(totalData / perPage);
    const startData = (page - 1) * perPage + 1;
    const endData = Math.min(page * perPage, totalData);

    const renderPaginationNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                    key={p}
                    variant={p === page ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className={p === page ? "border-gray-200 bg-white" : "text-gray-500"}
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
                variant={p === page ? "outline" : "ghost"}
                size="sm"
                disabled={p === '...'}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                className={p === page ? "border-gray-200 bg-white" : "text-gray-500"}
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

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Show</span>
                        <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(Number(v))}>
                            <SelectTrigger className="w-[70px] bg-white">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">Page</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {onImport ? (
                        <Button onClick={onImport} variant="outline" className="w-full sm:w-auto">
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </Button>
                    ) : null}
                    {onExport ? (
                        <Button onClick={onExport} variant="outline" className="w-full sm:w-auto" disabled={isExporting}>
                            <Download className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export'}
                        </Button>
                    ) : null}
                    <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah
                    </Button>
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
                                <TableHead className="text-xs font-semibold text-gray-600 uppercase px-4 py-4 text-center">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                // Loading skeleton rows
                                Array.from({ length: perPage > 5 ? 5 : perPage }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        {Array.from({ length: 9 }).map((_, j) => (
                                            <TableCell key={j} className="px-4 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : bbns.length > 0 ? (
                                bbns.map((item) => (
                                    <TableRow key={item.uuid} className="hover:bg-gray-50/50">
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
                                        <TableCell className="px-4 py-4 text-sm text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer text-gray-700">
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-600 cursor-pointer focus:text-red-600">
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-32 text-center text-gray-500">
                                        Tidak ada data biaya ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <div className="flex items-center justify-between px-2 pt-2">
                <div className="text-sm text-gray-500">
                    Showing {totalData === 0 ? 0 : startData}-{endData} of {totalData} data
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="text-gray-500"
                        >
                            Previous
                        </Button>
                        
                        {renderPaginationNumbers()}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="text-gray-500"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
