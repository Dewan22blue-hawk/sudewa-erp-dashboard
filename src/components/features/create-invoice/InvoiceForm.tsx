import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { InvoiceExpeditionSection } from './InvoiceExpeditionSection';
import { InvoiceCustomerSection } from './InvoiceCustomerSection';
import { InvoiceNotesSection } from './InvoiceNotesSection';
import { InvoiceCostTable } from './InvoiceCostTable';
import { InvoiceAttachmentSection } from './InvoiceAttachmentSection';
import type { InvoiceFormValues, InvoiceCostItem, InvoiceUploadValue } from './create-invoice.data';
import { buildInvoiceFormDefaults } from './create-invoice.data';

interface InvoiceFormProps {
  defaultValues?: InvoiceFormValues;
  onSubmit: (values: InvoiceFormValues) => void;
  onCancel: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function InvoiceForm({ defaultValues, onSubmit, onCancel }: InvoiceFormProps) {
  const [values, setValues] = useState<InvoiceFormValues>(defaultValues ?? buildInvoiceFormDefaults());
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleValueChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleItemsChange = (items: InvoiceCostItem[]) => {
    setValues((prev) => ({ ...prev, rincianBiaya: items }));
  };

  const handleFileChange = (field: 'lampiran1' | 'lampiran2' | 'lampiran3', file: File | null) => {
    if (!file) {
      setValues((prev) => ({ ...prev, [field]: null }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
      return;
    }

    const isValidType = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isValidType) {
      setErrors((prev) => ({ ...prev, [field]: 'File harus PNG atau JPG' }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, [field]: 'Ukuran maksimal file 5MB' }));
      return;
    }

    const uploadValue: InvoiceUploadValue = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    };

    setValues((prev) => ({ ...prev, [field]: uploadValue }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<string, string>> = {};
    if (!values.nomorInvoice.trim()) nextErrors.nomorInvoice = 'Nomor invoice wajib diisi';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InvoiceExpeditionSection
        values={{
          nomorInvoice: values.nomorInvoice,
          lampiran: values.lampiran,
          perihal: values.perihal,
          tanggal: values.tanggal,
        }}
        errors={errors}
        onValueChange={handleValueChange}
      />

      <InvoiceCustomerSection
        values={{
          namaCustomer: values.namaCustomer,
          alamat: values.alamat,
        }}
        errors={errors}
        onValueChange={handleValueChange}
      />

      <InvoiceNotesSection values={{ catatanTambahan: values.catatanTambahan }} onValueChange={handleValueChange} />

      <InvoiceCostTable items={values.rincianBiaya} onItemsChange={handleItemsChange} />

      <InvoiceAttachmentSection
        values={{
          lampiran1: values.lampiran1,
          lampiran2: values.lampiran2,
          lampiran3: values.lampiran3,
        }}
        errors={errors}
        onFileChange={handleFileChange}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#152e4d] gap-2">
          <FileText className="h-4 w-4" />
          Buat Invoice
        </Button>
      </div>
    </form>
  );
}
