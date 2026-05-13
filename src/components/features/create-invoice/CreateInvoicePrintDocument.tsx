import { useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import { Download, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import type { CreateInvoicePrintPayload } from '@/@types/create-invoice.types';
import { Button } from '@/components/ui/button';
import { formatDisplayDate, formatLongDate, formatMoney } from './create-invoice.utils';

interface Props {
  payload: CreateInvoicePrintPayload;
  letterheadUrl: string;
}

const BANK_ACCOUNT_NUMBER = '456-631-1313';
const BANK_ACCOUNT_NAME = 'PT. WAJIRA JAGRATARA TRANSINDO';
const CONFIRMATION_WHATSAPP = '0878-8353-1313';
const PAYMENT_DUE_NOTE = 'Due date pembayaran 14 (Empat Belas) hari kerja setelah tanggal invoice dibuat';
const DEFAULT_PAYMENT_INTRO = 'Mohon pembayaran dapat dilakukan ke :';
const INVOICE_HEADER_BLUE = '#1f4163';
const INVOICE_HEADER_RGB = { r: 31, g: 65, b: 99 };

const formatPrintMoney = (value?: number | null) => formatMoney(value, 0);
const formatPdfMoney = (value?: number | null) => formatMoney(value, 0).replace(/\s+/g, '');

const TABLE_COLUMNS = [
  { key: 'no', label: 'NO', width: 6, align: 'center' as const },
  { key: 'tanggal', label: 'TANGGAL', width: 10, align: 'center' as const },
  { key: 'kodeDo', label: 'KODE DO', width: 14, align: 'left' as const },
  { key: 'noPolisi', label: 'NO POLISI', width: 11, align: 'left' as const },
  { key: 'type', label: 'TYPE', width: 7, align: 'left' as const },
  { key: 'driver', label: 'DRIVER', width: 13, align: 'left' as const },
  { key: 'loadingIn', label: 'LOADING IN', width: 10, align: 'left' as const },
  { key: 'tujuan', label: 'TUJUAN KIRIM', width: 12, align: 'left' as const },
  { key: 'loadingOut', label: 'LOADING OUT', width: 10, align: 'left' as const },
  { key: 'suratDo', label: 'NO SURAT DO', width: 9, align: 'left' as const },
  { key: 'qty', label: 'QTY', width: 5, align: 'center' as const },
  { key: 'suratJalan', label: 'NO SURAT JALAN', width: 10, align: 'left' as const },
  { key: 'invoice', label: 'INV', width: 18, align: 'right' as const },
  { key: 'tambahan', label: 'B. TAMBAHAN', width: 18, align: 'right' as const },
  { key: 'total', label: 'TOTAL', width: 18, align: 'right' as const },
];

const PDF_TABLE_COLUMNS = [
  { key: 'no', label: 'NO', width: 5, align: 'center' as const },
  { key: 'tanggal', label: 'TGL', width: 9, align: 'center' as const },
  { key: 'kodeDo', label: 'KODE DO', width: 12, align: 'left' as const },
  { key: 'noPolisi', label: 'NOPOL', width: 10, align: 'left' as const },
  { key: 'type', label: 'TYPE', width: 6, align: 'left' as const },
  { key: 'driver', label: 'DRIVER', width: 11, align: 'left' as const },
  { key: 'loadingIn', label: 'MUAT', width: 9, align: 'left' as const },
  { key: 'tujuan', label: 'TUJUAN', width: 10, align: 'left' as const },
  { key: 'loadingOut', label: 'BONGKAR', width: 9, align: 'left' as const },
  { key: 'suratDo', label: 'NO DO', width: 7, align: 'left' as const },
  { key: 'qty', label: 'QTY', width: 4, align: 'center' as const },
  { key: 'suratJalan', label: 'NO SJ', width: 7, align: 'left' as const },
  { key: 'invoice', label: 'INV', width: 18, align: 'right' as const },
  { key: 'tambahan', label: 'B.TAM', width: 18, align: 'right' as const },
  { key: 'total', label: 'TOTAL', width: 18, align: 'right' as const },
];

const TABLE_TOTAL_WIDTH = TABLE_COLUMNS.reduce((sum, column) => sum + column.width, 0);
const TABLE_START_X = (210 - TABLE_TOTAL_WIDTH) / 2;
const PDF_TABLE_TOTAL_WIDTH = PDF_TABLE_COLUMNS.reduce((sum, column) => sum + column.width, 0);
const PDF_TABLE_START_X = (210 - PDF_TABLE_TOTAL_WIDTH) / 2;

export function CreateInvoicePrintDocument({ payload, letterheadUrl }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const totalInvoice = useMemo(() => payload.rows.reduce((sum, row) => sum + row.invoiceExpedition, 0), [payload.rows]);
  const totalAdditional = useMemo(() => payload.rows.reduce((sum, row) => sum + row.additionalCost, 0), [payload.rows]);
  const totalPayment = useMemo(() => totalInvoice + totalAdditional, [totalAdditional, totalInvoice]);
  const paymentIntro = payload.draft.letterContent?.trim() || DEFAULT_PAYMENT_INTRO;
  const recipientAttentionLine = payload.recipientAttention?.trim() ? `u.p ${payload.recipientAttention.trim()}` : '';

  const loadImageAsDataUrl = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${payload.invoiceNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  const handleDownload = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 20;

    const drawLetterhead = async () => {
      if (!letterheadUrl) return;
      const imageData = await loadImageAsDataUrl(letterheadUrl);
      pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, pageHeight);
    };

    const drawTableHeader = (y: number) => {
      let currentX = PDF_TABLE_START_X;
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(5.1);
      pdf.setFont('helvetica', 'bold');

      PDF_TABLE_COLUMNS.forEach((column) => {
        pdf.setFillColor(INVOICE_HEADER_RGB.r, INVOICE_HEADER_RGB.g, INVOICE_HEADER_RGB.b);
        pdf.setDrawColor(255, 255, 255);
        pdf.rect(currentX, y, column.width, 8, 'FD');
        pdf.text(column.label, currentX + column.width / 2, y + 5, { align: 'center' });
        currentX += column.width;
      });

      pdf.setDrawColor(0, 0, 0);
      pdf.setTextColor(0, 0, 0);
      return PDF_TABLE_COLUMNS;
    };

    const drawWrappedCell = (
      lines: string[],
      x: number,
      y: number,
      width: number,
      height: number,
      align: 'left' | 'center' | 'right' = 'left',
    ) => {
      const baseY = y + 3.2;

      lines.forEach((line: string, index: number) => {
        const textX = align === 'center' ? x + width / 2 : align === 'right' ? x + width - 0.8 : x + 0.8;
        pdf.text(line, textX, baseY + index * 2.8, { align });
      });

      pdf.rect(x, y, width, height);
    };

    try {
      await drawLetterhead();

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('Nomor', marginX, 52);
      pdf.text(':', marginX + 20, 52);
      pdf.setFont('helvetica', 'bold');
      pdf.text(payload.invoiceNumber, marginX + 24, 52);

      pdf.setFont('helvetica', 'normal');
      pdf.text('Lampiran', marginX, 57);
      pdf.text(':', marginX + 20, 57);
      pdf.text(payload.draft.attachment || '-', marginX + 24, 57);

      pdf.text('Perihal', marginX, 62);
      pdf.text(':', marginX + 20, 62);
      pdf.setFont('helvetica', 'italic');
      pdf.text(payload.draft.subject || 'Invoice Ekspedisi', marginX + 24, 62);

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Yogyakarta, ${formatLongDate(payload.draft.date)}`, 146, 52);

      pdf.text('Kepada', 146, 64);
      pdf.text('Yth.', 146, 69);
      pdf.setFont('helvetica', 'bold');
      pdf.text(payload.draft.customerName || '-', 156, 69, { maxWidth: 38 });
      pdf.setFont('helvetica', 'normal');
      const placeLineY = recipientAttentionLine ? 79 : 74;
      if (recipientAttentionLine) {
        pdf.text(recipientAttentionLine, 156, 74, { maxWidth: 38 });
      }
      pdf.text('Di Tempat', 156, placeLineY);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('INVOICE', pageWidth / 2, 96, { align: 'center' });
      pdf.line(pageWidth / 2 - 10, 97, pageWidth / 2 + 10, 97);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.2);
      let cursorY = 108;
      pdf.text('1.', marginX, cursorY);
      pdf.text(paymentIntro, marginX + 6, cursorY);
      cursorY += 5;
      pdf.text('No. REK BCA', marginX + 6, cursorY);
      pdf.text(':', marginX + 34, cursorY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(BANK_ACCOUNT_NUMBER, marginX + 37, cursorY);
      pdf.setFont('helvetica', 'normal');
      cursorY += 5;
      pdf.text('Nama', marginX + 6, cursorY);
      pdf.text(':', marginX + 34, cursorY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(BANK_ACCOUNT_NAME, marginX + 37, cursorY);
      pdf.setFont('helvetica', 'normal');
      cursorY += 5;
      pdf.text('2.', marginX, cursorY);
      pdf.text(`Konfirmasi transfer dapat dilakukan ke no WA : ${CONFIRMATION_WHATSAPP}`, marginX + 6, cursorY);
      cursorY += 5;
      pdf.text('3.', marginX, cursorY);
      pdf.text(PAYMENT_DUE_NOTE, marginX + 6, cursorY, { maxWidth: 150 });

      pdf.setFont('helvetica', 'italic');
      pdf.text('*Terlampir', marginX, cursorY + 8);
      pdf.setFont('helvetica', 'normal');

      let tableY = cursorY + 14;
      let columns = drawTableHeader(tableY);
      tableY += 8;

      pdf.setFontSize(5.2);
      for (let index = 0; index < payload.rows.length; index += 1) {
        const row = payload.rows[index];
        const values = [
          String(index + 1),
          formatDisplayDate(row.date),
          row.doCode,
          row.noPolisi,
          row.type,
          row.driver,
          row.loadingIn,
          row.destination,
          row.loadingOut,
          row.doLetterCode,
          String(row.qty),
          row.doAssignmentCode,
          formatPdfMoney(row.invoiceExpedition),
          formatPdfMoney(row.additionalCost),
          formatPdfMoney(row.invoiceExpedition + row.additionalCost),
        ];
        const renderedLines = values.map((value, columnIndex) => {
          const column = columns[columnIndex];
          const safeText = value || '-';
          if (column.align === 'right') {
            return [safeText];
          }

          return pdf.splitTextToSize(safeText, Math.max(column.width - 1.5, 3)).slice(0, 2);
        });
        const maxLines = Math.max(...renderedLines.map((lines) => lines.length));
        const rowHeight = Math.max(8, 3 + maxLines * 2.8);

        if (tableY + rowHeight > 268) {
          pdf.addPage();
          await drawLetterhead();
          tableY = 48;
          columns = drawTableHeader(tableY);
          tableY += 8;
        }

        let currentX = PDF_TABLE_START_X;
        columns.forEach((column, columnIndex) => {
          drawWrappedCell(renderedLines[columnIndex], currentX, tableY, column.width, rowHeight, column.align);
          currentX += column.width;
        });
        tableY += rowHeight;
      }

      if (tableY + 10 <= 280) {
        const summaryBoxX = PDF_TABLE_START_X + PDF_TABLE_TOTAL_WIDTH - 58;
        const summaryLabelWidth = 24;
        const summaryValueWidth = 34;
        const summaryRowHeight = 7;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6);

        [
          ['INV EKSPEDISI', formatPdfMoney(totalInvoice)],
          ['BIAYA TAMBAHAN', formatPdfMoney(totalAdditional)],
          ['TOTAL PAYMENT', formatPdfMoney(totalPayment)],
        ].forEach(([label, value], index) => {
          const y = tableY + index * summaryRowHeight;
          pdf.setFillColor(index === 2 ? 225 : 245, index === 2 ? 244 : 248, index === 2 ? 234 : 250);
          pdf.rect(summaryBoxX, y, summaryLabelWidth, summaryRowHeight, 'F');
          pdf.rect(summaryBoxX + summaryLabelWidth, y, summaryValueWidth, summaryRowHeight, 'F');
          pdf.rect(summaryBoxX, y, summaryLabelWidth + summaryValueWidth, summaryRowHeight);
          pdf.text(label, summaryBoxX + summaryLabelWidth - 1.5, y + 4.5, { align: 'right' });
          pdf.text(value, summaryBoxX + summaryLabelWidth + summaryValueWidth - 1.5, y + 4.5, { align: 'right' });
        });
      }

      pdf.save(`Invoice-${payload.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Gagal membuat PDF invoice', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleDownload} className="gap-2 rounded-xl border-slate-200">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button type="button" onClick={() => handlePrint()} className="gap-2 rounded-xl bg-[#1f4163] hover:bg-[#183552]">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <div ref={printRef} className="relative mx-auto bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={letterheadUrl} alt="Letterhead" className="absolute inset-0 h-full w-full object-cover" />

        <div className="relative min-h-[297mm]" style={{ paddingTop: '42mm', paddingLeft: '20mm', paddingRight: '20mm' }}>
          <div className="flex justify-between text-[10pt] text-slate-900">
            <div className="space-y-1">
              <div><span className="inline-block w-[24mm]">Nomor</span>: <strong>{payload.invoiceNumber}</strong></div>
              <div><span className="inline-block w-[24mm]">Lampiran</span>: {payload.draft.attachment || '1 berkas.'}</div>
              <div><span className="inline-block w-[24mm]">Perihal</span>: <em>{payload.draft.subject || 'Invoice Ekspedisi'}</em></div>
            </div>
            <div>Yogyakarta, {formatLongDate(payload.draft.date)}</div>
          </div>

          <div className="mt-8 flex justify-between text-[10pt] text-slate-900">
            <div className="space-y-1">
              <div>Kepada</div>
              <div>Yth. <strong>{payload.draft.customerName || '-'}</strong></div>
              {recipientAttentionLine ? <div>{recipientAttentionLine}</div> : null}
              <div>Di Tempat</div>
            </div>
          </div>

          <div className="mt-10 text-center text-[12pt] font-semibold tracking-[0.18em] text-slate-900">
            <span className="border-b border-slate-900">INVOICE</span>
          </div>

          <div className="mx-auto mt-8 max-w-[170mm] text-[9pt] leading-5 text-slate-900">
            <div className="flex gap-2">
              <div className="w-4 shrink-0">1.</div>
              <div>
                <div>{paymentIntro}</div>
                <div className="flex gap-2">
                  <span className="inline-block w-[25mm]">No. REK BCA</span>
                  <span>:</span>
                  <strong>{BANK_ACCOUNT_NUMBER}</strong>
                </div>
                <div className="flex gap-2">
                  <span className="inline-block w-[25mm]">Nama</span>
                  <span>:</span>
                  <strong>{BANK_ACCOUNT_NAME}</strong>
                </div>
              </div>
            </div>
            <div className="mt-1 flex gap-2">
              <div className="w-4 shrink-0">2.</div>
              <div>Konfirmasi transfer dapat dilakukan ke no WA : {CONFIRMATION_WHATSAPP}</div>
            </div>
            <div className="mt-1 flex gap-2">
              <div className="w-4 shrink-0">3.</div>
              <div>{PAYMENT_DUE_NOTE}</div>
            </div>
          </div>

          <div className="mt-5 text-[9pt] italic text-slate-900">*Terlampir</div>

          <div className="mx-auto mt-5" style={{ width: '176mm' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '5.8pt' }}>
              <colgroup>
                {TABLE_COLUMNS.map((column) => (
                  <col key={column.key} style={{ width: `${(column.width / TABLE_TOTAL_WIDTH) * 100}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: INVOICE_HEADER_BLUE, color: '#ffffff' }}>
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      style={{ border: '1px solid #d9e1ea', padding: '4px 2px', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.15 }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payload.rows.map((row, index) => (
                  <tr key={`${row.invoiceId}-${index}`}>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', textAlign: 'center', wordBreak: 'break-word' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', textAlign: 'center', wordBreak: 'break-word' }}>{formatDisplayDate(row.date)}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.doCode}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.noPolisi}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.type}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.driver}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.loadingIn}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.destination}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.loadingOut}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.doLetterCode}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', textAlign: 'center', wordBreak: 'break-word' }}>{row.qty}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 3px', wordBreak: 'break-word' }}>{row.doAssignmentCode}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 2px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '5.5pt' }}>{formatPrintMoney(row.invoiceExpedition)}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 2px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '5.5pt' }}>{formatPrintMoney(row.additionalCost)}</td>
                    <td style={{ border: '1px solid #d9e1ea', padding: '4px 2px', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '5.5pt' }}>{formatPrintMoney(row.invoiceExpedition + row.additionalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 flex justify-end">
              <table style={{ width: '68mm', borderCollapse: 'collapse', fontSize: '6.1pt' }}>
                <tbody>
                  {[
                    ['INV EKSPEDISI', formatPrintMoney(totalInvoice)],
                    ['BIAYA TAMBAHAN', formatPrintMoney(totalAdditional)],
                    ['TOTAL PAYMENT', formatPrintMoney(totalPayment)],
                  ].map(([label, value], index) => (
                    <tr key={label} style={{ backgroundColor: index === 2 ? '#e1f4ea' : '#f8fafc', fontWeight: index === 2 ? 700 : 600 }}>
                      <td style={{ border: '1px solid #d9e1ea', padding: '4px 5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{label}</td>
                      <td style={{ border: '1px solid #d9e1ea', padding: '4px 5px', textAlign: 'right', whiteSpace: 'nowrap' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
