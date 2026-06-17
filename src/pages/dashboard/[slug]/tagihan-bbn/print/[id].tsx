import * as React from 'react';
import { ChevronLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/router';
import { useReactToPrint } from 'react-to-print';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useKas } from '@/hooks/useKas';
import {
  useBBNBillDetail,
  useBBNBillBillings,
  useBBNBillBillingItems,
} from '@/hooks/useBBNBill';
import { useCompany } from '@/contexts/CompanyContext';
import { BBNBillPrintDocument } from '@/components/features/tagihan-bbn/BBNBillPrintDocument';
import { formatBillCode, getCashLabel } from '@/components/features/tagihan-bbn/utils';

export default function BBNBillPrintPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { companyId } = useCompany();
  const safeCompanyId = companyId || '1';

  const idStr = typeof id === 'string' ? id : null;

  const detailQuery = useBBNBillDetail(idStr);
  const billingsQuery = useBBNBillBillings({ page: 1, perPage: 1000 });
  const billingItemsQuery = useBBNBillBillingItems({ page: 1, perPage: 1000 });
  const kasQuery = useKas(safeCompanyId);

  const cashLabelMap = React.useMemo(() => {
    const map = new Map<number, string>();
    (kasQuery.data?.data ?? []).forEach((cash) => {
      map.set(Number(cash.id), getCashLabel(cash));
    });
    return map;
  }, [kasQuery.data?.data]);

  const billings = React.useMemo(() => {
    const currentId = Number(idStr || 0);
    const fromList = (billingsQuery.data?.data ?? []).filter((item) => item.bbnBillId === currentId);
    if (fromList.length > 0) return fromList;
    return (detailQuery.data?.billings ?? []).map((item) => ({
      id: item.id,
      uuid: item.uuid,
      bbnBillId: item.bbnBillId,
      totalPayment: item.totalPayment,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      bbnBill: null,
    }));
  }, [billingsQuery.data?.data, detailQuery.data?.billings, idStr]);

  const billingIds = React.useMemo(() => new Set(billings.map((item) => item.id)), [billings]);

  const paymentItems = React.useMemo(() => {
    return (billingItemsQuery.data?.data ?? [])
      .filter((item) => billingIds.has(item.bbnBillBillingId))
      .map((item) => {
        const cashIdNum = item.cashId ? Number(item.cashId) : 0;
        const rawLabel = cashLabelMap.get(cashIdNum) || item.cashLabel || 'Cash';
        const label = (() => {
          const upper = rawLabel.toUpperCase();
          if (upper.includes('USD')) return 'BCA USD';
          if (upper.includes('BCA')) return 'BCA IDR';
          return 'CASH IDR';
        })();
        return { ...item, cashLabel: label };
      });
  }, [billingIds, billingItemsQuery.data?.data, cashLabelMap]);

  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: detailQuery.data
      ? `Tagihan-BBN-${detailQuery.data.code || formatBillCode(detailQuery.data.id)}`
      : 'Tagihan-BBN',
    pageStyle: `
      @page { size: A4; margin: 15mm; }
      @media print {
        body * { visibility: visible !important; }
        body { background: white !important; color: black !important; }
        .no-print { display: none !important; }
      }
    `,
  });

  const isLoading =
    !router.isReady ||
    detailQuery.isLoading ||
    billingsQuery.isLoading ||
    billingItemsQuery.isLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat data tagihan BBN...</div>
      </DashboardLayout>
    );
  }

  if (!detailQuery.data) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Data tagihan BBN tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Toolbar — hidden on print */}
        <div className="no-print flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${slug}/tagihan-bbn/${idStr}`)}
              className="rounded-md p-1 transition-colors hover:bg-slate-100"
            >
              <ChevronLeft className="h-5 w-5 text-slate-500" />
            </button>
            <div>
              <h1 className="text-[18px] font-semibold text-slate-900">
                Tagihan BBN — {detailQuery.data.code || formatBillCode(detailQuery.data.id)}
              </h1>
              <p className="text-sm text-slate-500">
                Dealer: {detailQuery.data.dealer?.name || '-'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => handlePrint()}
            className="gap-2 rounded-xl bg-[#1f4163] hover:bg-[#183552]"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>

        {/* Print Preview */}
        <div className="flex justify-center bg-slate-50 py-8">
          <div
            ref={printRef}
            id="tagihan-bbn-print"
            className="w-[210mm] min-h-[297mm] rounded border border-slate-200 bg-white p-[15mm] shadow-md"
          >
            <BBNBillPrintDocument data={detailQuery.data} paymentItems={paymentItems} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
