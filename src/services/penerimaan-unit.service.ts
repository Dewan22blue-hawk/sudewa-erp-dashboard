import { PenerimaanUnit, PenerimaanUnitDetail } from '@/@types/penerimaan-unit.types';

const suppliers = ['PT Mass Berg Mass', 'PT Astra Jaya', 'PT Nusantara Motor'];

const seedPenerimaan = (): PenerimaanUnit[] => {
  return Array.from({ length: 12 }).map((_, idx) => {
    const id = crypto.randomUUID();
    const nomor = (idx + 1).toString().padStart(4, '0');

    return {
      id,
      noPenerimaan: `PRU-${nomor}`,
      tanggal: `2025-01-${(idx % 28) + 1}`,
      supplier: suppliers[idx % suppliers.length],
      keterangan: idx % 2 === 0 ? 'Unit Honda XX' : 'Unit Mix',
    } satisfies PenerimaanUnit;
  });
};

const seedDetail = (penerimaan: PenerimaanUnit[]): PenerimaanUnitDetail[] => {
  const details: PenerimaanUnitDetail[] = [];

  penerimaan.forEach((penerimaanItem, idx) => {
    const detailCount = 8;
    for (let i = 0; i < detailCount; i++) {
      details.push({
        id: crypto.randomUUID(),
        penerimaanId: penerimaanItem.id,
        noPembelian: `TMU-${(8000 + idx).toString()}`,
        tipeUnit: 'Honda XX',
        warna: 'Hitam',
        noMesin: `Mesin ${(i + 1).toString().padStart(2, '0')}`,
        noRangka: `RANGKA ${(i + 1).toString().padStart(2, '0')}`,
        diterima: i % 3 === 0,
      });
    }
  });

  return details;
};

let penerimaanDB: PenerimaanUnit[] = seedPenerimaan();
let detailDB: PenerimaanUnitDetail[] = seedDetail(penerimaanDB);

export const getPenerimaanUnits = async () => [...penerimaanDB];

export const getPenerimaanUnitById = async (id: string) => penerimaanDB.find((p) => p.id === id);

export const createPenerimaanUnit = async (payload: Omit<PenerimaanUnit, 'id' | 'noPenerimaan'>) => {
  const nextNumber = (penerimaanDB.length + 1).toString().padStart(4, '0');
  const newData: PenerimaanUnit = {
    id: crypto.randomUUID(),
    noPenerimaan: `PRU-${nextNumber}`,
    ...payload,
  };

  penerimaanDB = [newData, ...penerimaanDB];
  return newData;
};

export const deletePenerimaanUnit = async (id: string) => {
  penerimaanDB = penerimaanDB.filter((p) => p.id !== id);
  detailDB = detailDB.filter((d) => d.penerimaanId !== id);
};

export const getPenerimaanDetail = async (penerimaanId: string) => detailDB.filter((d) => d.penerimaanId === penerimaanId);

export const bulkTerimaDetail = async (ids: string[]) => {
  detailDB = detailDB.map((d) => (ids.includes(d.id) ? { ...d, diterima: true } : d));
};

export const bulkDeleteDetail = async (ids: string[]) => {
  detailDB = detailDB.filter((d) => !ids.includes(d.id));
};
