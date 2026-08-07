# Git Branching & Naming Convention Standard

Dokumen ini merupakan panduan standarisasi penamaan branch Git untuk project Frontend. Standar ini diadaptasi dari praktik terbaik industri teknologi raksasa (seperti Google, Cloudflare, dll) yang menggunakan pola **Git Flow** dan **Conventional Commits**.

## 🏗️ Struktur Penamaan Branch

Format standar penamaan branch adalah sebagai berikut:

```text
<tipe>/<opsional-id-task>-<deskripsi-singkat-dan-jelas>
```

> **Aturan Utama:** Gunakan huruf kecil semua (lowercase) dan pisahkan setiap kata dengan tanda strip (`-` / kebab-case). Dilarang menggunakan spasi.

---

### 🏷️ Kategori / Tipe (Type)

Untuk menggantikan kebiasaan lama (seperti `development/fix-xxx` atau `development/update-xxx`), kita akan menggunakan standar prefix berikut agar branch lebih spesifik berdasarkan tujuannya:

- **`feat/`** atau **`feature/`**: Untuk pengembangan fitur baru.
- **`fix/`** atau **`bugfix/`**: Untuk perbaikan bug pada environment development/staging.
- **`hotfix/`**: Untuk perbaikan bug kritis/urgent yang harus segera naik ke production.
- **`chore/`**: Untuk task maintenance, update dependency, konfigurasi build, penambahan environment variables, dll.
- **`refactor/`**: Untuk perubahan struktur code yang tidak menambah fitur atau memperbaiki bug (misal: merapikan code, optimasi performa).
- **`docs/`**: Untuk perubahan yang hanya berfokus pada dokumentasi (README, changelog, dll).
- **`test/`**: Untuk penambahan atau perbaikan unit test / E2E test.
- **`style/`**: Untuk perubahan formatting code (spasi, linting, prettier, dll) yang tidak mengubah logika aplikasi.

### 📝 Panduan Penulisan Deskripsi (Description)

1. **Singkat, Padat, Jelas**: Hindari menggunakan kalimat panjang. Gunakan 3-5 kata yang langsung mendeskripsikan tujuan branch.
2. **Gunakan Bahasa Inggris** (Disarankan): Untuk menjaga konsistensi dan standar internasional, atau gunakan Bahasa Indonesia yang ringkas.
3. **Sertakan ID Task (Opsional namun sangat direkomendasikan)**: Jika kita menggunakan Jira/Trello/Gitlab Issues, masukkan ID tiket di awal deskripsi (misal: `WJR-123`).

---

### ✅ Contoh Penamaan yang BENAR (DO's)

- `feat/WJR-101-add-login-page` *(Ada tipe, ada ID task, deskripsi jelas)*
- `fix/WJR-102-button-submit-error` *(Perbaikan bug spesifik)*
- `hotfix/payment-gateway-crash` *(Perbaikan kritis tanpa ID task)*
- `chore/update-react-version` *(Tugas maintenance)*
- `refactor/payment-component` *(Merapikan code di komponen tertentu)*

### ❌ Contoh Penamaan yang SALAH (DONT's)

- `bikin-halaman-login` *(Tidak ada tipe/prefix branch)*
- `fix/Benerin tombol error` *(Menggunakan spasi dan huruf kapital, tidak kebab-case)*
- `development/update-dashboard` *(Menggunakan prefix environment, kurang merepresentasikan jenis perubahannya. Lebih baik: `feat/update-dashboard`)*
- `denny/fitur-baru` *(Menggunakan nama developer sebagai prefix. Hindari ini kecuali memang ada konvensi spesifik `feat/denny-fitur-baru`)*

---

## 🔄 Alur Kerja (Workflow) Git

Untuk menjaga kebersihan repository, ikuti alur berikut:

1. **Selalu buat branch baru dari branch target (misal: `development`)**
   Pastikan lokal branch kamu sudah *up-to-date* sebelum membuat branch baru.
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feat/tambah-dashboard-admin
   ```

2. **Lakukan commit secara berkala**
   Gunakan pesan commit yang deskriptif dan ikuti standar *Conventional Commits* (contoh: `feat: add admin dashboard component`).

3. **Push branch ke remote repository**
   ```bash
   git push origin feat/tambah-dashboard-admin
   ```

4. **Buat Pull Request (PR) / Merge Request (MR)**
   Arahkan PR ke branch utama (`development` atau `staging`), dan pastikan mendapat *Code Review* atau mengecek pipeline CI/CD sebelum di-merge.
