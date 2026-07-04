# Analisis Tech Stack dan Informasi Project Frontend Dashboard Wajira

## 1. Identitas Project
Project ini merupakan **Frontend Dashboard Wajira**, sebuah sistem *Enterprise Resource Planning* (ERP) berbasis web. Dalam konteks studi kasus skripsi ini, sistem diimplementasikan untuk **PT Wajira Morindo** (berperan sebagai Company ID 1). Sistem ini dirancang untuk mendukung dan mendigitalkan berbagai proses operasional perusahaan mulai dari master data, administrasi, pergudangan (warehouse), keuangan (finance), hingga pelaporan.

## 2. Ringkasan Sistem
Sistem frontend Dashboard Wajira dibangun sebagai *Single Page Application* (SPA) / *Server-Side Rendered* (SSR) application modern yang memanfaatkan arsitektur framework terkini. Sistem beroperasi sebagai dashboard interaktif untuk mengelola multi-perusahaan, namun secara khusus menargetkan entitas Wajira Morindo. Dashboard dirancang dengan fokus pada keamanan otentikasi pengguna, manajemen state yang reaktif, serta antarmuka (UI/UX) yang seragam dan mudah digunakan untuk mengelola data transaksional skala menengah hingga besar.

## 3. Tech Stack Utama

| Aspek | Teknologi/Library | Keterangan | Sumber File |
| ----- | ----------------- | ---------- | ----------- |
| **Framework Utama** | Next.js (v15.5.12) | Menggunakan arsitektur Pages Router (`src/pages`). | `package.json`, `next.config.ts` |
| **Bahasa Pemrograman** | TypeScript | Memberikan *static typing* untuk keandalan kode. | `tsconfig.json`, ekstensi `.ts`/`.tsx` |
| **Styling** | Tailwind CSS (v4) | Utility-first CSS framework untuk penataan gaya yang cepat dan konsisten. | `package.json`, `tailwind` config |
| **UI Component Library** | Shadcn UI & Radix UI | Digunakan untuk komponen dasar UI (Button, Modal, Input, dll). | `components.json`, `package.json` |
| **State Management (Server)**| React Query (TanStack v5) | Digunakan untuk *data fetching*, *caching*, dan sinkronisasi status API. | `package.json`, `src/hooks/*` |
| **State Management (Local)**| React Context API | Digunakan untuk global state minimal, seperti Company Context. | `src/contexts/CompanyContext.tsx` |
| **Form & Validation** | React Hook Form & Zod | Penanganan state form yang efisien dipadukan dengan validasi skema data ketat. | `package.json` |
| **API Client** | Axios | Melakukan HTTP request ke REST API backend. | `package.json`, `src/lib/api/client.ts` |
| **Tabel & Data Grid** | TanStack Table (v8) | Pengelolaan tabel kompleks, *sorting*, dan *pagination*. | `package.json` |
| **Ikon & Tipografi** | Lucide React | Pustaka ikon SVG modern yang konsisten. | `package.json` |
| **Notifikasi (Toast)** | Sonner | Menampilkan pesan notifikasi pop-up kepada pengguna. | `package.json` |
| **Date & Time** | date-fns, chrono-node | Utilitas manipulasi format tanggal. | `package.json` |
| **Print & Export** | react-to-print, html2canvas, jspdf | Memungkinkan fungsi cetak dan konversi dokumen laporan ke PDF. | `package.json` |

## 4. Struktur Folder Project

| Folder/File | Fungsi | Catatan |
| ----------- | ------ | ------- |
| `src/pages` | Mengatur routing halaman menggunakan konvensi Next.js Pages Router. | Berisi file seperti `login.tsx`, `select-company.tsx`, dan folder `dashboard`. |
| `src/components` | Menyimpan *reusable components* (UI base, Layout, Features, dll). | Termasuk komponen bawaan Shadcn UI di dalam subfolder `ui`. |
| `src/services` | Bertindak sebagai API service layer yang mendefinisikan *fetch logic* (GET, POST). | Menghubungkan frontend dengan *endpoints* backend. |
| `src/hooks` | Tempat penyimpanan *custom hooks*, terutama yang membungkus React Query mutations/queries. | Memisahkan logika bisnis dari komponen visual. |
| `src/contexts` | Menyimpan React Context Provider untuk state yang dibagikan secara global. | Contoh utama: `CompanyContext`. |
| `src/features` | Pengelompokan logika berdasarkan domain/fitur spesifik (Domain-driven). | Terdapat fitur `auth` yang menangani login dan session checking. |
| `src/lib` | Menyimpan *utility tools* umum dan konfigurasi base library. | Contoh: konfigurasi instance Axios (`api/client.ts`), utilitas token. |
| `src/types` / `@types`| Berisi deklarasi tipe/interface TypeScript global. | |
| `public` | Aset statis berupa gambar, logo, ikon. | Tempat logo `wajira-logo.png`. |

