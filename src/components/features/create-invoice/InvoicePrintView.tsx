import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import type { InvoiceRecord } from './create-invoice.data';
import { formatDate, formatCurrency } from './create-invoice.data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/router';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';

interface InvoicePrintViewProps {
  invoice: InvoiceRecord;
}

export function InvoicePrintView({ invoice }: InvoicePrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { companyId } = useCompany();

  const resolvedCompanyId = resolveCompanyId(router.query.slug, companyId);
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId) || '/invoice-letter/1-morindo-letter.jpeg';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${invoice.nomorInvoice}`,
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
        .print-container {
          width: 210mm;
          min-height: 297mm;
          position: relative;
          page-break-inside: avoid;
        }
      }
    `,
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: printRef.current.scrollWidth,
        height: printRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Invoice-${invoice.nomorInvoice}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const totalInvoice = invoice.rincianBiaya.reduce((sum, item) => sum + item.invoiceEkspedisi, 0);
  const totalBiayaTambahan = invoice.rincianBiaya.reduce((sum, item) => sum + item.biayaTambahan, 0);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="no-print flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button type="button" onClick={() => handlePrint()} className="bg-[#1e3a5f] hover:bg-[#152e4d] gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Invoice Document */}
      <div
        ref={printRef}
        className="print-container relative mx-auto bg-white"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* Background Letter Template */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={selectedPrintBackground} alt="Invoice Letter Template" className="absolute inset-0 h-full w-full object-cover" style={{ zIndex: 0 }} />

        {/* Invoice Content Overlay */}
        <div
          className="relative"
          style={{
            zIndex: 1,
            padding: '0',
            width: '100%',
            minHeight: '297mm',
          }}
        >
          {/* Header area - leave space for the letterhead */}
          <div style={{ paddingTop: '42mm', paddingLeft: '20mm', paddingRight: '20mm' }}>
            {/* Invoice Meta Info - Left side */}
            <div className="flex justify-between" style={{ marginBottom: '6mm' }}>
              <div style={{ fontSize: '9pt', lineHeight: '1.6' }}>
                <div>
                  <span style={{ display: 'inline-block', width: '18mm', fontWeight: 'normal' }}>Nomor</span>
                  <span style={{ marginRight: '4px' }}>:</span>
                  <span style={{ fontWeight: '600' }}>{invoice.nomorInvoice}</span>
                </div>
                <div>
                  <span style={{ display: 'inline-block', width: '18mm', fontWeight: 'normal' }}>Lampiran</span>
                  <span style={{ marginRight: '4px' }}>:</span>
                  <span>{invoice.lampiran || '-'}</span>
                </div>
                <div>
                  <span style={{ display: 'inline-block', width: '18mm', fontWeight: 'normal' }}>Perihal</span>
                  <span style={{ marginRight: '4px' }}>:</span>
                  <span>{invoice.perihal || 'Invoice Ekspedisi'}</span>
                </div>
              </div>

              {/* Right side - Location & Date */}
              <div style={{ fontSize: '9pt', textAlign: 'right' }}>
                <div>Yogyakarta, {formatDate(invoice.tanggal)}</div>
              </div>
            </div>

            {/* Recipient */}
            <div style={{ fontSize: '9pt', marginBottom: '6mm', lineHeight: '1.6' }}>
              <div>Kepada</div>
              <div>
                Yth. <strong>{invoice.namaCustomer}</strong>
              </div>
              {invoice.alamat && <div style={{ maxWidth: '80mm', whiteSpace: 'pre-line' }}>{invoice.alamat}</div>}
              <div>Di Tempat</div>
            </div>

            {/* INVOICE Title */}
            <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
              <strong style={{ fontSize: '11pt', letterSpacing: '2px', textDecoration: 'underline' }}>INVOICE</strong>
            </div>

            {/* Notes / Payment Terms */}
            {invoice.catatanTambahan && (
              <div style={{ fontSize: '8.5pt', marginBottom: '5mm', lineHeight: '1.7' }}>
                {invoice.catatanTambahan.split('\n').map((line, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '4px' }}>
                    {line.match(/^\d+\./) ? (
                      <>
                        <span style={{ flexShrink: 0 }}>{line.match(/^\d+\./)?.[0]}</span>
                        <span>{line.replace(/^\d+\.\s*/, '')}</span>
                      </>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Terlampir label */}
            <div style={{ fontSize: '9pt', marginBottom: '3mm' }}>
              <em>*Terlampir</em>
            </div>

            {/* Cost Detail Table */}
            {invoice.rincianBiaya.length > 0 && (
              <div style={{ marginBottom: '5mm' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '7.5pt',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#1e3a5f', color: 'white' }}>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '6%' }}>NO</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '9%' }}>TANGGAL</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '9%' }}>NO POLISI</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '7%' }}>TYPE</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '10%' }}>DRIVER</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '9%' }}>MUAT</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '12%' }}>TUJUAN KIRIM</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '8%' }}>BONGKAR</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '9%' }}>NO SURAT DO</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '5%' }}>QTY</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '11%' }}>INV EKSPEDISI</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 4px', textAlign: 'center', width: '11%' }}>BIAYA TAMBAHAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.rincianBiaya.map((item, index) => (
                      <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'center' }}>{item.tanggal}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'center' }}>{item.noPolisi}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'center' }}>{item.type}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px' }}>{item.driver}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px' }}>{item.muat}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px' }}>{item.tujuanKirim}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px' }}>{item.bongkar}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px' }}>{item.noSuratDO}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(item.invoiceEkspedisi)}</td>
                        <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(item.biayaTambahan)}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                      <td colSpan={10} style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'right' }}>
                        TOTAL
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(totalInvoice)}</td>
                      <td style={{ border: '1px solid #ddd', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(totalBiayaTambahan)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer area - leave space for the letter footer */}
          <div style={{ height: '40mm' }} />
        </div>
      </div>
    </div>
  );
}
