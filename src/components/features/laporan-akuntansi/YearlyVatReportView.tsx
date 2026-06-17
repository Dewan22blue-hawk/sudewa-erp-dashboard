import { YearlyVatReport } from '@/@types/accounting-report.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatAccountingNumber } from './laporan-akuntansi.utils';

interface YearlyVatReportViewProps {
  report: YearlyVatReport;
}

export default function YearlyVatReportView({
  report,
}: YearlyVatReportViewProps) {
  return (
    <section className="rounded-[28px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)] sm:p-6 print:rounded-none print:border print:shadow-none">
      <header className="space-y-2 pb-10 text-center">
        <h2 className="text-lg font-semibold text-[#111827]">{report.reportTitle}</h2>
        <p className="text-base font-semibold text-[#111827]">{report.companyName}</p>
        <p className="text-2xl font-semibold text-[#111827]">{report.periodLabel}</p>
      </header>

      <div className="overflow-x-auto">
        <Table className="min-w-[1150px] border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="cursor-default bg-[#27496d] hover:bg-[#27496d] hover:shadow-none">
              <TableHead rowSpan={2} className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-semibold text-white">
                MASA
              </TableHead>
              <TableHead colSpan={3} className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-semibold text-white">
                PAJAK PERTAMBAHAN NILAI MASUKAN
              </TableHead>
              <TableHead colSpan={3} className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-semibold text-white">
                PAJAK PERTAMBAHAN NILAI KELUARAN
              </TableHead>
              <TableHead colSpan={2} className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-semibold text-white">
                KETERANGAN
              </TableHead>
            </TableRow>
            <TableRow className="cursor-default bg-[#27496d] hover:bg-[#27496d] hover:shadow-none">
              <TableHead className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-medium text-white">
                HARGA BELI
              </TableHead>
              <TableHead className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-medium text-white">
                DPP BELI
              </TableHead>
              <TableHead className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-medium text-white">
                PPN 11%
              </TableHead>
              <TableHead className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-medium text-white">
                HARGA JUAL
              </TableHead>
              <TableHead className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-medium text-white">
                DPP JUAL
              </TableHead>
              <TableHead className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-medium text-white">
                PPN 11%
              </TableHead>
              <TableHead className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-medium text-white">
                SALDO PPN
              </TableHead>
              <TableHead className="border border-[#b6c8da] px-4 py-3 text-center text-sm font-medium text-white">
                LEBIH/KURANG BAYAR
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.rows.map((row) => (
              <TableRow
                key={row.masa}
                className="cursor-default hover:bg-transparent hover:shadow-none"
              >
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-sm">
                  {row.masa}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-right text-sm">
                  {formatAccountingNumber(row.inputPurchasePrice)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-right text-sm">
                  {formatAccountingNumber(row.inputDpp)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-right text-sm">
                  {formatAccountingNumber(row.inputVat)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-right text-sm">
                  {formatAccountingNumber(row.outputSalesPrice)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-right text-sm">
                  {formatAccountingNumber(row.outputDpp)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-right text-sm">
                  {formatAccountingNumber(row.outputVat)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-right text-sm">
                  {formatAccountingNumber(row.saldoPpn)}
                </TableCell>
                <TableCell className="border border-[#e5e7eb] px-4 py-3 text-center text-sm">
                  {row.paymentStatus}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="cursor-default bg-[#f8fafc] font-semibold hover:bg-[#f8fafc] hover:shadow-none">
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-sm">
                TOTAL
              </TableCell>
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-right text-sm">
                {formatAccountingNumber(report.totals.inputPurchasePrice)}
              </TableCell>
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-right text-sm">
                {formatAccountingNumber(report.totals.inputDpp)}
              </TableCell>
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-right text-sm">
                {formatAccountingNumber(report.totals.inputVat)}
              </TableCell>
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-right text-sm">
                {formatAccountingNumber(report.totals.outputSalesPrice)}
              </TableCell>
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-right text-sm">
                {formatAccountingNumber(report.totals.outputDpp)}
              </TableCell>
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-right text-sm">
                {formatAccountingNumber(report.totals.outputVat)}
              </TableCell>
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-right text-sm">
                {formatAccountingNumber(report.totals.saldoPpn)}
              </TableCell>
              <TableCell className="border border-[#dbe4f0] px-4 py-3 text-center text-sm">
                -
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
