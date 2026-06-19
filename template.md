Template Acuan Standardisasi Desain Halaman
Berikut adalah acuan visual premium (margin, alignment, header, filter, controls, dan buttons) yang harus dipatuhi di seluruh halaman modul:

1. Root Container Page (Menghindari Double Padding)
Aturan: Halaman anak (child page) yang dibungkus oleh DashboardLayout tidak boleh mendefinisikan padding internal ganda (seperti p-6, grid grid-cols-1, bg-white min-h-screen, px-1).
Standardisasi:
tsx

return (
  <DashboardLayout>
    <Head>...</Head>
    <div className="space-y-6">
       {/* Konten Halaman */}
    </div>
  </DashboardLayout>
)
2. Typography & Alignment Header Halaman
Aturan: Gunakan flex container dengan perataan vertikal tengah (items-center) jika ada button/elemen aksi di samping judul.
Header (h1): Wajib menggunakan text-2xl font-semibold text-slate-950.
Subheader (p): Wajib menggunakan text-sm text-slate-500 (tanpa mt-1 jika berada dalam layout flex yang disejajarkan).
Standardisasi:
tsx

<div className="flex items-center justify-between no-print">
  <div>
    <h1 className="text-2xl font-semibold text-slate-950">Judul Halaman</h1>
    <p className="text-sm text-slate-500">Deskripsi singkat halaman</p>
  </div>
  {/* Tombol Aksi di Kanan */}
</div>
3. Tombol Kembali Halaman Detail (Back Button)
Aturan: Menggunakan tombol icon dengan border-radius rounded-xl yang bersih, warna border border-slate-200, variant ghost, dan ikon ArrowLeft dari lucide-react.
Standardisasi:
tsx

<Button
  variant="ghost"
  size="icon"
  onClick={handleBack}
  className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
>
  <ArrowLeft className="h-5 w-5 text-slate-700" />
</Button>
4. Toolbar Filter (Container Transparan)
Aturan: Baris toolbar filter tidak boleh dibungkus dalam Card dengan background putih ganda atau border abu-abu (bg-white p-4 border border-slate-200). Latar belakang harus transparan, di mana hanya input field dan button-nya yang memiliki visual background & border.
Standardisasi:
tsx

<div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print mb-5">
   {/* Filter Controls (Kiri) */}
   {/* Action Buttons (Kanan) */}
</div>
5. Input & Control Elements
Aturan: Semua control inputs (Search Input, Dropdown Select, Date Picker) harus seragam menggunakan border-radius DEFAULT rounded-md (bukan rounded-xl) — konsisten dengan Master Data Akun. Cukup set bg-white, tanpa perlu override border-color atau shadow secara eksplisit.
Standardisasi:
Search Input:
```tsx
<div className="relative w-full sm:w-[300px]">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <Input
    placeholder="Search here"
    className="pl-9 bg-white"
  />
</div>
```
Select Trigger (pagination):
```tsx
<SelectTrigger className="w-[70px] bg-white cursor-pointer">
  <SelectValue />
</SelectTrigger>
```
DatePickerWithRange (sudah built-in styling rounded-md):
```tsx
<DatePickerWithRange
  className="w-[240px]"
  date={dateRange}
  onChange={...}
/>
```

> ⚠️ CATATAN: Jangan gunakan rounded-xl pada Search Input, SelectTrigger pagination, dan DatePickerWithRange di halaman list/filter. rounded-xl hanya dipakai untuk action button (Tambah, Back button) dan Reset Filter button.

CATATAN FORMAT TANGGAL (BUG FIX):
- Format tanggal yang digunakan adalah "dd MMM yyyy" (contoh: 19 Jun 2025), BUKAN "PPP" atau "LLL dd, y" yang bergantung pada locale bahasa Inggris.
- DatePickerWithRange sekarang mendukung prop `placeholder` opsional. Default: "Pilih rentang tanggal".
- DatePicker default placeholder: "Pilih tanggal".
- Jangan gunakan placeholder Bahasa Inggris seperti "Pick a date", "Select date", atau "Pick a date range".

6. Buttons (Aksi & Update)
Aturan: Menggunakan border radius rounded-xl dengan tinggi normal/implicit (tanpa h-12). Gunakan variant outline atau custom bg.
Standardisasi:
tsx

<Button type="button" className="rounded-xl bg-[#1e3a5f] hover:bg-[#152e4d] w-full sm:w-auto">
   Tambah
</Button>
