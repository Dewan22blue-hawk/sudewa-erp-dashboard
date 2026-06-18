import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { GoodsReceiptEquipment } from '@/@types/goods-receipt-equipment.types';
import { formatDate, formatCurrency, getReceiptBilling } from './goodsReceiptEquipment.utils';

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
    <TableCell className="px-4 py-4 text-center"><Skeleton className="h-9 w-9 rounded-full mx-auto" /></TableCell>
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
          <div className="h-full bg-[#1f4163] animate-pulse w-full duration-1000" />
        </div>
      )}

      <Table>
        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
          <TableRow className="border-slate-200 hover:bg-transparent cursor-default hover:shadow-none">
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">KODE TRANSAKSI</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TANGGAL TERIMA</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">SUPPLIER</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">LOKASI</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TOTAL HARGA</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">STATUS</TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 w-24 whitespace-nowrap">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={isFetching && !isLoading ? 'opacity-60 transition-opacity duration-200' : 'transition-opacity duration-200'}>
          {showSkeleton ? (
            Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
          ) : data.length === 0 ? (
            <TableRow className="hover:bg-transparent cursor-default hover:shadow-none">
              <TableCell colSpan={7} className="h-28 text-center text-slate-500 text-sm">
                Belum ada data penerimaan perlengkapan.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const hasBilling = item.goodsTransactionBillings && item.goodsTransactionBillings.length > 0;
              const billing = getReceiptBilling(item as any);
              const isPaid = item.isPaid || billing?.isPaid;

              return (
                <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70 cursor-default hover:shadow-none transition-colors duration-150">
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
                  <TableCell className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                          <MoreVertical className="h-4 w-4 text-slate-700" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl border-slate-200 p-2 shadow-lg">
                        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">
                          <Link href={`/dashboard/${slug}/warehouse/perlengkapan-masuk/${item.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[16px]">
                          <Link href={`/dashboard/[slug]/warehouse/perlengkapan-masuk/${item.id}`.replace('[slug]', slug)}>Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => onUploadInvoice(item), 100);
                          }}
                          className="cursor-pointer rounded-xl px-3 py-2 text-[16px]"
                        >
                          Upload Invoice
                        </DropdownMenuItem>

                        {!isPaid && !hasBilling && onCreateBilling && (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setTimeout(() => onCreateBilling(item), 100);
                            }}
                            className="cursor-pointer rounded-xl px-3 py-2 text-[16px]"
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
                            className="cursor-pointer rounded-xl px-3 py-2 text-[16px] text-emerald-600 focus:text-emerald-600"
                          >
                            Bayar Billing
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => onDelete(item), 100);
                          }}
                          className="cursor-pointer rounded-xl px-3 py-2 text-[16px] text-red-600 focus:text-red-600"
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
