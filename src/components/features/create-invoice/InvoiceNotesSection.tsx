import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { InvoiceFormValues } from './create-invoice.data';

interface InvoiceNotesSectionProps {
  values: Pick<InvoiceFormValues, 'catatanTambahan'>;
  onValueChange: (field: string, value: string) => void;
}

export function InvoiceNotesSection({ values, onValueChange }: InvoiceNotesSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">Catatan</h4>

      <div className="space-y-2">
        <Label htmlFor="catatanTambahan">Catatan Tambahan</Label>
        <Textarea id="catatanTambahan" placeholder="Catatan atau syarat & ketentuan pembayaran..." value={values.catatanTambahan} onChange={(e) => onValueChange('catatanTambahan', e.target.value)} rows={4} />
      </div>
    </section>
  );
}
