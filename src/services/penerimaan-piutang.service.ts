import { PenerimaanPiutang, PenerimaanPiutangDetail } from '@/types/penerimaan-piutang.types';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate dummy data
const generateData = (): PenerimaanPiutang[] => {
  const data: PenerimaanPiutang[] = [];
  const banks = ['BCA IDR', 'Mandiri IDR', 'BNI IDR', 'Kas Besar'];

  for (let i = 1; i <= 150; i++) {
    const totalTerima = Math.floor(Math.random() * 50000000) + 1000000;
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const date = new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    data.push({
      id: i.toString(),
      kodeTerima: `TRM-${(100 + i).toString().padStart(3, '0')}`,
      kodeJual: `INV-WIN/2026${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}02-${(1000 + i).toString().substring(1)}`,
      tanggalTerima: date.toLocaleDateString('id-ID'),
      kasMasuk: bank,
      jumlahTerima: totalTerima,
    });
  }
  return data;
};

const mockData: PenerimaanPiutang[] = generateData();

export const PenerimaanPiutangService = {
  getAll: () => mockData,

  getById: (id: string): PenerimaanPiutangDetail | null => {
    const item = mockData.find((d) => d.id === id);
    if (!item) return null;

    // Simulate related sale data based on the payment item
    const totalJual = item.jumlahTerima * (1 + Math.random());

    // Generate some fake history
    const history: PenerimaanPiutang[] = [item];

    if (Math.random() > 0.5) {
      history.push({
        ...item,
        id: uuidv4(),
        kodeTerima: `TRM-${Math.floor(Math.random() * 900) + 100}`,
        tanggalTerima: '01/01/2026',
        jumlahTerima: Math.floor(totalJual * 0.2),
      });
    }

    const totalTerimaAccumulated = history.reduce((acc, curr) => acc + curr.jumlahTerima, 0);
    const customers = ['PT Mass Berg Ground', 'CV Maju Jaya', 'UD Sumber Makmur', 'PT Sinar Terang'];

    return {
      id: item.kodeJual,
      kodeJual: item.kodeJual,
      tanggal: item.tanggalTerima,
      customer: customers[Math.floor(Math.random() * customers.length)],
      totalJual: Math.floor(totalJual),
      totalTerima: totalTerimaAccumulated,
      totalPiutang: Math.floor(totalJual - totalTerimaAccumulated),
      payments: history.sort((a, b) => b.id.localeCompare(a.id)),
    };
  },
};
