import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ACCOUNTING_REPORT_TAB_QUERY_MAP } from '@/components/features/laporan-akuntansi/laporan-akuntansi.constants';

export default function LaporanAkuntansiLegacyTypePage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
    const type = typeof router.query.type === 'string' ? router.query.type : '';
    const mappedTab = ACCOUNTING_REPORT_TAB_QUERY_MAP[type] ?? 'profit-loss';
    const month = typeof router.query.bulan === 'string' ? router.query.bulan.padStart(2, '0') : '01';
    const year = typeof router.query.tahun === 'string' ? router.query.tahun : '2025';

    void router.replace({
      pathname: '/dashboard/[slug]/laporan/laporan-akuntansi',
      query: {
        slug,
        tab: mappedTab,
        period: `${year}-${month}-01`,
      },
    });
  }, [router]);

  return (
    <DashboardLayout>
      <div className="space-y-6 px-1">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-none">
          Mengalihkan ke tampilan laporan akuntansi terbaru...
        </div>
      </div>
    </DashboardLayout>
  );
}
