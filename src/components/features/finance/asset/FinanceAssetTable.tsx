import React, { useMemo } from 'react';
import { Download, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { FinanceAsset } from '@/@types/finance-asset.types';
import { format } from 'date-fns';
import { formatDate, formatMoney } from '@/lib/utils/format';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { CopyBox } from '@/components/ui/copy-box';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { Badge } from '@/components/ui/badge';

const getAssetTypeBadge = (type?: string | null) => {
    if (!type) return <Badge variant="outline">-</Badge>;
    switch (type.toLowerCase()) {
        case 'inventory':
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Inventaris</Badge>;
        case 'vehicles':
            return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Kendaraan</Badge>;
        case 'buildings':
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Bangunan</Badge>;
        case 'land':
            return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Tanah</Badge>;
        default:
            return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{type}</Badge>;
    }
};

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
    onAdd?: () => void;
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
    onAdd,
    onEdit,
    onDelete,
    onDetail,
    isLoading = false,
}: FinanceAssetTableProps) {
    const totalPages = Math.max(1, Math.ceil(totalData / perPage));

    const columns = useMemo<ColumnDef<FinanceAsset>[]>(
        () => [
            {
                header: 'KODE ASET',
                accessorKey: 'code',
                alignment: 'left',
                cell: (item) => <CopyBox text={item?.code || '-'} />
            },
            {
                header: 'SERIAL NUMBER',
                accessorKey: 'serial_number',
                alignment: 'left',
                className: 'uppercase',
                cell: (item) => item.serial_number ? <CopyBox text={item.serial_number} /> : <Badge variant='outline' className='bg-slate-100 text-slate-500 border-slate-200'>belum ditambahkan</Badge>
            },
            {
                header: 'TGL BELI',
                accessorKey: 'purchase_date',
                alignment: 'center',
                cell: (item) => formatDate(item?.purchase_date),
            },
            {
                header: 'NAMA BARANG',
                accessorKey: 'name',
                alignment: 'left',
            },
            {
                header: 'TIPE ASET',
                accessorKey: 'type',
                alignment: 'left',
                cell: (item) => getAssetTypeBadge(item?.type)
            },
            {
                header: 'HARGA BELI',
                accessorKey: 'price',
                alignment: 'center',
                className: 'font-medium text-slate-900',
                cell: (item) => currenciesFormat('idr', item.price),
            },
            {
                header: 'UMUR EKONOMIS',
                accessorKey: 'economic_age',
                alignment: 'center',
                cell: (item) => item.economic_age ? `${item.economic_age} Tahun` : '-',
            },
            {
                header: 'PENYUSUTAN/BULAN',
                accessorKey: 'depreciation_per_month',
                alignment: 'center',
                className: 'font-medium text-slate-900',
                cell: (item) => currenciesFormat('idr', item.depreciation_per_month ?? item.depreciation ?? 0),
            },
            {
                header: 'NILAI AKHIR',
                accessorKey: 'final_value',
                alignment: 'center',
                className: 'font-medium text-slate-900',
                cell: (item) => currenciesFormat('idr', item.final_value ?? 0),
            },
            {
                header: 'Aksi',
                alignment: 'center',
                sticky: 'right',
                className: 'w-[80px]',
                cell: (item) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[100px] rounded-md p-2">
                            <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2.5" onClick={() => onDetail?.(item)}>
                                Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2.5" onClick={() => onEdit(item)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 cursor-pointer rounded-md px-3 py-2.5" onClick={() => onDelete(item)}>
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [onEdit, onDelete, onDetail]
    );

    const headerActions = useMemo(
        () => (
            <Button onClick={onExport} disabled={isExporting} variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
            </Button>
        ),
        [onExport, isExporting]
    );

    return (
        <BaseTable
            data={assets}
            columns={columns}
            loading={isLoading}
            search={search}
            onSearchChange={onSearchChange}
            showLimitChange={true}
            perPage={perPage}
            onPerPageChange={onPerPageChange}
            headerActions={headerActions}
            meta={{
                currentPage: page,
                perPage,
                lastPage: totalPages,
                total: totalData,
            }}
            onPageChange={onPageChange}
        />
    );
}
