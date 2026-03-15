import { PengeluaranUnit, PengeluaranUnitDetail } from '@/@types/pengeluaran-unit.types';
import { v4 as uuidv4 } from 'uuid';

const customers = ['PT Mass Berg Mass', 'PT Jaya Makmur', 'PT Sentosa Abadi'];

const seedPengeluaran = (): PengeluaranUnit[] => {
  return Array.from({ length: 12 }).map((_, idx) => {
    const id = uuidv4();
    const nomor = (idx + 1).toString().padStart(4, '0');

    return {
      id,
      noPengeluaran: `xx${nomor}`,
      tanggal: `30/12/2025`,
      customer: customers[idx % customers.length],
      supplier: 'PT XX',
      keterangan: '-',
    } satisfies PengeluaranUnit;
  });
};

const seedDetail = (pengeluaran: PengeluaranUnit[]): PengeluaranUnitDetail[] => {
  const details: PengeluaranUnitDetail[] = [];

  pengeluaran.forEach((item) => {
    const detailCount = 8;
    for (let i = 0; i < detailCount; i++) {
      details.push({
        id: uuidv4(),
        pengeluaranId: item.id,
        kodeJual: `Honda XX`,
        tipeUnit: 'ABC',
        warna: 'Hitam',
        noMesin: `Mesin ${(i + 1).toString().padStart(2, '0')}`,
        noRangka: `RANGKA ${(i + 1).toString().padStart(2, '0')}`,
        dikirim: i % 3 === 0,
      });
    }
  });

  return details;
};

let pengeluaranDB: PengeluaranUnit[] = seedPengeluaran();
let detailDB: PengeluaranUnitDetail[] = seedDetail(pengeluaranDB);

export const getPengeluaranUnits = async () => [...pengeluaranDB];

export const getPengeluaranUnitById = async (id: string) => pengeluaranDB.find((p) => p.id === id);

export const createPengeluaranUnit = async (payload: Omit<PengeluaranUnit, 'id' | 'noPengeluaran'>) => {
  const nextNumber = (pengeluaranDB.length + 1).toString().padStart(4, '0');
  const newData: PengeluaranUnit = {
    id: uuidv4(),
    noPengeluaran: `xx${nextNumber}`,
    ...payload,
  };

  pengeluaranDB = [newData, ...pengeluaranDB];
  return newData;
};

export const updatePengeluaranUnit = async (id: string, payload: Partial<PengeluaranUnit>) => {
  const index = pengeluaranDB.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Pengeluaran Unit not found');

  const updated = { ...pengeluaranDB[index], ...payload };
  pengeluaranDB[index] = updated;
  return updated;
};

export const deletePengeluaranUnit = async (id: string) => {
  pengeluaranDB = pengeluaranDB.filter((p) => p.id !== id);
  detailDB = detailDB.filter((d) => d.pengeluaranId !== id);
};

export const getPengeluaranDetail = async (pengeluaranId: string) => detailDB.filter((d) => d.pengeluaranId === pengeluaranId);

export const bulkKirimDetail = async (ids: string[]) => {
  detailDB = detailDB.map((d) => (ids.includes(d.id) ? { ...d, dikirim: true } : d));
};

export const bulkDeleteDetail = async (ids: string[]) => {
  detailDB = detailDB.filter((d) => !ids.includes(d.id));
};
