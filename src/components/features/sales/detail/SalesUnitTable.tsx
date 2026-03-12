import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { SalesLineItem } from '../sales.data';

interface Props {
  lineItems: SalesLineItem[];
  salesId: string;
}

export function SalesUnitTable({ lineItems, salesId }: Props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
  const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';

  const totalPages = Math.max(1, Math.ceil(lineItems.length / perPage));
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return lineItems.slice(start, start + perPage);
  }, [currentPage, perPage, lineItems]);

  const handleDelete = () => {
    setDeleteId(null);
  };

  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-6 py-5">
        <h3 className="text-xl font-semibold">Detail Pembelian Unit</h3>
        <p className="text-sm text-muted-foreground">Rincian lengkap unit yang dibeli</p>
      </div>

      <div className="flex items-center gap-2 px-6 py-4">
        <span className="text-sm">Show</span>
        <Select
          value={String(perPage)}
          onValueChange={(value) => {
            setPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-18 bg-white">
            <SelectValue placeholder="25" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm">Page</span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#f5f6f8]">
            <TableRow>
              <TableHead className="px-4">No</TableHead>
              <TableHead className="px-4">TIPE UNIT</TableHead>
              <TableHead className="px-4">QTY</TableHead>
              <TableHead className="px-4">HARGA JUAL</TableHead>
              <TableHead className="px-4">BIAYA BBN</TableHead>
              <TableHead className="px-4">BIAYA EXPEDISI</TableHead>
              <TableHead className="px-4">BIAYA LAIN</TableHead>
              <TableHead className="px-4">HPP</TableHead>
              <TableHead className="px-4">DPP</TableHead>
              <TableHead className="px-4">PPN</TableHead>
              <TableHead className="px-4">JUMLAH</TableHead>
              <TableHead className="px-4 text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-20 text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              pagedData.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="px-4">{(currentPage - 1) * perPage + idx + 1}</TableCell>
                  <TableCell className="px-4">{item.tipeUnit}</TableCell>
                  <TableCell className="px-4">{item.qty}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.hargaJual)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.biayaBbn)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.biayaEkspedisi)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.biayaLain)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.hpp)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.dpp)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.ppn)}</TableCell>
                  <TableCell className="px-4">{formatCurrency(item.jumlah)}</TableCell>
                  <TableCell className="px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`${basePath}/${salesId}/unit/${item.id}/edit`)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`${basePath}/${salesId}/unit/${item.id}`)}>Detail</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => setDeleteId(item.id)}>
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

      <div className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground">
        <span>
          Showing {lineItems.length === 0 ? 0 : (currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, lineItems.length)} of {lineItems.length} data
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            {currentPage}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data unit?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
