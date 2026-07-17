# Template Acuan Standardisasi Desain Halaman

Berikut adalah acuan visual premium (margin, alignment, header, filter, controls, table, dan buttons) yang **wajib** dipatuhi di seluruh halaman modul.

> Referensi utama: `AccountListPage.tsx` dan `AccountGroupListPage.tsx`

---

## 1. Root Container Page (Menghindari Double Padding)

**Aturan**: Halaman anak yang dibungkus `DashboardLayout` tidak boleh mendefinisikan padding internal ganda (`p-6`, `grid grid-cols-1`, `bg-white min-h-screen`, dll).

```tsx
return (
  <DashboardLayout>
    <Head>...</Head>
    <div className="space-y-6">
      {/* Konten Halaman */}
    </div>
  </DashboardLayout>
)
```

---

## 2. Typography & Alignment Header Halaman

**Aturan**: Gunakan flex container `items-center justify-between`. H1 dan subheader berada dalam `<div>` tersendiri di kiri.

- **H1**: `text-2xl font-semibold` (tanpa color override — pakai default)
- **Subheader `<p>`**: `text-sm text-muted-foreground`

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-semibold">Judul Halaman</h1>
    <p className="text-sm text-muted-foreground">Deskripsi singkat halaman</p>
  </div>
  {/* Tombol Aksi di Kanan (jika ada) */}
</div>
```

---

## 3. Tombol Kembali Halaman Detail (Back Button)

**Aturan**: Gunakan komponen `<Button>` variant ghost, size icon, `rounded-xl`, border `border-slate-200`, ikon `ArrowLeft` dari `lucide-react`.

```tsx
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

<Button
  variant="ghost"
  size="icon"
  onClick={handleBack}
  className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
>
  <ArrowLeft className="h-5 w-5 text-slate-700" />
</Button>
```

---

## 4. Layout Toolbar & Table (Wrapper `space-y-4`)

**Aturan**: Toolbar filter dan tabel dibungkus dalam satu `<div className="space-y-4">`. Ini menghasilkan margin **16px** antara toolbar dan tabel — sesuai standar Master Data.

```tsx
<div className="space-y-4">
  {/* Toolbar Filter */}
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    ...
  </div>

  {/* Data Table */}
  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
    ...
  </div>
</div>
```

> ⚠️ **JANGAN** bungkus toolbar dalam Card dengan `bg-white p-4 border`. Toolbar harus transparan — hanya input/button yang punya background & border.

---

## 5. Toolbar Filter Layout

**Aturan Urutan Cascading Filters (Kiri)**:
1. **Search Bar**: Selalu diletakkan paling awal (sebelah kiri).
2. **Filter Dropdowns / Combobox / DatePicker**: Filter tambahan seperti Kategori, Tipe, Wilayah, Supplier, atau Tanggal diletakkan setelah Search Bar.
3. **Dropdown Pagination (`Show per Page`)**: Selalu diletakkan di bagian paling akhir dari grup filter sebelah kiri.

**Aturan Margin & Spacing Buttons**:
- Gunakan flex container dengan `gap-2` untuk menata tombol aksi (Export, Import, Tambah, Print, dll.) agar memiliki margin yang konsisten dan rapi.
- Gunakan kelas `w-full sm:w-auto` pada tombol aksi agar responsif.

```tsx
<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
  {/* KIRI: Search + Show */}
  <div className="flex items-center gap-4 w-full sm:w-auto">
    {/* Search Input */}
    <div className="relative w-full sm:w-[300px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search here"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-9 bg-white"
      />
    </div>

    {/* Show per Page */}
    <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
      <span>Show</span>
      <Select value={String(perPage)} onValueChange={(val) => { setPerPage(Number(val)); setPage(1); }}>
        <SelectTrigger className="w-[70px] bg-white">
          <SelectValue placeholder="25" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
      <span>Page</span>
    </div>
  </div>

  {/* KANAN: Action Buttons */}
  <div className="flex flex-wrap items-center gap-2">
    <Button variant="outline" className="w-full sm:w-auto">
      <Upload className="h-4 w-4 mr-2" />
      Export
    </Button>
    <Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
      <Plus className="h-4 w-4 mr-2" />
      Tambah
    </Button>
  </div>
