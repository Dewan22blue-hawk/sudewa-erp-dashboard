import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface LPJNotesSectionProps {
  values: {
    catatanKerusakan: string;
    catatanKeterlambatan: string;
    catatanTambahan: string;
  };
  onValueChange: (field: string, value: string) => void;
}

export function LPJNotesSection({ values, onValueChange }: LPJNotesSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">Catatan</h4>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="catatanKerusakan">Catatan Kerusakan</Label>
          <Textarea
            id="catatanKerusakan"
            value={values.catatanKerusakan}
            onChange={(e) => onValueChange('catatanKerusakan', e.target.value)}
            placeholder="Tuliskan jika ada kerusakan pada motor atau barang..."
            className="min-h-23 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="catatanKeterlambatan">Catatan Keterlambatan</Label>
          <Textarea
            id="catatanKeterlambatan"
            value={values.catatanKeterlambatan}
            onChange={(e) => onValueChange('catatanKeterlambatan', e.target.value)}
            placeholder="Tuliskan jika ada keterlambatan dan alasannya..."
            className="min-h-23 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="catatanTambahan">Catatan Tambahan</Label>
          <Textarea id="catatanTambahan" value={values.catatanTambahan} onChange={(e) => onValueChange('catatanTambahan', e.target.value)} placeholder="Catatan lain yang perlu disampaikan..." className="min-h-23 resize-none" />
        </div>
      </div>
    </section>
  );
}