## 5. Arsitektur Frontend
Sistem mengadopsi pola **Layered Architecture** dan **Feature-based Pattern** yang disesuaikan dengan arsitektur Wajira:
* **Presentation Layer**: Dikelola oleh Next.js pada folder `src/pages` yang merepresentasikan URL rute, serta `src/components` untuk elemen visual.
* **Service/API Layer**: Diabstraksi dalam folder `src/services`, yang mengatur integrasi dengan backend dengan pemetaan tipe balikan API yang jelas (berbasis objek dan class/fungsi).
* **State/Controller Layer**: Dikelola oleh hooks kustom (`src/hooks`) berbasis TanStack React Query yang berfungsi sebagai jembatan *fetching*, penyimpanan singgahan (caching), dan revalidasi data sebelum disajikan ke Presentation Layer.
* **Context/State Layer (Global)**: React Context (`CompanyProvider`) mengontrol konteks multitenant/perusahaan mana yang sedang aktif selama sesi berjalan.
* **Utility Layer**: Helper standar format data, manipulasi string, mata uang, dan tanggal berada di direktori `src/lib` dan `src/utils`.

## 6. Routing dan Halaman
Menggunakan Next.js Pages Router yang berbasis struktur direktori. Pola routing utamanya mensyaratkan pemilihan perusahaan terlebih dahulu, sehingga alurnya adalah: `Login` -> `Select Company` -> `Dashboard Company`.

| Modul | Sub Menu/Halaman | Path/Folder Jika Ditemukan | Keterangan |
| ----- | ---------------- | -------------------------- | ---------- |
| **Auth** | Login | `src/pages/login.tsx` | Entry point aplikasi. |
| **Sistem** | Select Company | `src/pages/select-company.tsx` | Halaman peralihan setelah login. |
| **Dashboard**| Overview | `src/pages/dashboard/[slug]/index.tsx`| Halaman depan modul (berdasarkan slug perusahaan). |
| **Modul** | Administrasi, Finance, Master, Warehouse, dll | `src/pages/dashboard/[slug]/*` | Semua modul di-group dalam rute dinamis perusahaan (slug). |

## 7. Modul dan Sub Menu Sistem
Berdasarkan pemetaan folder dalam `src/pages/dashboard/[slug]` dan `src/services`, modul sistem terbagi atas:

### 7.1 Dashboard
* Overview Dashboard Utama

### 7.2 Master Data
* Akun (`account`) dan Grup Akun (`account-group`)
* Supplier / Vendor
* Customer
* Tipe Unit (`type-unit`)
* Sparepart
* Kas (`kas`)
* User dan Role (`user`, `role`, `permission`)
* Aset (`asset`)
* Kendaraan / Armada (`vehicle-data`, `armada`)

### 7.3 Administrasi
* Arus Transaksi (`arus-transaksi`)
* Pembelian Unit / Material (`transaksi/pembelian-unit`, `pembelian-material`)
* Penjualan Unit / Material (`transaksi/penjualan-unit`, `penjualan-material`)
* Invoice Wajira (`create-invoice`, `do-invoice`)
* Administrasi Refund (`refund-administrasi`)
* STNK & BPKB (`stnk-bpkb`)
* Tagihan BBN (`tagihan-bbn`, `bbn-bill`)

### 7.4 Warehouse (Gudang)
* Stock Unit (`stock-unit`)
* Penerimaan Unit (`penerimaan-unit-receipt`, `goods-receipt`)
* Pengeluaran Unit (`pengeluaran-unit`, `goods-issue`)
* Maintenance Kendaraan / Ritase (`laporan-ritase-armada`)
* Perlengkapan Keluar

### 7.5 Finance (Keuangan)
* Transaksi Kas Harian (`kas-harian`)
* Pembayaran Hutang (`pembayaran-hutang`, `hutang`, `liability`)
* Piutang dan Penerimaan Piutang (`piutang`, `penerimaan-piutang`)
* Refund Finance (`finance-refund`)
* Manajemen Aset Finance (`finance-asset`)
* Laporan Bukti Potong (`withholding-tax`)

### 7.6 Laporan
Terdapat menu pelaporan komprehensif (`src/pages/dashboard/[slug]/laporan/*`):
* Laporan Pembelian & Penjualan
* Laporan Penerimaan & Pengiriman (Surat Jalan)
* Laporan Warehouse / Stock (Unit, Material, Perlengkapan)
* Laporan Transaksi Kas / Akuntansi
* Laporan Invoice
* Laporan Aset