</div>
```

---

## 6. Input & Control Elements

> ⚠️ **CATATAN**: Jangan gunakan `rounded-xl` pada Search Input, SelectTrigger pagination, dan DatePickerWithRange. `rounded-xl` hanya untuk *action buttons* dan back button.

### Search Input
```tsx
<div className="relative w-full sm:w-[300px]">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
  <Input
    placeholder="Search here"
    className="pl-9 bg-white"
  />
</div>
```

### Select Trigger (pagination)
```tsx
<SelectTrigger className="w-[70px] bg-white">
  <SelectValue />
</SelectTrigger>
```

### DatePickerWithRange
```tsx
<DatePickerWithRange
  className="w-[240px]"
  date={dateRange}
  onChange={...}
/>
```

---

## 7. Data Table Wrapper

**Aturan**: Tabel dibungkus dalam `<div>` dengan `rounded-xl border border-gray-200 bg-white overflow-x-auto shadow-none`.

```tsx
<div className="rounded-xl border border-gray-200 bg-white overflow-x-auto shadow-none">
  <Table>
    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
      <TableRow className="hover:bg-[#f8f9fa]">
        <TableHead className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">
          NAMA KOLOM
        </TableHead>
        {/* ... */}
        <TableHead className="w-[80px] px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">
          ACTION
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow className="hover:bg-gray-50 transition-colors">
        <TableCell className="px-4 py-4 text-sm text-gray-900">
          {/* data */}
        </TableCell>
        {/* ... */}
        <TableCell className="px-4 py-4 text-center">
          {/* Action dropdown */}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

**Standar padding cell**: `px-4 py-4` di semua `TableHead` dan `TableCell`.

### Standar Perataan Sel Tabel (Cell Alignment)

- **Rata Tengah (`text-center` / `'center'`)**:
  - **Angka Format Uang / Nominal**: Semua kolom mata uang/nominal (Bruto, HPP, DPP, PPN, Total Beli, Total Jual, Biaya BBN, Biaya Ekspedisi, Biaya Lain, dll.).
  - **Kuantitas / Qty**: Kolom jumlah unit/barang (Qty, Qty Beli, Qty Terima, Qty Kirim, Kurang, dll.).
  - **Tanggal**: Semua kolom tanggal (Tgl Jual, Tgl Beli, Tgl Terima, Tgl Kirim, dll.).
  - **Status / Billing**: Label status pembayaran (Lunas, Belum Lunas, Refund, dll.) dan badge status unit.
  - **Aksi / Action**: Kolom tombol aksi/dropdown action.

- **Rata Kiri (`text-left` / `'left'`)**:
  - **Kode Transaksi**: Kolom kode unik (No Penjualan, No Pembelian, No Penerimaan, No Pengiriman, dll.).
  - **Nama Entitas**: Nama Customer, Nama Supplier, PIC, dll.
  - **Deskripsi / Keterangan**: Tipe Unit, Nama Barang, Alamat, Keterangan Kas, dll.

### Standarisasi Kolom Aksi (Sticky Fixed)

Untuk memastikan tombol aksi selalu terlihat di berbagai ukuran layar (terutama responsif), **wajib** menerapkan pola *sticky* pada kolom "Action" (selalu di kanan) dengan ketentuan:

1. **Table Container**: Kontainer pembungkus tabel wajib menggunakan `overflow-x-auto` (bukan `overflow-hidden`) agar dapat digeser horizontal tanpa memotong efek *sticky*.
2. **Table Head (Th)**: Kolom header action wajib menggunakan class: 
   `sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]`
3. **Table Cell (Td)**: Kolom cell action wajib menggunakan class:
   `sticky right-0 bg-white z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]`

---

## 8. Action Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
    <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
      Hapus
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 9. Pagination

**Aturan**: Pagination berada di bawah tabel, dalam wrapper `space-y-4` yang sama. Layout flex column → row di breakpoint `lg`.

