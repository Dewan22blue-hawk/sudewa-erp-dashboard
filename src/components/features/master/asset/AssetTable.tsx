import React from 'react';
import { Search, Plus, MoreVertical, Upload, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { Asset } from '@/@types/asset.types';
import { formatDateUI } from '@/lib/utils/date';

interface AssetTableProps {
    assets: Asset[];
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
    onEdit: (asset: Asset) => void;
    onDelete: (asset: Asset) => void;
    isExporting?: boolean;
}

export function AssetTable({
    assets,
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
}: AssetTableProps) {

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

    const formatAssetType = (type: string) => {
        const types: Record<string, string> = {
            inventory: 'Inventaris Kantor',
            vehicles: 'Kendaraan',
            buildings: 'Bangunan',
            land: 'Tanah'
        };
        return types[type] || type;
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
                </div>
            </div>

            <Card className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-none">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                            <TableRow>
                                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4 w-12">NO</TableHead>
                                <TableHead className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-4">KODE ASET</TableHead>
                                <TableHead className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-4">TIPE ASET</TableHead>
                                <TableHead className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-4">SERIAL NUMBER</TableHead>
                                <TableHead className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-4">NAMA BARANG</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4 whitespace-nowrap">TGL BELI</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">HARGA BELI</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4 w-12">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.length > 0 ? (
                                assets.map((item, index) => (
                                    <TableRow key={item.uuid} className="border-b hover:bg-gray-50/70 border-slate-100 last:border-0 transition-colors">
                                        <TableCell className="px-4 py-4 text-center text-sm text-slate-500">
                                            {(page - 1) * perPage + index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-left text-sm font-medium text-slate-900 uppercase">
                                            {item.code || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-left text-sm text-slate-700">
                                            {formatAssetType(item.type)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-left text-sm text-slate-700 uppercase">
                                            {item.serial_number || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-left text-sm text-slate-700">
                                            {item.name || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">
                                            {formatDateUI(item.purchase_date)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-900">
                                            {formatCurrency(item.price)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="min-w-[100px] rounded-2xl p-2">
                                                    <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer rounded-xl px-3 py-2.5 text-slate-700">
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDelete(item)} className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:text-red-600">
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                                        Tidak ada data aset ditemukan
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
