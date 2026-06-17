import { MonthlyVatReport } from '@/@types/accounting-report.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatAccountingNumber } from './laporan-akuntansi.utils';

interface MonthlyVatReportViewProps {
  report: MonthlyVatReport;
}

const HEADERS = [
  'TGL BELI',
  'PERUSAHAAN/DEALER',
  'TGL FPM',
  'NSFP MASUKAN',
  'TYPE UNIT',
  'NO MESIN',
  'NO RANGKA',
  'HARGA BELI',
  'BIAYA',
  'HARGA UNIT',
  'DPP BELI',
  'PPN',
] as const;

export default function MonthlyVatReportView({
  report,
}: MonthlyVatReportViewProps) {
  return (
    <section className="rounded-[28px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)] sm:p-6 print:rounded-none print:border print:shadow-none">
      <header className="space-y-1 pb-8 text-center">
        <h2 className="text-base font-semibold text-[#111827] sm:text-lg">
          {report.reportTitle}
        </h2>
        <p className="text-sm font-semibold text-[#111827] sm:text-base">
          {report.companyName}
        </p>
        <p className="text-sm text-[#111827]">{report.periodLabel}</p>
      </header>

      <div className="overflow-x-auto">
        <Table className="min-w-[1320px] border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="cursor-default hover:bg-transparent hover:shadow-none">
              {HEADERS.map((header) => (
                <TableHead
                  key={header}
                  className="h-11 border border-[#dbe4f0] bg-[#f8fafc] px-3 text-center text-[11px] font-semibold uppercase text-[#111827]"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.rows.map((row, index) => (
              <TableRow
                key={`${row.engineNumber}-${index}`}
                className="cursor-default hover:bg-transparent hover:shadow-none"
              >
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-xs">
                  {row.transactionDate}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-xs">
                  {row.partnerName}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-xs">
                  {row.invoiceDate}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-xs">
                  {row.taxInvoiceNumber}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-xs">
                  {row.unitType}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-xs">
                  {row.engineNumber}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-xs">
                  {row.frameNumber}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-right text-xs">
                  {formatAccountingNumber(row.purchasePrice)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-right text-xs">
                  {formatAccountingNumber(row.fee)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-right text-xs">
                  {formatAccountingNumber(row.unitPrice)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-right text-xs">
                  {formatAccountingNumber(row.dpp)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-3 py-2 text-right text-xs">
                  {formatAccountingNumber(row.vat)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="cursor-default bg-[#dff0ff] font-semibold hover:bg-[#dff0ff] hover:shadow-none">
              <TableCell colSpan={7} className="border border-[#c7deff] px-3 py-3 text-center text-xs">
                TOTAL
              </TableCell>
              <TableCell className="border border-[#c7deff] px-3 py-3 text-right text-xs">
                {formatAccountingNumber(report.totals.purchasePrice)}
              </TableCell>
              <TableCell className="border border-[#c7deff] px-3 py-3 text-right text-xs">
                {formatAccountingNumber(report.totals.fee)}
              </TableCell>
              <TableCell className="border border-[#c7deff] px-3 py-3 text-right text-xs">
                {formatAccountingNumber(report.totals.unitPrice)}
              </TableCell>
              <TableCell className="border border-[#c7deff] px-3 py-3 text-right text-xs">
                {formatAccountingNumber(report.totals.dpp)}
              </TableCell>
              <TableCell className="border border-[#c7deff] px-3 py-3 text-right text-xs">
                {formatAccountingNumber(report.totals.vat)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