**Standar Show Table Row / Per Page**:
- Semua tabel wajib menggunakan opsi show per page: 25, 50, dan 100.
- Default show per page adalah 25.
- Tidak boleh menggunakan opsi lain di luar 25, 50, dan 100.
- Perubahan show per page harus melakukan fetch ulang data tabel.
- Pagination wajib tetap konsisten setelah perubahan show per page.

```tsx
<div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
  <p>Showing {start}-{end} of {total} data</p>

  <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
    {/* Previous */}
    <Button
      variant="ghost" size="sm"
      className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
      disabled={page <= 1}
      onClick={() => onPageChange(page - 1)}
    >
      Previous
    </Button>

    {/* Page Numbers */}
    {visiblePages.map((pageNumber) => (
      <Button
        key={pageNumber}
        variant="ghost" size="sm"
        className={cn(
          'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
          pageNumber === page
            ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
            : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
        )}
        onClick={() => onPageChange(pageNumber)}
      >
        {pageNumber}
      </Button>
    ))}

    {/* Next */}
    <Button
      variant="ghost" size="sm"
      className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
      disabled={page >= totalPages}
      onClick={() => onPageChange(page + 1)}
    >
      Next
    </Button>
  </div>
</div>
```

---

## 10. Action Buttons (Tambah, Export, Import)

**Aturan**: Tidak perlu `rounded-xl` eksplisit karena button komponen sudah handle sendiri. Cukup set `w-full sm:w-auto` untuk responsivitas.

```tsx
{/* Tambah */}
<Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
  <Plus className="h-4 w-4 mr-2" />
  Tambah
</Button>

{/* Export / Import / Download / Print */}
<Button variant="outline" className="w-full sm:w-auto">
  <Upload className="h-4 w-4 mr-2" />
  Export
</Button>

<Button variant="outline" className="w-full sm:w-auto">
  <Download className="h-4 w-4 mr-2" />
  Download
</Button>

<Button variant="outline" className="w-full sm:w-auto">
  <Printer className="h-4 w-4 mr-2" />
  Print
</Button>
```

---

## 11. Format Tanggal

**Standar Format Tanggal**:
- Semua tampilan tanggal pada UI wajib menggunakan format: `DD Nama Bulan YYYY`.
- Contoh format tanggal: `03 Juli 2026`.
- Nama bulan wajib menggunakan Bahasa Indonesia.
- Format untuk payload API boleh mengikuti kebutuhan backend, misalnya `YYYY-MM-DD`.
- Format mentah dari API tidak boleh langsung ditampilkan ke user.
- Gunakan helper / utility date formatter (`formatDateUI` dari `src/lib/utils/date.ts`) agar format tanggal konsisten di seluruh aplikasi.

**Bug Fix Notes**:
- `DatePickerWithRange` mendukung prop `placeholder` opsional. Default: `"Pilih rentang tanggal"`.
- `DatePicker` default placeholder: `"Pilih tanggal"`.
- **Jangan** gunakan placeholder bahasa Inggris: `"Pick a date"`, `"Select date"`, `"Pick a date range"`.

---

## 12. Tabs Component Standard (Premium Pill Style)

**Aturan**: Gunakan flex container untuk membungkus `TabsList`. Triggers menggunakan visual pill dengan latar belakang abu-abu tipis dan status aktif berlatar belakang putih bersih dengan bayangan halus.

```tsx
<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
  {/* Tab triggers wrapped to look like pills */}
  <div className="flex no-print">
    <TabsList className="flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-xl">
      <TabsTrigger 
        value="per-nota" 
        className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
      >
        Laporan Pembelian Per Nota
      </TabsTrigger>
      <TabsTrigger 
        value="per-tipe" 
        className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
      >
        Laporan Pembelian Per Tipe
      </TabsTrigger>
      <TabsTrigger 
        value="per-supplier" 
        className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
      >
        Laporan Pembelian Per Supplier
      </TabsTrigger>
    </TabsList>
  </div>

  <TabsContent value="per-nota" className="mt-0">
    {/* Konten Tab */}
  </TabsContent>
</Tabs>
```

