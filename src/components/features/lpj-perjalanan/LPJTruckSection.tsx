import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LPJTruckSectionProps {
  values: {
    driver: string;
    noPolisi: string;
    tglBerangkat: string;
    tglKembali: string;
    ruteAsal: string;
    ruteTujuan: string;
  };
  errors: Partial<Record<string, string>>;
  onValueChange: (field: string, value: string) => void;
}

export function LPJTruckSection({ values, errors, onValueChange }: LPJTruckSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">Data Truk & Rute</h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="driver">
            Nama Driver <span className="text-red-500">*</span>
          </Label>
          <Input id="driver" placeholder="Masukkan nama driver" value={values.driver} onChange={(e) => onValueChange('driver', e.target.value)} className={errors.driver ? 'border-red-500' : ''} />
          {errors.driver && <p className="text-xs text-red-500">{errors.driver}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="noPolisi">
            No Polisi <span className="text-red-500">*</span>
          </Label>
          <Input id="noPolisi" placeholder="Masukkan nomor polisi" value={values.noPolisi} onChange={(e) => onValueChange('noPolisi', e.target.value)} className={errors.noPolisi ? 'border-red-500' : ''} />
          {errors.noPolisi && <p className="text-xs text-red-500">{errors.noPolisi}</p>}
        </div>

        <div className="space-y-2">
          <Label>
            Tanggal Berangkat <span className="text-red-500">*</span>
          </Label>
          <DatePicker value={values.tglBerangkat || null} onChange={(date) => onValueChange('tglBerangkat', date ? date.toISOString().slice(0, 10) : '')} placeholder="Pick a date" className={errors.tglBerangkat ? 'border-red-500' : ''} />
          {errors.tglBerangkat && <p className="text-xs text-red-500">{errors.tglBerangkat}</p>}
        </div>

        <div className="space-y-2">
          <Label>Tanggal Kembali</Label>
          <DatePicker value={values.tglKembali || null} onChange={(date) => onValueChange('tglKembali', date ? date.toISOString().slice(0, 10) : '')} placeholder="Pick a date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ruteTujuan">
            Rute Tujuan <span className="text-red-500">*</span>
          </Label>
          <Input id="ruteTujuan" placeholder="Tambahkan rute" value={values.ruteTujuan} onChange={(e) => onValueChange('ruteTujuan', e.target.value)} className={errors.ruteTujuan ? 'border-red-500' : ''} />
          {errors.ruteTujuan && <p className="text-xs text-red-500">{errors.ruteTujuan}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ruteAsal">
            Rute Asal <span className="text-red-500">*</span>
          </Label>
          <Input id="ruteAsal" placeholder="Tambahkan rute" value={values.ruteAsal} onChange={(e) => onValueChange('ruteAsal', e.target.value)} className={errors.ruteAsal ? 'border-red-500' : ''} />
          {errors.ruteAsal && <p className="text-xs text-red-500">{errors.ruteAsal}</p>}
        </div>
      </div>
    </section>
  );
}
