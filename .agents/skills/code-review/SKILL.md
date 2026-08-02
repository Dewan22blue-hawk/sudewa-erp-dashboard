---
name: code-review
description: Melakukan review code untuk mendeteksi bug, mengecek readability, menjaga standar penulisan (Code Quality), dan memastikan tidak ada pesan error build sebelum dipush ke repository.
---

# Code Review Skill

Skill ini dirancang sebagai acuan wajib saat Asisten atau Programmer diminta untuk mengevaluasi baris kode guna menjaga kualitas perangkat lunak (Software Quality Assurance). Gunakan panduan ini secara ketat setiap kali ada permintaan review.

## 1. Pengecekan Readability & Standar Penulisan (Code Quality)
- **Konsistensi UI/UX**: Jika yang di-review adalah komponen Frontend, bandingkan gaya penulisan dengan standarisasi global di `template.md`. Pastikan aturan Spacing, Margin, Table Slicing, dan Debounce selalu ditegakkan.
- **Penamaan Variabel & Fungsi**: Pastikan nama representatif serta menghindari penamaan satu karakter seperti `x` atau `y` (kecuali untuk indeks loop singkat). 
- **Modularitas & (DRY)**: Pastikan tidak terdapat duplikasi kode. Pecah komponen yang terlalu gemuk (>300-400 baris) menjadi helper atau sub-komponen berskala kecil.

## 2. Deteksi Bug & Evaluasi Logika
- **Validasi State**: Cek apakah komponen di React melakukan pembaruan State tanpa efek samping (contoh: *infinite loop* pada useEffect).
- **Pengamanan Tipe Data & Fallback**: Evaluasi implementasi respons API, berikan perlindungan jika nilai yang diterima adalah `null`, `undefined`, atau *empty array*.
- **Client-Side Rendering vs Endpoint Limit**: Jika memvalidasi modul Data Master, pastikan apabila API me-return keseluruhan array mentah (seperti isu `isDirectArray`), fungsi *slice* untuk paginasi sudah terpasang rapi di sisi *Frontend*.

## 3. Pengecekan Build Error (WAJIB SEBELUM PUSH)
- **Kompilasi TypeScript**: **Dilarang** menyetujui, mendukung, atau melakukan eksekusi perintah `git push` jika kode belum diverifikasi tidak ada error *build*.
- **Verifikasi Terminal**: Eksekusikan perintah `npm run build` atau `npx tsc --noEmit` secara lokal menggunakan terminal `run_command` untuk memeriksa tipe deklarasi dan konflik semantik (contoh: *duplicate identifier* error). Pastikan kodenya lulus 100%.

## 4. Pelaporan dan Feedback yang Konstruktif
- **Sampaikan Hasil dengan Jelas**: Berikan daftar apa yang bagus dan daftar pilar/area yang perlu diperbaiki (memakai poin-poin/bullet point).
- **Usulkan Solusi Teknis (Code Snippet)**: Untuk tiap bagian yang perlu direfaktor atau diprogram ulang, sertakan blok kode contoh yang sudah optimal.
- **Konfirmasi**: Akhiri laporan dengan pertanyaan kepada *User* apakah ingin agar kamu yang langsung merubah/meng-override file tersebut melalui *system tooling* atau membiarkan mereka menulis ulang kodenya secara mandiri.