---

## Ringkasan Kelas Kunci

| Elemen | Kelas |
|--------|-------|
| Root wrapper | `space-y-6` |
| Toolbar ↔ Table gap | `space-y-4` (wrapper) |
| H1 | `text-2xl font-semibold` |
| Subheader | `text-sm text-muted-foreground` |
| TabsList (Pills) | `flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-xl` |
| TabsTrigger (Pills) | `rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm` |
| Search Input | `pl-9 bg-white` |
| Select pagination | `w-[70px] bg-white` |
| Table wrapper | `rounded-xl border border-gray-200 bg-white overflow-x-auto shadow-none` |
| TableHeader | `bg-[#f8f9fa] border-b border-gray-200` |
| TableHead / Cell | `px-4 py-4` |
| Sticky Action Head | `sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]` |
| Sticky Action Cell | `sticky right-0 bg-white z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]` |
| TableRow hover | `hover:bg-gray-50 transition-colors` |
| Pagination btn | `h-9 rounded-xl` |
| Pagination active | `border-slate-200 bg-white text-slate-950 shadow-sm` |
| Action trigger | `h-8 w-8 rounded-full` |
| DropdownMenuContent | `rounded-xl border-slate-200 p-1.5 shadow-lg` |
| DropdownMenuItem | `rounded-lg px-3 py-2` |
---
| Tambah button | `bg-[#1e3a5f] hover:bg-[#152e4d]` |

---

## 13. Standarisasi Layout Print A4 (Letterhead & Single Page)

**Aturan**: Untuk halaman cetak surat/nota resmi (A4 dengan background kop surat), ikuti spesifikasi berikut agar layout presisi 1 halaman dan tidak menghasilkan halaman kosong tambahan:

1. **Gunakan Class `.print-letter-page`**: Tempelkan class `.print-letter-page` pada div halaman A4 utama agar terintegrasi dengan visibilitas global dan pemotongan halaman (`overflow: hidden`).
2. **Kop Surat (Background Image)**: Render background image kop surat menggunakan tag `<img>` absolut tanpa class `.print-letterhead` agar kop surat tetap terlihat baik di layar web (screen preview) maupun saat dicetak (print layout).
3. **Konfigurasi Ref**: Pastikan `printRef` dipasang langsung di elemen kertas utama (lebar `210mm` dan tinggi minimal `297mm`), bukan di wrapper luarnya.
4. **Perataan Sel Tabel (Cell Alignment)**:
   - Kolom Nominal/Uang (Harga, DPP, PPN, Total): wajib Rata Tengah (`text-center` / `align: 'center'`).
5. **Navigasi Tombol Aksi Print**: Tombol aksi print pada baris tabel (Action Dropdown) wajib membuka halaman print khusus di tab baru menggunakan `window.open` ke path `/dashboard/[slug]/[modul]/print/[id]`.

### Contoh Dropdown Action Print:

```tsx
<DropdownMenuItem 
  onClick={() => window.open(`/dashboard/${slug}/transaksi/pembelian-unit/print/${item.id}`, '_blank')}
>
  Print
</DropdownMenuItem>
```

### Struktur Kode Contoh:

