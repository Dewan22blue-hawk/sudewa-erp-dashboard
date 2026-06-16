'use client';

import { Download, Eye, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

interface AccountingReportFiltersProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onShow: () => void;
  onPrint: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
}

export default function AccountingReportFilters({
  selectedDate,
  onDateChange,
  onShow,
  onPrint,
  onDownload,
  isDownloading = false,
}: AccountingReportFiltersProps) {
  return (
    <div className="print:hidden flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#111827]">
          Periode Transaksi
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DatePicker
            value={selectedDate}
            onChange={(date) => onDateChange(date ?? selectedDate)}
            placeholder="Jan 20, 2025"
            className="h-11 w-full min-w-[260px] justify-start rounded-xl border-[#d1d5db] bg-white text-sm text-[#111827] shadow-none sm:w-[340px]"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onShow}
            className="h-11 rounded-xl border-transparent bg-[#f3f4f6] px-6 text-sm font-medium text-[#111827] shadow-none hover:bg-[#e5e7eb]"
          >
            <Eye className="h-4 w-4" />
            Show
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start lg:self-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onPrint}
          className="h-11 rounded-xl border-[#d1d5db] bg-white px-5 text-sm font-medium text-[#111827] shadow-none hover:bg-[#f9fafb]"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="h-11 rounded-xl bg-[#06c755] px-5 text-sm font-medium text-white hover:bg-[#05b14c]"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Preparing...' : 'Download'}
        </Button>
      </div>
    </div>
  );
}
