import { Dealer } from './DealerTable';

export let DUMMY_DEALERS: Dealer[] = [
  { id: 1, namaDealer: 'PT Jawara Jogja', alamat: 'Jalan Banguntapan no 25, sewon, bantul, yogyakarta', pic: 'John Doe', handphone: '089089089089' },
  { id: 2, namaDealer: 'CV Makmur Abadi', alamat: 'Jl. Magelang KM 5.5, Kutu Patran, Sinduadi', pic: 'Budi Santoso', handphone: '081234567890' },
  { id: 3, namaDealer: 'PT Lintas Samudera', alamat: 'Jl. Ringroad Utara No. 12, Depok, Sleman', pic: 'Siti Rahmawati', handphone: '085712345678' },
  { id: 4, namaDealer: 'UD Sumber Rejeki', alamat: 'Pasar Beringharjo Lt. 1 Blok B', pic: 'Ahmad Dahlan', handphone: '081398765432' },
  { id: 5, namaDealer: 'PT Teknologi Nusantara', alamat: 'Gedung Cyber, Lt 3, Jl. Kuningan Barat', pic: 'Kevin Wijaya', handphone: '087811223344' },
  { id: 6, namaDealer: 'CV Global Sinergi', alamat: 'Jl. Kaliurang KM 8.5, Sinduharjo, Ngaglik', pic: 'Andi Setiawan', handphone: '082188997766' },
  { id: 7, namaDealer: 'Koperasi Karyawan Maju', alamat: 'Jl. Jendral Sudirman No. 45, Kota Yogyakarta', pic: 'Dewi Lestari', handphone: '089566778899' },
];

export const setDummyDealers = (data: Dealer[]) => {
  DUMMY_DEALERS = data;
};
