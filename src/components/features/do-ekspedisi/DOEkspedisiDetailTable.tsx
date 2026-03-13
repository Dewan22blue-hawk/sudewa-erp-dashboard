import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { DODetail } from './do-ekspedisi.data';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DOEkspedisiDetailTableProps {
    data: DODetail[];
}

export function DOEkspedisiDetailTable({ data }: DOEkspedisiDetailTableProps) {
    return (
        <Card className="rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <Table className="min-w-[1200px]">
                    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3 w-[50px]">NO</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">CUSTOMER</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">MUAT</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">TUJUAN KIRIM</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">BONGKAR</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">MUATAN</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">INVOICE</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">BIAYA TAMBAHAN</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">PPN</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">FEE</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">UJ DRIVER</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">LAINNYA</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">PPH</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <TableRow key={item.id} className="hover:bg-gray-50/50">
                                    <TableCell className="px-4 py-4 text-sm text-gray-900 text-center whitespace-nowrap">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.customer}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.muat}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.tujuanKirim}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.bongkar}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.muatan}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.invoice}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.biayaTambahan}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.ppn}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.fee}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.ujDriver}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.lainnya}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                                        {item.pph}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-sm text-center">
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={14} className="h-32 text-center text-gray-500">
                                    Tidak ada data detail ditemukan
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
