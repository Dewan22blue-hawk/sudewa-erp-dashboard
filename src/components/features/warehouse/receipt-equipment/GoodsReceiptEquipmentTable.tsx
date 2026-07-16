import Link from 'next/link';
import { MoreVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { GoodsReceiptEquipment } from '@/@types/goods-receipt-equipment.types';
import { formatDate, formatCurrency, getReceiptBilling } from './goodsReceiptEquipment.utils';
import { cn } from '@/lib/utils';

interface GoodsReceiptEquipmentTableProps {
  data: GoodsReceiptEquipment[];
  isLoading: boolean;
  isFetching?: boolean;
  slug: string;
  onUploadInvoice: (item: GoodsReceiptEquipment) => void;
  onPayBilling?: (item: GoodsReceiptEquipment) => void;
  onCreateBilling?: (item: GoodsReceiptEquipment) => void;
  onDelete: (item: GoodsReceiptEquipment) => void;
}

const SkeletonRow = () => (
  <TableRow className="border-slate-200">
    <TableCell className="px-4 py-4"><Skeleton className="h-5 w-28 rounded-lg" /></TableCell>
    <TableCell className="px-4 py-4"><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
    <TableCell className="px-4 py-4"><Skeleton className="h-5 w-36 rounded-lg" /></TableCell>
    <TableCell className="px-4 py-4"><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
    <TableCell className="px-4 py-4"><Skeleton className="h-5 w-28 rounded-lg" /></TableCell>
    <TableCell className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
    <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]"><Skeleton className="h-9 w-9 rounded-full mx-auto" /></TableCell>
  </TableRow>
);

export function GoodsReceiptEquipmentTable({
  data,
  isLoading,
  isFetching = false,
  slug,
  onUploadInvoice,
  onPayBilling,
  onCreateBilling,
  onDelete,
}: GoodsReceiptEquipmentTableProps) {
  const showSkeleton = isLoading && data.length === 0;

  return (
    <div className="relative">
      {/* Premium Linear Loading Bar */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100 overflow-hidden z-10">
          <div className="h-full bg-[#1e3a5f] animate-pulse w-full duration-1000" />
        </div>
      )}

      <Table>
        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
          <TableRow className="hover:bg-[#f8f9fa]">
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KODE TRANSAKSI</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TANGGAL TERIMA</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">SUPPLIER</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">LOKASI</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TOTAL HARGA</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">STATUS</TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-24 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={isFetching && !isLoading ? 'opacity-60 transition-opacity duration-200' : 'transition-opacity duration-200'}>
          {showSkeleton ? (
            Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
          ) : data.length === 0 ? (
            <TableRow className="hover:bg-transparent cursor-default hover:shadow-none">
              <TableCell colSpan={100} className="py-16 h-28 text-center text-slate-500 text-sm">
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
            data.map((item) => {
              const hasBilling = item.goodsTransactionBillings && item.goodsTransactionBillings.length > 0;
              const billing = getReceiptBilling(item as any);
              const isPaid = item.isPaid || billing?.isPaid;

              return (
                <TableRow key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <TableCell className="px-4 py-4 text-sm font-medium text-slate-900 text-left">{item.code || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{formatDate(item.transactionDate)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.supplier?.name || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">{item.location || '-'}</TableCell>
                  <TableCell className="px-4 py-4 text-sm font-semibold text-slate-900 text-left">{formatCurrency(item.totalBrutto)}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-slate-700 text-left">
                    {isPaid ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Lunas
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/15">
                        Belum Lunas
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                        <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                          <Link href={`/dashboard/${slug}/warehouse/perlengkapan-masuk/${item.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                          <Link href={`/dashboard/[slug]/warehouse/perlengkapan-masuk/${item.id}`.replace('[slug]', slug)}>Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => onUploadInvoice(item), 100);
                          }}
                          className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                        >
                          Upload Invoice
                        </DropdownMenuItem>

                        {!isPaid && !hasBilling && onCreateBilling && (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setTimeout(() => onCreateBilling(item), 100);
                            }}
                            className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                          >
                            Buat Billing
                          </DropdownMenuItem>
                        )}

                        {!isPaid && hasBilling && onPayBilling && (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setTimeout(() => onPayBilling(item), 100);
                            }}
                            className="rounded-lg px-3 py-2 text-sm text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer"
                          >
                            Bayar Billing
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => onDelete(item), 100);
                          }}
                          className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                        >
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