```tsx
// Di Halaman Page (Trigger)
const printRef = React.useRef<HTMLDivElement>(null);
const handlePrint = useReactToPrint({
  contentRef: printRef,
  documentTitle: 'PurchaseOrder',
  pageStyle: `
    @page { size: A4; margin: 0; }
    @media print {
      html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  `,
});

// Render Component Dokumen Utama
<div 
  ref={printRef} 
  className="relative mx-auto overflow-hidden bg-white shadow-md border print-letter-page"
  style={{ width: '210mm', minHeight: '297mm' }}
>
  {/* Kop Surat */}
  <img src={letterheadUrl} className="absolute inset-0 h-full w-full object-cover" />
  
  {/* Konten Halaman */}
  <div className="relative min-h-[297mm] px-[20mm] pt-[42mm] pb-[42mm]">
    {/* Tabel Rata Tengah untuk Nominal */}
    <table className="w-full text-[8.5pt]">
      <thead>
        <tr className="bg-[#1f4163] text-white">
          <th className="text-center">NO</th>
          <th className="text-left">DESKRIPSI</th>
          <th className="text-center">HARGA</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="text-center">1</td>
          <td className="text-left">Tipe Unit A</td>
          <td className="text-center">Rp17.000.000</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## 14. Standar Search Data

- Semua fitur search pada tabel wajib menggunakan placeholder yang jelas sesuai konteks data yang dapat dicari.
- Search harus mencari data berdasarkan field yang relevan dengan kebutuhan user, bukan hanya berdasarkan satu field default.
- Jika halaman memiliki kebutuhan search spesifik, seperti pencarian berdasarkan No. Rangka atau No. Mesin, maka logic search wajib mendukung field tersebut.
- Search tidak boleh hanya menggunakan field yang tidak sesuai dengan kebutuhan user, misalnya hanya mencari berdasarkan Warehouse ketika user membutuhkan pencarian berdasarkan Detail Unit.
- Search wajib tetap kompatibel dengan pagination, show table row / per page, filter, sorting, dan refresh data.
- Ketika keyword search dikosongkan, tabel wajib kembali menampilkan data default.
- Jika data tidak ditemukan, tampilkan empty state yang jelas dan mudah dipahami user.
- Jika terjadi error saat search, tampilkan pesan error yang ramah dan tidak teknis.
- Gunakan komponen search yang konsisten sesuai Pattern UI Style aplikasi.

---

## 15. Standar Penampilan Kolom Biaya Ekspedisi pada Tabel Transaksi

- Jika endpoint sudah menyediakan field biaya ekspedisi, maka data tersebut harus dapat ditampilkan pada tabel utama agar user tidak selalu perlu masuk ke halaman detail.
- Pada halaman Pembelian Unit, kolom Biaya Ekspedisi wajib menggunakan field `expedition_fee_total`.
- Kolom Biaya Ekspedisi harus ditampilkan dengan format currency / Rupiah yang konsisten.
- Jika nilai biaya ekspedisi kosong, null, atau undefined, gunakan fallback tampilan yang rapi sesuai standar project.
- Penambahan kolom baru tidak boleh membuat data kolom lain tertukar.
- Penambahan kolom baru harus tetap menjaga konsistensi layout tabel, responsiveness, pagination, filter, search, dan action table.
- Setiap penambahan kolom pada tabel transaksi wajib mengikuti Pattern UI Style yang tercantum di `template.md`.

---

## 16. Standar Card Pembelian dan Penjualan Unit

### Card Detail Transaksi (Pembelian / Penjualan)

Card Detail Transaksi digunakan untuk menampilkan ringkasan nilai transaksi unit berdasarkan total DPP, total PPN, total HPP, total biaya, dan total transaksi (pembelian/penjualan).

Urutan data wajib:
1. Total DPP
2. Total PPN
3. Total HPP
4. Total Biaya
5. TOTAL PEMBELIAN / TOTAL PENJUALAN

Ketentuan:
- Total HPP ditampilkan dengan font lebih tebal.
- TOTAL PEMBELIAN / TOTAL PENJUALAN ditampilkan menggunakan huruf kapital dan nominal tebal.
- Gunakan divider untuk memisahkan bagian perhitungan utama.
- Seluruh nominal wajib menggunakan format Rupiah.
- Data tidak boleh hardcode dan harus berasal dari endpoint API real.
- Jika field total belum tersedia dari API, frontend boleh melakukan kalkulasi berdasarkan data detail transaksi.

### Card Rincian Nilai

Card Rincian Nilai digunakan untuk menampilkan rincian nilai DPP, PPN, total transaksi, dan kurang bayar.

Urutan data wajib:
1. DPP
2. PPN
3. TOTAL PEMBELIAN / TOTAL PENJUALAN
4. KURANG BAYAR

Ketentuan:
- TOTAL PEMBELIAN / TOTAL PENJUALAN ditampilkan menggunakan huruf kapital dan nominal tebal.
- KURANG BAYAR wajib menggunakan warna merah dan nominal tebal.
- Seluruh nominal wajib menggunakan format Rupiah.
- Data tidak boleh hardcode dan harus berasal dari endpoint API real.
- Jika field total belum tersedia dari API, frontend boleh melakukan kalkulasi berdasarkan data detail transaksi.

### Ketentuan Styling Card

- Font, ukuran teks, ketebalan teks, warna, spacing, padding, border radius, icon, divider, dan layout card wajib mengikuti Pattern UI Style pada `template.md`.
- Card harus konsisten dengan card transaksi lain pada sistem.

---

## Ringkasan Kelas Kunci

| Elemen | Kelas |
|--------|-------|
| Root wrapper | `space-y-6` |
| Toolbar ↔ Table gap | `space-y-4` (wrapper) |
| H1 | `text-2xl font-semibold` |
| Subheader | `text-sm text-muted-foreground` |
| TabsList (Pills) | `flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-xl` |
| TabsTrigger (Pills) | `rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm` |
| Search Input | `pl-9 bg-white` |
| Select pagination | `w-[70px] bg-white` |
| Table wrapper | `rounded-xl border border-gray-200 bg-white overflow-x-auto shadow-none` |
| TableHeader | `bg-[#f8f9fa] border-b border-gray-200` |
| TableHead / Cell | `px-4 py-4` |
| Sticky Action Head | `sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]` |
| Sticky Action Cell | `sticky right-0 bg-white z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]` |
| TableRow hover | `hover:bg-gray-50 transition-colors` |
| Pagination btn | `h-9 rounded-xl` |
| Pagination active | `border-slate-200 bg-white text-slate-950 shadow-sm` |
| Action trigger | `h-8 w-8 rounded-full` |
| DropdownMenuContent | `rounded-xl border-slate-200 p-1.5 shadow-lg` |
| DropdownMenuItem | `rounded-lg px-3 py-2` |
| Back button | `h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50` |
| Tambah button | `bg-[#1e3a5f] hover:bg-[#152e4d]` |
| Container Cetak A4 | `print-letter-page` |
| Background Kop Surat | `print-letterhead` |

---

## Standar Form Pembelian Unit

Form Pembelian Unit digunakan untuk menginput data transaksi pembelian unit, termasuk biaya, harga satuan, dan total harga.

### Sub Form Biaya

Urutan field wajib:
1. Biaya BBN
2. Biaya Ekspedisi
3. Biaya Lain

Ketentuan:
- Field biaya ditampilkan dalam satu baris dengan layout tiga kolom jika ruang layar mencukupi.
- Semua field biaya wajib menggunakan format currency / Rupiah.
- Field biaya harus berada di bawah bagian input QTY dan Harga sesuai struktur form transaksi.
- Mapping data tidak boleh tertukar antara Biaya BBN, Biaya Ekspedisi, dan Biaya Lain.

### Sub Form Harga

Urutan field wajib:
1. HPP Satuan
2. DPP Satuan
3. PPN Satuan

Ketentuan:
- Semua field harga satuan wajib menggunakan format currency / Rupiah.
- Field harga satuan harus tetap mengikuti mapping data transaksi pembelian unit.
- Jika nilai dihitung otomatis, pastikan hasil kalkulasi tetap tampil rapi.

### Sub Form Total Harga

Urutan field wajib:
1. HPP Total
2. DPP Total
3. PPN Total

Ketentuan:
- Semua field total harga wajib menggunakan format currency / Rupiah.
- Nilai total tidak boleh menampilkan NaN, undefined, atau format kosong yang tidak rapi.
- Jika data belum tersedia, gunakan fallback sesuai standar project.

### Ketentuan Styling Form

- Font, ukuran teks, ketebalan teks, warna, spacing, padding, border radius, input, label, divider, dan layout wajib mengikuti Pattern UI Style pada `template.md`.
- Struktur Form Pembelian Unit ini dapat dijadikan acuan untuk implementasi Form Penjualan Unit agar tampilan antar fitur transaksi tetap konsisten.
