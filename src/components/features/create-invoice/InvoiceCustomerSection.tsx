import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { InvoiceFormValues } from './create-invoice.data';

interface InvoiceCustomerSectionProps {
  values: Pick<InvoiceFormValues, 'namaCustomer' | 'alamat'>;
  errors: Partial<Record<string, string>>;
  onValueChange: (field: string, value: string) => void;
}

export function InvoiceCustomerSection({ values, errors, onValueChange }: InvoiceCustomerSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">Informasi Customer</h4>

      <div className="space-y-4">
        {/* Nama Customer */}
        <div className="space-y-2">
          <Label htmlFor="namaCustomer">Nama Customer</Label>
          <Input id="namaCustomer" placeholder="Masukkan nama" value={values.namaCustomer} onChange={(e) => onValueChange('namaCustomer', e.target.value)} className={errors.namaCustomer ? 'border-red-500' : ''} />
          {errors.namaCustomer && <p className="text-xs text-red-500">{errors.namaCustomer}</p>}
        </div>

        {/* Alamat */}
        <div className="space-y-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Textarea id="alamat" placeholder="Masukkan alamat" value={values.alamat} onChange={(e) => onValueChange('alamat', e.target.value)} rows={3} className={errors.alamat ? 'border-red-500' : ''} />
          {errors.alamat && <p className="text-xs text-red-500">{errors.alamat}</p>}
        </div>
      </div>
    </section>
  );
}
