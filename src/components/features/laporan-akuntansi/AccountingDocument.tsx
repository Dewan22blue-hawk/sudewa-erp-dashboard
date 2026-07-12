import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AccountingDocumentProps {
  companyName: string;
  title: string;
  periodLabel: string;
  children: ReactNode;
  className?: string;
}

export default function AccountingDocument({
  companyName,
  title,
  periodLabel,
  children,
  className,
}: AccountingDocumentProps) {
  return (
    <section
      className={cn(
        'rounded-[28px] border border-[#e5e7eb] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] sm:p-8 print:rounded-none print:border print:shadow-none',
        className,
      )}
    >
      <header className="space-y-2 pb-8 text-center">
        <h2 className="text-xl font-semibold text-[#111827] sm:text-[22px]">
          {companyName}
        </h2>
        <p className="text-[18px] font-semibold text-[#111827]">{title}</p>
        <p className="text-lg text-[#111827]">{periodLabel}</p>
      </header>

      {children}
    </section>
  );
}
