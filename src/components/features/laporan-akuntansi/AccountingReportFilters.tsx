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
    <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-end justify-between w-full bg-white p-4 rounded-xl border border-slate-200 shadow-none">
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-slate-700">
          Periode Transaksi
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DatePicker
            value={selectedDate}
            onChange={(date) => onDateChange(date ?? selectedDate)}
            placeholder="Jan 20, 2025"
            className="w-full min-w-[260px] justify-start rounded-xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm sm:w-[340px]"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onShow}
            className="bg-[#f8f9fa] shadow-sm text-slate-700 hover:bg-slate-50 gap-2 border border-slate-200 rounded-xl px-4 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            Show
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onPrint}
          className="rounded-xl border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] px-5 text-sm font-medium text-white shadow-sm border-0 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Preparing...' : 'Download'}
        </Button>
      </div>
    </div>
  );
}
