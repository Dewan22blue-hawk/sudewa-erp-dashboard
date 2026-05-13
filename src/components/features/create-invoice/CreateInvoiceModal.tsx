import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { SearchableSelect } from '@/components/features/vehicle-data/SearchableSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doCode: string;
  onDoCodeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  options: Array<{ value: string; label: string; subtitle?: string }>;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isLoadingOptions?: boolean;
}

export function CreateInvoiceModal({
  open,
  onOpenChange,
  doCode,
  onDoCodeChange,
  onSearchChange,
  options,
  onSubmit,
  isSubmitting = false,
  isLoadingOptions = false,
}: Props) {
  const handleSave = () => {
    if (!doCode) return;
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[390px] rounded-2xl border-none p-0 shadow-2xl">
        <div className="rounded-2xl bg-white p-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-[18px] font-semibold text-slate-950">Form Input Invoice</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">Masukkan detail data invoice</DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase tracking-wide text-slate-900">Kode DO</Label>
              <SearchableSelect
                value={doCode}
                onChange={onDoCodeChange}
                onSearchChange={onSearchChange}
                options={options}
                loading={isLoadingOptions}
                placeholder="Masukkan kode DO"
                searchPlaceholder="Cari kode DO..."
                emptyText="Kode DO tidak ditemukan."
                className="h-11 rounded-xl border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleSave}
                disabled={!doCode || isSubmitting}
                className="h-11 w-full rounded-xl bg-[#1f4163] text-sm font-semibold hover:bg-[#183552]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 w-full rounded-xl border-slate-200 text-sm font-semibold text-slate-700"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
