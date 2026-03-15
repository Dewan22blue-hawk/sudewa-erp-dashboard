import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface LPJCargoSectionProps {
  values: {
    jumlahMotor: string;
    nomorRangkaText: string;
  };
  errors: Partial<Record<string, string>>;
  onValueChange: (field: string, value: string) => void;
}

export function LPJCargoSection({ values, errors, onValueChange }: LPJCargoSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">Data Angkut</h4>

      <div className="space-y-4">
        <div className="max-w-sm space-y-2">
          <Label htmlFor="jumlahMotor">
            Jumlah Motor <span className="text-red-500">*</span>
          </Label>
          <Input id="jumlahMotor" type="number" placeholder="Masukkan jumlah" value={values.jumlahMotor} onChange={(e) => onValueChange('jumlahMotor', e.target.value)} className={errors.jumlahMotor ? 'border-red-500' : ''} />
          {errors.jumlahMotor && <p className="text-xs text-red-500">{errors.jumlahMotor}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nomorRangkaText">
            Nomor rangka <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="nomorRangkaText"
            value={values.nomorRangkaText}
            onChange={(e) => onValueChange('nomorRangkaText', e.target.value)}
            placeholder="Masukkan nomor rangka motor, pisahkan dengan enter untuk setiap motor"
            className={`min-h-35 resize-none ${errors.nomorRangkaText ? 'border-red-500' : ''}`}
          />
          {errors.nomorRangkaText && <p className="text-xs text-red-500">{errors.nomorRangkaText}</p>}
          <div className="text-xs text-gray-500 space-y-2">
            <p>Contoh:</p>
            <p>MH1JFB110FK123456</p>
            <p>MH1JFB110FK789012</p>
            <p>MH1JFB110FK345678</p>
          </div>
        </div>
      </div>
    </section>
  );
}
