import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import type { InvoiceCostItem } from './create-invoice.data';
import { formatCurrency, formatDate } from './create-invoice.data';
import { InvoiceCostModal } from './InvoiceCostModal';

interface InvoiceCostTableProps {
  items: InvoiceCostItem[];
  onItemsChange: (items: InvoiceCostItem[]) => void;
}

export function InvoiceCostTable({ items, onItemsChange }: InvoiceCostTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItem = (newItem: Omit<InvoiceCostItem, 'id'>) => {
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    onItemsChange([...items, { id: newId, ...newItem }]);
  };

  const handleDeleteItem = (id: number) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Rincian Biaya</h4>
        <Button type="button" onClick={() => setIsModalOpen(true)} className="bg-[#1e3a5f] hover:bg-[#152e4d] gap-1" size="sm">
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10 text-center font-semibold text-gray-700">NO</TableHead>
              <TableHead className="min-w-[120px] font-semibold text-gray-700">TANGGAL</TableHead>
              <TableHead className="min-w-[110px] font-semibold text-gray-700">NO POLISI</TableHead>
              <TableHead className="min-w-[80px] font-semibold text-gray-700">TYPE</TableHead>
              <TableHead className="min-w-[120px] font-semibold text-gray-700">DRIVER</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-gray-700">MUAT</TableHead>
              <TableHead className="min-w-[150px] font-semibold text-gray-700">TUJUAN KIRIM</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-gray-700">BONGKAR</TableHead>
              <TableHead className="min-w-[120px] font-semibold text-gray-700">NO SURAT DO</TableHead>
              <TableHead className="w-16 text-center font-semibold text-gray-700">QTY</TableHead>
              <TableHead className="min-w-[150px] font-semibold text-gray-700">INV EKSPEDISI</TableHead>
              <TableHead className="min-w-[150px] font-semibold text-gray-700">BIAYA TAMBAHAN</TableHead>
              <TableHead className="w-16 text-center font-semibold text-gray-700">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="py-8 text-center text-sm text-gray-400">
                  Belum ada rincian biaya. Klik tombol Tambah untuk menambahkan.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="text-center text-sm">{index + 1}</TableCell>
                  <TableCell className="text-sm">{formatDate(item.tanggal)}</TableCell>
                  <TableCell className="text-sm font-medium">{item.noPolisi}</TableCell>
                  <TableCell className="text-sm">{item.type}</TableCell>
                  <TableCell className="text-sm">{item.driver}</TableCell>
                  <TableCell className="text-sm">{item.muat}</TableCell>
                  <TableCell className="text-sm">{item.tujuanKirim}</TableCell>
                  <TableCell className="text-sm">{item.bongkar}</TableCell>
                  <TableCell className="text-sm">{item.noSuratDO}</TableCell>
                  <TableCell className="text-center text-sm">{item.qty}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(item.invoiceEkspedisi)}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(item.biayaTambahan)}</TableCell>
                  <TableCell className="text-center">
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {items.length > 0 && (
        <div className="flex justify-end gap-8 rounded-lg bg-gray-900 px-6 py-3 text-white">
          <div className="text-sm">
            <span className="text-gray-400">Total Invoice Ekspedisi: </span>
            <span className="font-semibold">{formatCurrency(items.reduce((sum, item) => sum + item.invoiceEkspedisi, 0))}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Total Biaya Tambahan: </span>
            <span className="font-semibold">{formatCurrency(items.reduce((sum, item) => sum + item.biayaTambahan, 0))}</span>
          </div>
        </div>
      )}

      <InvoiceCostModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddItem} />
    </section>
  );
}
