import { Upload, X, FileImage } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { InvoiceUploadValue } from './create-invoice.data';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadFieldProps {
  title: string;
  value: InvoiceUploadValue | null;
  onSelect: (file: File | null) => void;
  error?: string;
}

function UploadField({ title, value, onSelect, error }: UploadFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      onSelect(null);
      return;
    }
    onSelect(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(null);
  };

  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <FileImage className="h-5 w-5 flex-shrink-0 text-blue-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-blue-700">{value.fileName}</p>
            <p className="text-xs text-blue-500">{(value.fileSize / 1024).toFixed(1)} KB</p>
          </div>
          <button type="button" onClick={handleRemove} className="flex-shrink-0 rounded-full p-1 text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
          }`}
        >
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
          <div className="space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white">
              <Upload className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">Klik untuk upload dokumen</p>
            <p className="text-xs text-gray-400">PNG, JPG maksimal 5MB</p>
          </div>
        </label>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface InvoiceAttachmentSectionProps {
  values: {
    lampiran1: InvoiceUploadValue | null;
    lampiran2: InvoiceUploadValue | null;
    lampiran3: InvoiceUploadValue | null;
  };
  errors: Partial<Record<string, string>>;
  onFileChange: (field: 'lampiran1' | 'lampiran2' | 'lampiran3', file: File | null) => void;
}

export function InvoiceAttachmentSection({ values, errors, onFileChange }: InvoiceAttachmentSectionProps) {
  const handleFileSelect = (field: 'lampiran1' | 'lampiran2' | 'lampiran3') => (file: File | null) => {
    if (!file) {
      onFileChange(field, null);
      return;
    }

    const isValidType = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isValidType) {
      // We'll handle error via parent, but for now just skip
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      return;
    }

    onFileChange(field, file);
  };

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">Lampiran Dokumen</h4>

      <div className="space-y-4">
        <UploadField title="Lampiran 1" value={values.lampiran1} onSelect={handleFileSelect('lampiran1')} error={errors.lampiran1} />
        <UploadField title="Lampiran 2" value={values.lampiran2} onSelect={handleFileSelect('lampiran2')} error={errors.lampiran2} />
        <UploadField title="Lampiran 3" value={values.lampiran3} onSelect={handleFileSelect('lampiran3')} error={errors.lampiran3} />
      </div>
    </section>
  );
}
