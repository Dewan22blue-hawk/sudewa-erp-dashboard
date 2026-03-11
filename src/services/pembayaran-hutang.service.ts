import { PembayaranHutang, PembayaranHutangDetail } from '@/types/pembayaran-hutang.types';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate dummy data
const generateData = (): PembayaranHutang[] => {
  const data: PembayaranHutang[] = [];
  const suppliers = ['PT Mass Berg Ground', 'CV Maju Jaya', 'UD Sumber Makmur', 'PT Sinar Terang', 'CV Karya Mandiri'];
  const banks = ['BCA - IDR', 'Mandiri - IDR', 'BNI - IDR', 'Kas Besar'];

  for (let i = 1; i <= 150; i++) {
    const totalBayar = Math.floor(Math.random() * 50000000) + 1000000;
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const date = new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    data.push({
      id: i.toString(),
      kodeBayar: `TRX-${(100 + i).toString().padStart(3, '0')}`,
      kodeBeli: `INV-WIN/2026${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}02-${(1000 + i).toString().substring(1)}`,
      tanggal: date.toLocaleDateString('id-ID'),
      kasKeluar: bank,
      jumlahBayar: totalBayar,
      namaSupplier: supplier,
    });
  }
  return data;
};

const mockData: PembayaranHutang[] = generateData();

export const PembayaranHutangService = {
  getAll: () => mockData,

  deleteById: (id: string): boolean => {
    const idx = mockData.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    mockData.splice(idx, 1);
    return true;
  },

  getById: (id: string): PembayaranHutangDetail | null => {
    const item = mockData.find((d) => d.id === id);
    if (!item) return null;

    // Simulate related purchase data based on the payment item
    // In a real app, this would query the Purchase table
    const totalBeli = item.jumlahBayar * (1 + Math.random()); // Simulasi total beli > total bayar usually

    // Generate some fake history for this "purchase"
    const history: PembayaranHutang[] = [item];

    // Add maybe another random previous payment
    if (Math.random() > 0.5) {
      history.push({
        ...item,
        id: uuidv4(),
        kodeBayar: `TRX-${Math.floor(Math.random() * 900) + 100}`,
        tanggal: '01/01/2026',
        jumlahBayar: Math.floor(totalBeli * 0.2),
      });
    }

    const totalBayarAccumulated = history.reduce((acc, curr) => acc + curr.jumlahBayar, 0);

    return {
      id: item.kodeBeli, // Conceptually the ID of the Purchase
      noPembelian: item.kodeBeli,
      tanggal: item.tanggal,
      namaSupplier: item.namaSupplier,
      totalBeli: Math.floor(totalBeli),
      totalBayar: totalBayarAccumulated,
      amountHutang: Math.floor(totalBeli - totalBayarAccumulated),
      historyPembayaran: history.sort((a, b) => b.id.localeCompare(a.id)), // Simple sort
    };
  },
};
