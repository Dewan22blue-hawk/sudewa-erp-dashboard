'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LaporanHeaderAction from '@/components/features/laporan/LaporanHeaderAction';
import LaporanRugiLabaView from '@/components/features/laporan/LaporanRugiLabaView';
import LaporanNeracaView from '@/components/features/laporan/LaporanNeracaView';

export default function LaporanAkuntansiPage() {
  const params = useParams();
  const router = useRouter();
  const type = params?.type as string;
  const slug = params?.slug as string;

  // Map URL slug to readable title
  const getReportTitle = () => {
    switch (type) {
      case 'rugi-laba':
        return 'Laporan Rugi Laba';
      case 'neraca':
        return 'Neraca';
      case 'ppn-masukan-perbulan':
        return 'Laporan PPN Masukan Perbulan';
      case 'ppn-keluaran-perbulan':
        return 'Laporan PPN Keluaran Perbulan';
      case 'ppn-pertahun':
        return 'Laporan PPN Pertahun';
      default:
        return 'Laporan Akuntansi';
    }
  };

  const renderReportView = () => {
    if (type === 'rugi-laba') {
      return <LaporanRugiLabaView />;
    }
    if (type === 'neraca') {
      return <LaporanNeracaView />;
    }
    return <div className="bg-white border rounded-xl p-8 text-center text-gray-500">Silahkan pilih laporan dari menu sebelumnya atau sedang dalam pengembangan.</div>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/dashboard/${slug}/laporan/laporan-akuntansi`)} className="text-gray-500 hover:text-gray-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold">{getReportTitle()}</h1>
              <p className="text-sm text-gray-500">Lihat detail laporan akuntansi</p>
            </div>
          </div>

          <LaporanHeaderAction />
        </div>

        {renderReportView()}
      </div>
    </DashboardLayout>
  );
}
