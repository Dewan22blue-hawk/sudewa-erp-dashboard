# Prompt Sistem untuk Replikasi Landing Page SaaS Modern

**Instruksi Utama (System Prompt)**
Gunakan instruksi di bawah ini ke agent AI (seperti Gemini/Cursor/Copilot) di proyek *Wajira-dashboard* Anda untuk mereplikasi *landing page* berskala *enterprise* dengan akurasi tinggi.

---

## Copy & Paste Prompt di Bawah Ini:

```text
Act as an Elite Frontend Developer and UI/UX Architect. 

Tugas Anda adalah membangun ulang sebuah Landing Page berstandar SaaS Enterprise modern (mix antara gaya Mixpanel, Honk, Amie, dan 1Password) untuk proyek "Wajira Dashboard". Proyek ini menggunakan arsitektur halaman Next.js (Pages Router/App Router disesuaikan), Tailwind CSS, Framer Motion, dan komponen Lucide React. Semua komponen harus diletakkan dalam folder modular `src/components/landing/`. Seluruh _copywriting_ menggunakan Bahasa Indonesia dengan _tone_ yang percaya diri, tegas, namun tetap playful.

### 🎨 Panduan Estetika & UI/UX (SANGAT PENTING)
1. **Claymorphism & Glassmorphism:** Setiap kartu (card) dan tombol harus menggunakan efek Claymorphism (bayangan 3D lembut dengan perpaduan `box-shadow` inset putih dan drop shadow kental). Implementasikan utility class `shadow-clay-sm`, `shadow-clay`, dan `shadow-clay-lg` di CSS global jika belum ada.
2. **Honk Aesthetic:** Gunakan tipografi raksasa (`text-[9rem]` pada desktop yang meresponsif mulus jadi `text-[4rem]` di mobile), dengan _tracking_ (jarak antar huruf) sangat rapat (`tracking-[-0.04em]`). Gunakan animasi _memantul (spring)_ dan pergerakan fisik (objek Emoji/ikon yang melayang dengan rotasi).
3. **Amie Aesthetic:** Gunakan _background_ utama yang sangat bersih (`#FAFAFA` atau `#FCFCFD`), dipadukan dengan aksen gradien warna pastel (*Pink, Sky Blue, Soft Purple, Amber*) pada kartu *Bento Grid*.
4. **1Password Aesthetic:** Untuk section spesifik (seperti _How It Works_), gunakan kontras warna gelap ekstrem (*Midnight Navy/Pitch Black*) dengan garis vertikal (Timeline) bercahaya neon (Glow) yang memanjang seiring kita _scroll_ ke bawah (menggunakan `useScroll` framer-motion).
5. **Responsivitas Ekstrem (Mobile-first Dock):** Pada Navbar, pastikan di layar desktop menempel di atas (Top Bar). Namun, jika layar diubah ke seukuran *smartphone* (`md` kebawah), Navbar atas harus sembunyi dan berubah menjadi **Tudder Bar / Floating Bottom Dock Bar** berdesain *frosted glass* di bagian bawah penampang layar yang ramah ibu jari.

---

### 📝 Spesifikasi 8 Modul Komponen yang Harus Dibuat:

Silakan buatkan file-file komponen React (`"use client"`) berikut secara bertahap:

**Part 1: `Navbar.tsx`**
- Interaksi auto-hide top nav pada desktop saat scroll kebawah.
- Mode Mobile: Buat Logo lengket di kiri atas, dan tautan navigasi dipindah total ke *Floating Bottom Dock* (seperti tab iOS UI dengan ikon).

**Part 2: `HeroSection.tsx`**
- Layout: Spline/Blob background `blur-[80px]` warna warni lembut (pink/blue/amber). Tipografi raksasa, subteks, tombol CTA biru elektrik (*Honk style*).
- Mockup: Mockup gambar aplikasi di bagian bawah hero dengan tata letak objek-objek melayang di sudut layar (animasi *framer-motion y-axis / rotasi berulang*).

**Part 3: `TrustedByMarquee.tsx`**
- _Marquee slider infinite_ lambat yang menampilkan klien enterprise atau logo placeholder perusahaan.

**Part 4: `BentoFeatures.tsx`**
- Layout Bento asimetris dengan sudut luar luar biasa bulat (`rounded-[3.5rem]`).
- Hover effect 3D miring sedikit statis. Warna latar per kartu berfokus pada warna pastel lembut (Amie pattern).

**Part 5: `HowItWorks.tsx`**
- Split-screen (kiri teks, kanan visual *sticky*).
- WAJIB gunakan gaya **1Password Future Vision**: Latar Hitam pekat (`#030712`), di sebelah kiri terdapat garis tracking bercahaya warna-warni yang memanjang berdasarkan progres *scroll* (gunakan framer motion `useTransform` dari `scrollYProgress`). Step by step teks menyala saat dijangkau scroll.

**Part 6: `Testimonials.tsx`**
- Grid horizontal atau infinite marquee testimonial. Kotak dengan sudut super membulat, *light shadow clay*, text bold.

**Part 7: `FAQ.tsx`**
- Desain minimalis bersih dengan fungsi Accordion. Wajib gunakan `AnimatePresence` framer-motion untuk animasi terbuka `height: "auto"` secara sangat mulus (butter smooth). 

**Part 8: `FinalCTA.tsx` & `Footer.tsx`**
- Pukulan kontras ekstrim: Kembalikan halaman terakhhir sebelum footer ke warna super gelap (`bg-slate-900`) untuk kotak banner dengan tombol neon menyala untuk `FinalCTA`.
- Akhiri dengan `Footer.tsx` yang clean, rapi (multi-grid), dan informatif.

Tolong jangan berikan semua file sekaligus jika terlalu panjang, berikan Part 1 sampai 3 terlebih dahulu dan saya akan mengevaluasinya.
```
