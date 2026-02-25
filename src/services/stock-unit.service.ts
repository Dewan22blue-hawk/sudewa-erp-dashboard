import { StockStatus, StockUnit } from '@/@types/stock-unit.types';

const suppliers = ['PT Mass Berg Mass', 'PT Astra Jaya', 'PT Nusantara Motor'];
const customers = ['PT Jack Owe Me', 'PT Auto Prime', 'PT Velocity Motors'];
const statusCycle: StockStatus[] = ['in_transit', 'available', 'reserved'];

const stockDB: StockUnit[] = Array.from({ length: 100 }).map((_, index) => {
  const id = index + 1;
  const status = statusCycle[index % statusCycle.length];

  return {
    id: id.toString(),
    tipeUnit: `Honda XX ${id.toString().padStart(2, '0')}`,
    warna: index % 3 === 0 ? 'Hitam' : index % 3 === 1 ? 'Putih' : 'Merah',
    noMesin: `Mesin ${id.toString().padStart(3, '0')}`,
    noRangka: `RANGKA ${id.toString().padStart(3, '0')}`,
    supplier: suppliers[index % suppliers.length],
    customer: status === 'available' ? null : customers[index % customers.length],
    status,
  } as StockUnit;
});

export const getStockUnits = async (): Promise<StockUnit[]> => {
  return [...stockDB];
};

export const getStockUnitById = async (id: string): Promise<StockUnit | undefined> => {
  return stockDB.find((unit) => unit.id === id);
};
