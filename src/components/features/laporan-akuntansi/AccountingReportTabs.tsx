'use client';

import { AccountingReportTab } from '@/@types/accounting-report.types';
import { ACCOUNTING_REPORT_TABS } from './laporan-akuntansi.constants';
import { cn } from '@/lib/utils';

interface AccountingReportTabsProps {
  activeTab: AccountingReportTab;
  onChange: (tab: AccountingReportTab) => void;
}

export default function AccountingReportTabs({
  activeTab,
  onChange,
}: AccountingReportTabsProps) {
  return (
    <div className="print:hidden overflow-x-auto">
      <div className="inline-flex min-w-full rounded-[20px] bg-[#f3f4f6] p-1.5">
        {ACCOUNTING_REPORT_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'rounded-2xl px-4 py-3 text-sm font-medium text-[#1f2937] transition-all whitespace-nowrap',
              activeTab === tab.value
                ? 'bg-white shadow-[0_1px_4px_rgba(15,23,42,0.12)] ring-1 ring-black/5'
                : 'hover:text-black',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
