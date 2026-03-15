import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LPJOperationalCostSectionProps {
  values: {
    kmAwal: string;
    kmAkhir: string;
    biayaBBM: string;
    biayaTol: string;
    biayaLainnya: string;
  };
  errors: Partial<Record<string, string>>;
  totalKM: number;
  onValueChange: (field: string, value: string) => void;
}

export function LPJOperationalCostSection({ values, errors, totalKM, onValueChange }: LPJOperationalCostSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">KM & Biaya Operasional</h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="kmAwal">
            KM Awal <span className="text-red-500">*</span>
          </Label>
          <Input id="kmAwal" type="number" placeholder="Tambahkan km" value={values.kmAwal} onChange={(e) => onValueChange('kmAwal', e.target.value)} className={errors.kmAwal ? 'border-red-500' : ''} />
          {errors.kmAwal && <p className="text-xs text-red-500">{errors.kmAwal}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="kmAkhir">
            KM Akhir <span className="text-red-500">*</span>
          </Label>
          <Input id="kmAkhir" type="number" placeholder="Tambahkan km" value={values.kmAkhir} onChange={(e) => onValueChange('kmAkhir', e.target.value)} className={errors.kmAkhir ? 'border-red-500' : ''} />
          {errors.kmAkhir && <p className="text-xs text-red-500">{errors.kmAkhir}</p>}
        </div>

        <div className="space-y-2">
          <Label>Total KM</Label>
          <Input value={Number.isFinite(totalKM) ? String(totalKM) : '0'} readOnly className="bg-gray-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="biayaBBM">Biaya BBM</Label>
          <Input id="biayaBBM" type="number" placeholder="Tambahkan biaya" value={values.biayaBBM} onChange={(e) => onValueChange('biayaBBM', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="biayaTol">Biaya Tol</Label>
          <Input id="biayaTol" type="number" placeholder="Tambahkan biaya" value={values.biayaTol} onChange={(e) => onValueChange('biayaTol', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="biayaLainnya">Biaya Lainnya</Label>
          <Input id="biayaLainnya" type="number" placeholder="Tambahkan biaya" value={values.biayaLainnya} onChange={(e) => onValueChange('biayaLainnya', e.target.value)} />
        </div>
      </div>
    </section>
  );
}
