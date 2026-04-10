import { Customer } from './CustomerTable';

export let DUMMY_TRANSINDO_CUSTOMERS: Customer[] = [
  {
    id: 1,
    namaDealer: 'Yamaha Sejati Yogyakarta',
    namaCustomer: 'ELLA YOUNG WIDJAYANTO NUGRAHA',
    pic: 'Emilia Clarke',
    alamat: 'Jl. Raya Kalimalang No, Rt 000, Rw 000, Duren Sawit, Duren Sawit, Kota Adm. Jakarta Timur, DKI Jakarta 00000',
    map_link: 'https://maps.app.goo.gl/example',
    phone: '08xx xxxx xxxx',
  },
  {
    id: 2,
    namaDealer: 'Yamaha Tugu Jogja',
    namaCustomer: 'BUDI SANTOSO',
    pic: 'John Doe',
    alamat: 'Jl. Pangeran Diponegoro No 10, Gowongan, Jetis, Kota Yogyakarta, DIY 55233',
    map_link: 'https://maps.app.goo.gl/example',
    phone: '0812 3456 7890',
  },
  {
    id: 3,
    namaDealer: 'Honda Nusantara Abadi',
    namaCustomer: 'SITI RAHMAWATI',
    pic: 'Jane Smith',
    alamat: 'Jl. Magelang KM 5.5, Kutu Patran, Sinduadi, Mlati, Kabupaten Sleman, DIY 55284',
    map_link: 'https://maps.app.goo.gl/example',
    phone: '0857 1122 3344',
  },
  {
    id: 4,
    namaDealer: 'Suzuki Sumber Baru',
    namaCustomer: 'AHMAD FAUZI',
    pic: 'Tom Holland',
    alamat: 'Jl. Laksda Adisucipto No 15, Ambarukmo, Caturtunggal, Depok, Sleman, DIY 55281',
    map_link: 'https://maps.app.goo.gl/example',
    phone: '0878 9988 5544',
  },
  {
    id: 5,
    namaDealer: 'Toyota Nasmoco Jogja',
    namaCustomer: 'DEWI KARTIKA',
    pic: 'Emma Watson',
    alamat: 'Jl. Ringroad Utara, Jombor Kidul, Sinduadi, Mlati, Kabupaten Sleman, DIY 55284',
    map_link: 'https://maps.app.goo.gl/example',
    phone: '0819 6633 2211',
  },
];

export const setDummyTransindoCustomers = (data: Customer[]) => {
  DUMMY_TRANSINDO_CUSTOMERS = data;
};
