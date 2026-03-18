import { Tarif } from './TarifTable';

export let DUMMY_TARIFS: Tarif[] = [
  { id: 1, namaDealer: 'CV Honda Jaya', provinsi: 'Yogyakarta', tujuan: 'Semarang', jarak: '100 km', day: 1, invCdd: 450000, invFuso: 350000, ujCdd: 500000, ujFuso: 350000 },
  { id: 2, namaDealer: 'PT Suzuki Makmur', provinsi: 'Jawa Tengah', tujuan: 'Solo', jarak: '60 km', day: 1, invCdd: 300000, invFuso: 250000, ujCdd: 350000, ujFuso: 250000 },
  { id: 3, namaDealer: 'Yamaha Mataram', provinsi: 'Jawa Timur', tujuan: 'Surabaya', jarak: '350 km', day: 2, invCdd: 1200000, invFuso: 950000, ujCdd: 1500000, ujFuso: 1000000 },
  { id: 4, namaDealer: 'Kawasaki Abadi', provinsi: 'DKI Jakarta', tujuan: 'Jakarta Selatan', jarak: '550 km', day: 3, invCdd: 2500000, invFuso: 1800000, ujCdd: 2800000, ujFuso: 2000000 },
  { id: 5, namaDealer: 'Toyota Nasmoco', provinsi: 'Jawa Barat', tujuan: 'Bandung', jarak: '450 km', day: 2, invCdd: 1800000, invFuso: 1400000, ujCdd: 2000000, ujFuso: 1500000 },
  { id: 6, namaDealer: 'Daihatsu Mandiri', provinsi: 'Banten', tujuan: 'Tangerang', jarak: '580 km', day: 3, invCdd: 2600000, invFuso: 1900000, ujCdd: 2900000, ujFuso: 2100000 },
  { id: 7, namaDealer: 'Mitsubishi Motors', provinsi: 'DI Yogyakarta', tujuan: 'Gunung Kidul', jarak: '45 km', day: 1, invCdd: 250000, invFuso: 200000, ujCdd: 300000, ujFuso: 200000 },
];

export const setDummyTarifs = (data: Tarif[]) => {
  DUMMY_TARIFS = data;
};
