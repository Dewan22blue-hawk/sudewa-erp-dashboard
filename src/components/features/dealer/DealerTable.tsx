import React from 'react';
import { Search, Plus, MoreVertical, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { DealerFormData } from './DealerFormModal';

export interface Dealer extends DealerFormData {
    id: number;
}

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
    onEdit: (dealer: Dealer) => void;
    onDelete: (dealer: Dealer) => void;
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
    onEdit,
    onDelete
}: DealerTableProps) {

    const totalPages = Math.ceil(totalData / perPage);
    const startData = (page - 1) * perPage + 1;
    const endData = Math.min(page * perPage, totalData);

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
                                <SelectValue placeholder="25" />
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

                <div className="flex items-center gap-2">
                    {onImport && (
                        <Button onClick={onImport} variant="outline" className="w-full sm:w-auto">
                            <Upload className="h-4 w-4" />
                            Import
                        </Button>
                    )}
                    <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>

            </div>

            <Card className="rounded-xl overflow-hidden border border-gray-200">
                <Table>
                    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow>
                            <TableHead className="text-xs font-semibold text-gray-600 w-[20%] uppercase px-4 py-3">NAMA DEALER</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 w-[35%] uppercase px-4 py-3">ALAMAT</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 w-[15%] uppercase px-4 py-3">PIC</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 w-[15%] uppercase px-4 py-3">HANDPHONE</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 w-[10%] uppercase px-4 py-3 text-center">ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dealers.length > 0 ? (
                            dealers.map((dealer) => (
                                <TableRow key={dealer.id} className="hover:bg-gray-50/50">
                                    <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 truncate">
                                        {dealer.namaDealer}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600">
                                        <span className="line-clamp-2">{dealer.alamat}</span>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600">
                                        {dealer.pic}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600">
                                        {dealer.handphone}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuItem onClick={() => onEdit(dealer)} className="cursor-pointer">
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(dealer)} className="text-red-600 cursor-pointer focus:text-red-600">
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                    Tidak ada data dealer ditemukan
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                variant={p === page ? "outline" : "ghost"}
                                size="sm"
                                onClick={() => onPageChange(p)}
                                className={p === page ? "border-gray-200 bg-white" : "text-gray-500"}
                            >
                                {p}
                            </Button>
                        ))}

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
