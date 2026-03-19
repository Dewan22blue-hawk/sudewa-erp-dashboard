import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InvoiceCostFormValues, InvoiceCostItem } from './create-invoice.data';
import { buildInvoiceCostFormDefaults, formatNumberInput, parseNumberInput } from './create-invoice.data';

interface InvoiceCostModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Omit<InvoiceCostItem, 'id'>) => void;
}

// Separate display state for formatted currency fields
interface CurrencyDisplayState {
  invoiceEkspedisi: string;
  biayaTambahan: string;
}

export function InvoiceCostModal({ open, onClose, onSave }: InvoiceCostModalProps) {
  const [values, setValues] = useState<InvoiceCostFormValues>(buildInvoiceCostFormDefaults());
  const [currencyDisplay, setCurrencyDisplay] = useState<CurrencyDisplayState>({
    invoiceEkspedisi: '',
    biayaTambahan: '',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCurrencyChange = (field: 'invoiceEkspedisi' | 'biayaTambahan', rawValue: string) => {
    // Strip non-digits
    const digits = rawValue.replace(/\D/g, '');
    // Format with thousand separators
    const formatted = digits ? Number(digits).toLocaleString('id-ID') : '';
    // Store raw numeric value in values state
    setValues((prev) => ({ ...prev, [field]: digits }));
    // Store formatted display value
    setCurrencyDisplay((prev) => ({ ...prev, [field]: formatted }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<string, string>> = {};
    if (!values.tanggal.trim()) nextErrors.tanggal = 'Tanggal wajib diisi';
    if (!values.noPolisi.trim()) nextErrors.noPolisi = 'No polisi wajib diisi';
    if (!values.driver.trim()) nextErrors.driver = 'Driver wajib diisi';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      tanggal: values.tanggal,
      noPolisi: values.noPolisi,
      type: values.type,
      driver: values.driver,
      muat: values.muat,
      tujuanKirim: values.tujuanKirim,
      bongkar: values.bongkar,
      noSuratDO: values.noSuratDO,
      qty: Number(values.qty) || 0,
      invoiceEkspedisi: Number(parseNumberInput(values.invoiceEkspedisi)) || 0,
      biayaTambahan: Number(parseNumberInput(values.biayaTambahan)) || 0,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setValues(buildInvoiceCostFormDefaults());
    setCurrencyDisplay({ invoiceEkspedisi: '', biayaTambahan: '' });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Rincian Biaya</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          {/* Tanggal */}
          <div className="space-y-2">
            <Label htmlFor="cost-tanggal">
              Tanggal <span className="text-red-500">*</span>
            </Label>
            <Input id="cost-tanggal" type="date" value={values.tanggal} onChange={(e) => handleChange('tanggal', e.target.value)} className={errors.tanggal ? 'border-red-500' : ''} />
            {errors.tanggal && <p className="text-xs text-red-500">{errors.tanggal}</p>}
          </div>

          {/* No Polisi */}
          <div className="space-y-2">
            <Label htmlFor="cost-noPolisi">
              No Polisi <span className="text-red-500">*</span>
            </Label>
            <Input id="cost-noPolisi" placeholder="Contoh: AB 0000 XY" value={values.noPolisi} onChange={(e) => handleChange('noPolisi', e.target.value)} className={errors.noPolisi ? 'border-red-500' : ''} />
            {errors.noPolisi && <p className="text-xs text-red-500">{errors.noPolisi}</p>}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="cost-type">Type</Label>
            <Input id="cost-type" placeholder="Contoh: FUSO, TRONTON" value={values.type} onChange={(e) => handleChange('type', e.target.value)} />
          </div>

          {/* Driver */}
          <div className="space-y-2">
            <Label htmlFor="cost-driver">
              Driver <span className="text-red-500">*</span>
            </Label>
            <Input id="cost-driver" placeholder="Nama driver" value={values.driver} onChange={(e) => handleChange('driver', e.target.value)} className={errors.driver ? 'border-red-500' : ''} />
            {errors.driver && <p className="text-xs text-red-500">{errors.driver}</p>}
          </div>

          {/* Muat */}
          <div className="space-y-2">
            <Label htmlFor="cost-muat">Muat</Label>
            <Input id="cost-muat" placeholder="Lokasi muat" value={values.muat} onChange={(e) => handleChange('muat', e.target.value)} />
          </div>

          {/* Tujuan Kirim */}
          <div className="space-y-2">
            <Label htmlFor="cost-tujuanKirim">Tujuan Kirim</Label>
            <Input id="cost-tujuanKirim" placeholder="Tujuan pengiriman" value={values.tujuanKirim} onChange={(e) => handleChange('tujuanKirim', e.target.value)} />
          </div>

          {/* Bongkar */}
          <div className="space-y-2">
            <Label htmlFor="cost-bongkar">Bongkar</Label>
            <Input id="cost-bongkar" placeholder="Lokasi bongkar" value={values.bongkar} onChange={(e) => handleChange('bongkar', e.target.value)} />
          </div>

          {/* No Surat DO */}
          <div className="space-y-2">
            <Label htmlFor="cost-noSuratDO">No Surat DO</Label>
            <Input id="cost-noSuratDO" placeholder="Nomor surat DO" value={values.noSuratDO} onChange={(e) => handleChange('noSuratDO', e.target.value)} />
          </div>

          {/* Qty */}
          <div className="space-y-2">
            <Label htmlFor="cost-qty">Qty</Label>
            <Input id="cost-qty" type="number" placeholder="0" min="0" value={values.qty} onChange={(e) => handleChange('qty', e.target.value)} />
          </div>

          {/* Invoice Ekspedisi - Currency formatted */}
          <div className="space-y-2">
            <Label htmlFor="cost-invoiceEkspedisi">Invoice Ekspedisi (Rp)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Rp</span>
              <Input id="cost-invoiceEkspedisi" type="text" inputMode="numeric" placeholder="0" value={currencyDisplay.invoiceEkspedisi} onChange={(e) => handleCurrencyChange('invoiceEkspedisi', e.target.value)} className="pl-9" />
            </div>
          </div>

          {/* Biaya Tambahan - Currency formatted */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cost-biayaTambahan">Biaya Tambahan (Rp)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Rp</span>
              <Input id="cost-biayaTambahan" type="text" inputMode="numeric" placeholder="0" value={currencyDisplay.biayaTambahan} onChange={(e) => handleCurrencyChange('biayaTambahan', e.target.value)} className="pl-9" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Batal
          </Button>
          <Button type="button" onClick={handleSave} className="bg-[#1e3a5f] hover:bg-[#152e4d]">
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