## 8. Pola Integrasi API
* **API Client**: Menggunakan Axios (dikonfigurasi pada `src/lib/api/client.ts`).
* **Base URL**: Menyasar variabel lingkungan `NEXT_PUBLIC_API_URL` dengan fallback ke backend development.
* **Auth Token**: Menggunakan skema *Bearer Token* di mana JWT disisipkan secara otomatis oleh interceptor Axios.
* **Error Handling**: Terdapat *Response Interceptor* yang secara sentral mencegat HTTP Code 401 (Unauthorized) untuk membersihkan token/session dan melempar pengguna paksa ke halaman login. Ia juga memetakan format *response error* agar standar.
* **Interaksi Data (Pagination/Filter)**: Dikelola oleh *React Query* (*hooks*) di frontend yang akan meneruskan argumen filter/pencarian sebagai objek parameter URL (`query params`) kepada service.

## 9. Autentikasi dan Otorisasi
* **Login Flow**: Mengumpulkan kredensial dan menukar API untuk mendapatkan JWT (Access Token).
* **Token/Session Validation**: Menggunakan metode pengecekan proaktif via hook `useAuthCheck` (`src/features/auth/hooks/use-auth-check.ts`). Hook ini akan melakukan verifikasi validitas token pada setiap kali transisi rute (dengan mekanisme *throttling* setiap 2 menit agar tidak membebani server).
* **Protected Route**: Sistem tidak mengizinkan akses ke dalam URL dashboard tanpa JWT yang valid. Interceptor Axios dan `useAuthCheck` berkolaborasi menjaga hal ini.
* **Authorization**: Data permission untuk *Role-Based Access* disimpan secara terpisah dan di-clear ketika logout/sesi berakhir (indikasi fungsi `clearStoredPermissions()`).

## 10. Company Context dan Company ID
* **Multitenancy Architecture**: Sistem ini dirancang menangani operasi untuk lebih dari satu perusahaan/cabang.
* **Pemilihan Perusahaan**: Setelah otentikasi berhasil, pengguna tidak langsung ke dashboard utama, melainkan dialihkan ke antarmuka `/select-company` untuk menentukan ruang lingkup kerja (Company Context).
* **Company ID**: Terikat dalam React Context (`CompanyProvider`), local storage (`setStoredCompanyId`), dan URL (melalui parameter `[slug]`).
* **Company ID 1 (PT Wajira Morindo)**: Konteks perusahaan diakses melalui slug spesifik (misal `/dashboard/wajira-morindo`). Hal ini membatasi pengambilan data agar tabel atau laporan murni merepresentasikan ruang lingkup PT Wajira Morindo sesuai pembagian akses yang diberikan oleh backend.

## 11. Pola UI/UX dan Komponen
* **Framework Komponen**: Diimplementasikan di atas ekosistem Shadcn UI & Radix UI.
* **Layout**: Desain aplikasi berbasis Dashboard konvensional dengan *Sidebar* (navigasi vertikal multi-level) dan *Topbar* (header identitas, profil, breadcrumbs).
* **Form**: Diseragamkan menggunakan arsitektur komponen `<Form />` berbasis `react-hook-form` yang memastikan interaksi dan validasi real-time. Input uang spesifik diselesaikan dengan komponen khusus seperti `<MoneyInput />`.
* **Tabel**: Memanfaatkan abstraksi `@tanstack/react-table` (contoh file `table.tsx`, `sortable-header.tsx`), menangani data grid besar, pengurutan, pagination server-side, loading skeleton, serta empty state (jika data kosong).
* **Feedback**: Modal dan dialog interaktif (konfirmasi hapus, form popup) memakai `dialog.tsx` atau `alert-dialog.tsx`. Pemberitahuan sukses/gagal di ujung layar memakai pustaka `sonner`.

## 12. Pola State Management
* Tidak menggunakan library state kompleks tradisional seperti Redux.
* **Server State**: Didominasi penuh oleh TanStack React Query (`useQuery`, `useMutation`). Pattern ini secara drastis mengurangi baris kode boilerplate untuk *loading*, *error handling*, dan *synchronization* data antar menu.
* **Client/Local State**: Hanya mengandalkan bawaan API React seperti `useState`, `useReducer`, dan `useContext` (seperti halnya di `CompanyContext`).

## 13. Form, Validasi, dan Format Data
* **Data Validasi**: Validasi berbasis Skema dengan pustaka Zod (`zod`). Error rules ditulis tegas dalam kode frontend untuk perlindungan sebelum data dikirim (mencakup wajib isi, batas minimum/maksimum, format surel).
* **Penanganan Angka (Rupiah/Kurs)**: Format keuangan dijaga melalui helper utilitas dan custom component (contohnya `money-input.tsx`), memastikan pengguna memasukkan data moneter yang rapi dan seragam.
* **Penanganan Tanggal**: Kombinasi Date-Picker kustom (melalui Radix & `react-day-picker`) dipadukan dengan pemformatan oleh pustaka `date-fns`.

