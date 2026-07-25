'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateKasHarian } from '@/hooks/useKasHarian';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
import type { KasHarian } from '@/@types/kas-harian.types';
import { LoadingState } from '@/components/ui/loading-state';

const TRANSACTION_CATEGORY_OPTIONS = [
  { value: 'general', label: 'Umum (General)' },
  { value: 'operational', label: 'Operasional (Operational)' },
  { value: 'director_receivable', label: 'Piutang Direktur (Director Receivable)' },
  { value: 'shareholder_receivable', label: 'Piutang Pemegang Saham (Shareholder Receivable)' },
  { value: 'receivable', label: 'Piutang Usaha (Receivable)' },
  { value: 'inventory', label: 'Persediaan (Inventory)' },
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashFlowDetail: KasHarian;
}

export default function TransactionCategoryModal({ open, onOpenChange, cashFlowDetail }: Props) {
  const updateMutation = useUpdateKasHarian();
  const [selectedCategory, setSelectedCategory] = useState(cashFlowDetail.transaction_category || 'general');

  useEffect(() => {
    if (open) {
      setSelectedCategory(cashFlowDetail.transaction_category || 'general');
    }
  }, [open, cashFlowDetail.transaction_category]);

  const handleSubmit = async () => {
    if (updateMutation.isPending) return;

    try {
      await updateMutation.mutateAsync({
        id: cashFlowDetail.id,
        payload: {
          company_id: cashFlowDetail.company_id,
          date: cashFlowDetail.date.slice(0, 10),
          note: cashFlowDetail.note || '',
          debet: cashFlowDetail.debet,
          credit: cashFlowDetail.credit,
          transaction_category: selectedCategory,
        },
      });
      toast.success('Kategori transaksi berhasil diperbarui');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Gagal memperbarui kategori transaksi');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Ganti Kategori Transaksi</DialogTitle>
          <DialogDescription>Pilih kategori transaksi baru untuk cash flow ini.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label className="text-sm font-medium text-slate-800">Kategori Transaksi</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={updateMutation.isPending}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="bg-[#18385b] text-white hover:bg-[#102843]"
            disabled={updateMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {updateMutation.isPending ? (
              <>
                <LoadingState variant="inline" text={null} />
                Menyimpan...
              </>
            ) : (
              'Simpan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
