import { Driver } from './DriverTable';

export let DUMMY_DRIVERS: Driver[] = [
  {
    id: 1,
    namaDriver: 'Ella Young Widjayanto Nugraha',
    alamat: 'Jl. Raya Kalimalang No, Rt 000, Rw 000, Duren Sawit, Duren Sawit, Kota Adm. Jakarta Timur, DKI Jakarta 00000',
    handphone: '08xx xxxx xxxx',
    ktp: '00000000220202020',
    sim: 'B1',
  },
  {
    id: 2,
    namaDriver: 'Budi Santoso',
    alamat: 'Jl. Diponegoro No 10, Gowongan, Jetis, Kota Yogyakarta, DIY 55233',
    handphone: '0812 3456 7890',
    ktp: '3404000100020003',
    sim: 'A',
  },
  {
    id: 3,
    namaDriver: 'Ahmad Fauzi',
    alamat: 'Jl. Magelang KM 5.5, Kutu Patran, Sinduadi, Mlati, Kabupaten Sleman, DIY 55284',
    handphone: '0857 1122 3344',
    ktp: '3404000200030004',
    sim: 'B2',
  },
  {
    id: 4,
    namaDriver: 'Siti Rahmawati',
    alamat: 'Jl. Laksda Adisucipto No 15, Ambarukmo, Caturtunggal, Depok, Sleman, DIY 55281',
    handphone: '0878 9988 5544',
    ktp: '3404000300040005',
    sim: 'C',
  },
  {
    id: 5,
    namaDriver: 'Dewi Kartika',
    alamat: 'Jl. Ringroad Utara, Jombor Kidul, Sinduadi, Mlati, Kabupaten Sleman, DIY 55284',
    handphone: '0819 6633 2211',
    ktp: '3404000400050006',
    sim: 'B1',
  },
];

export const setDummyDrivers = (data: Driver[]) => {
  DUMMY_DRIVERS = data;
};