## 14. Build, Development, dan Deployment
* **Package Manager**: Bisa menggunakan npm (`package-lock.json`) ataupun pnpm (`pnpm-lock.yaml`).
* **Environment Variable**: `NEXT_PUBLIC_API_URL` adalah konfigurasi kunci yang mendelegasikan target server API backend.
* **Development Command**: `npm run dev` atau menggunakan kapabilitas `next dev --turbopack` untuk *fast refresh*.
* **Build Command**: `npm run build` yang merangkai file statis Next.js untuk produksi (`output: "standalone"`).
* **Deployment**: Tersedia konfigurasi `Dockerfile` dan berkas CI/CD GitLab (`.gitlab-ci.yml`), mengindikasikan bahwa proyek dipaketkan dalam container Docker dan diotomasi pipeline deployment-nya.

## 15. Kebutuhan Non-Fungsional yang Terlihat dari Project
* **Security (Keamanan)**: Next.js dikonfigurasi (`next.config.ts`) dengan injeksi Security Headers otomatis (*Content-Security-Policy*, *X-Frame-Options: DENY*). Token jwt disimpan secara persisten dengan validasi proaktif.
* **Usability (Kebergunaan)**: UI memiliki keseragaman berkat standarisasi Design System (Shadcn UI). Form memiliki pesan eror instan. Navigasi cukup responsif.
* **Performance (Kinerja)**: Implementasi arsitektur "Server State" (React Query) yang dibungkus pola *throttling* (tidak *over-fetch* data berulang). Penggunaan Turbopack (Next.js v15) meningkatkan waktu waktu tunggu pada lingkungan pengembang.

## 16. Informasi yang Relevan untuk SRS
Temuan ini dapat diaplikasikan langsung dalam bab-bab dokumen SRS:

### 16.1 Product Perspective
Dashboard Wajira Frontend berperan sebagai antarmuka klien web mandiri (berupa SPA/SSR dengan Next.js) yang berinteraksi langsung melalui REST API dengan sistem backend terpusat. Ia tidak menyimpan core data, melainkan mengatur lapisan presentasi.

### 16.2 Product Functions
Mencakup operasional Wajira Morindo meliputi fungsionalitas Master Data, Proses Pembelian (Purchase), Proses Penjualan (Sales), Keluar-Masuk Gudang (Warehouse), Keuangan Harian/Bulanan (Finance), dan Pencetakan/Unduh Laporan PDF.

### 16.3 User Classes and Characteristics
Target penggunanya mencakup operator operasional, staf pergudangan, kasir/staff keuangan, serta administrator. Sistem memisahkan *scope* data mereka melalui implementasi Role-based Authorization.

### 16.4 Operating Environment
Sistem dapat diakses lewat web browser modern apa saja (Chrome, Firefox, Safari) dalam berbagai Operating System (Windows, macOS). Untuk hosting production, membutuhkan lingkungan Node.js atau Docker container (Linux).

### 16.5 Design and Implementation Constraints
Diwajibkan menggunakan struktur Next.js Pages Router, dan penulisan styling murni berstandar Tailwind CSS tanpa kustomisasi CSS terlepas agar arsitektur Shadcn UI tetap *maintainable*.

## 17. Risiko atau Informasi yang Perlu Dikonfirmasi
1. **Pemisahan Modul Perusahaan**: Meskipun Wajira Morindo diatur sebagai Company ID 1, perlu dikonfirmasi kepada stakeholders apakah terdapat menu spesifik (misal Ritase Armada) yang tampil atau disembunyikan *khusus* pada perusahan ini.
2. **Definisi Hak Akses (Role/Permission)**: Detail matriks dari hak akses (Siapa yang bisa mengakses modul Pembayaran vs Laporan) belum sepenuhnya terdeskripsi secara transparan (hanya disinggung sebagai `clearStoredPermissions`).
3. **Dokumentasi Endpoint Detail**: Meski Service Layer memetakan pola pemanggilan (GET, POST), spesifikasi Payload data terperinci harus merujuk ke API Documentation (seperti Swagger) yang ada pada sisi tim Backend.

## 18. Ringkasan untuk Penyusunan SRS
Hasil analisis reverse engineering tech stack dan codebase ini dapat menjadi pijakan kuat untuk dokumen **Software Requirements Specification**. Bab 1 hingga 5 dari SRS (seperti Pendahuluan, Deskripsi Umum, Aspek Arsitektur Lingkungan, hingga Kebutuhan Non-Fungsional) telah tercakup lengkap dengan bahasa rekayasa perangkat lunak akademis. Temuan terkait struktur hirarki sistem (seperti pembagian Menu Administrasi, Finance, Warehouse) dapat langsung dipindahkan ke dalam sub-bab Daftar Kebutuhan Fungsional (Functional Requirements) pada naskah skripsi.
