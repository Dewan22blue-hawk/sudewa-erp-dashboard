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

**Aturan**: Toolbar terdiri dari dua sisi — kiri (Search + Show per page) dan kanan (action buttons).

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

**Aturan**: Tabel dibungkus dalam `<div>` dengan `rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none`.

```tsx
<div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none">
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

{/* Export / Import */}
<Button variant="outline" className="w-full sm:w-auto">
  <Upload className="h-4 w-4 mr-2" />
  Export
</Button>
```

---

## 11. Format Tanggal (Bug Fix)

- Gunakan format `"dd MMM yyyy"` (contoh: `19 Jun 2025`), **BUKAN** `"PPP"` atau `"LLL dd, y"`.
- `DatePickerWithRange` mendukung prop `placeholder` opsional. Default: `"Pilih rentang tanggal"`.
- `DatePicker` default placeholder: `"Pilih tanggal"`.
- **Jangan** gunakan placeholder bahasa Inggris: `"Pick a date"`, `"Select date"`, `"Pick a date range"`.

---

## Ringkasan Kelas Kunci

| Elemen | Kelas |
|--------|-------|
| Root wrapper | `space-y-6` |
| Toolbar ↔ Table gap | `space-y-4` (wrapper) |
| H1 | `text-2xl font-semibold` |
| Subheader | `text-sm text-muted-foreground` |
| Search Input | `pl-9 bg-white` |
| Select pagination | `w-[70px] bg-white` |
| Table wrapper | `rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none` |
| TableHeader | `bg-[#f8f9fa] border-b border-gray-200` |
| TableHead / Cell | `px-4 py-4` |
| TableRow hover | `hover:bg-gray-50 transition-colors` |
| Pagination btn | `h-9 rounded-xl` |
| Pagination active | `border-slate-200 bg-white text-slate-950 shadow-sm` |
| Action trigger | `h-8 w-8 rounded-full` |
| DropdownMenuContent | `rounded-xl border-slate-200 p-1.5 shadow-lg` |
| DropdownMenuItem | `rounded-lg px-3 py-2` |
| Back button | `h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50` |
| Tambah button | `bg-[#1e3a5f] hover:bg-[#152e4d]` |
