# Standar Pembuatan Activity Diagram Wajira ERP

Dokumen ini berisi standar visual, layout, dan isi untuk pembuatan Activity Diagram pada proyek Wajira ERP agar sesuai dengan standar akademik (contoh dosen), rapi, editable, dan layak digunakan dalam dokumen skripsi.

## 1. Prioritas Format

Gunakan prioritas berikut saat membuat diagram:
1. **XML draw.io / diagrams.net** sebagai format utama karena harus bisa diedit ulang secara visual.
2. **PlantUML** sebagai format kode UML pendamping.
3. **Mermaid** sebagai format kode Markdown pendamping.

XML wajib dibuat paling rapi karena akan digunakan untuk kebutuhan revisi visual di draw.io / diagrams.net.

---

## 2. Standar Layout XML draw.io

1. Gunakan layout portrait / vertikal.
2. Buat frame utama atau boundary diagram.
3. Tambahkan judul diagram di bagian atas, misalnya: `Kelola Login` (atau sesuai nama proses).
4. Buat swimlane vertikal dengan minimal dua lane:
   * Actor, misalnya `Admin`, `Finance`, `Warehouse`, atau `User`
   * `Sistem`
5. Swimlane harus tersusun sejajar kiri-kanan, tetapi alur proses tetap turun ke bawah.
6. Semua aktivitas dalam lane harus disusun vertikal dari atas ke bawah. Jangan membuat node menyebar terlalu jauh ke samping.
7. Gunakan simbol Activity Diagram yang benar:
   * **Start node**: lingkaran hitam.
   * **Activity/action**: rounded rectangle.
   * **Decision**: diamond.
   * **End node**: final node lingkaran hitam dengan lingkaran luar.
   * **Connector**: panah hitam.
8. Gunakan garis connector yang rapi, tidak saling bertabrakan, dan tidak terlalu panjang.
9. Gunakan ukuran shape yang konsisten dan rata tengah (header swimlane).
10. Gunakan warna sederhana hitam putih agar sesuai standar akademik. Hindari style dashboard modern berwarna-warni untuk UML.
11. Pastikan hasil XML ketika dibuka di draw.io terlihat seperti diagram akademik, bukan flowchart bebas.

---

## 3. Standar Layout PlantUML

```plantuml
|Admin|
start
:Aktivitas admin;

|Sistem|
:Aktivitas sistem;
```

**Ketentuan:**
1. Gunakan swimlane/partition berdasarkan actor dan sistem.
2. Alur harus bergerak dari atas ke bawah.
3. Hindari struktur `if - else if` yang membuat diagram melebar.
4. Gunakan validasi keputusan sekuensial.
5. Jangan gunakan banyak cabang dari satu decision node.
6. Jangan memasukkan detail teknis (endpoint, db, dll.).
7. Hanya menggambarkan proses bisnis secara garis besar.

---

## 4. Standar Layout Mermaid

```mermaid
flowchart TD
```

**Ketentuan:**
1. Wajib menggunakan `flowchart TD` (Top-Down).
2. Jangan menggunakan `direction LR` karena membuat diagram melebar ke samping.
3. Jika memakai `subgraph`, gunakan `direction TB`.
4. Hindari struktur bercabang besar menyamping, gunakan keputusan sekuensial dari atas ke bawah.
5. Mermaid tidak perlu dibuat terlalu kompleks, fokus pada alur utama yang mudah dibaca.

---

## 5. Standar Isi Activity Diagram

Activity Diagram harus fokus pada **alur aktivitas atau proses bisnis secara garis besar dari sisi pengguna dan sistem**.

**DILARANG memasukkan detail teknis seperti:**
* Endpoint API.
* Request dan response API.
* Nama function / variable / file source code.
* State management.
* Database query / controller / service / repository.

> Activity Diagram = alur aktivitas/proses bisnis dari sisi pengguna dan sistem.
> Sequence Diagram = alur interaksi teknis antar komponen sistem untuk developer.

---

## 6. Standar Actor Berdasarkan Use Case

Gunakan actor sesuai Use Case Diagram (Administrator, Finance, Warehouse). Activity Diagram dibuat berdasarkan **use case atau proses bisnis**.

1. Jika proses hanya dilakukan satu actor, gunakan actor tersebut sebagai swimlane (contoh: Master Data Akun → Administrator dan Sistem).
2. Jika proses dapat dilakukan beberapa actor dengan alur yang sama, gunakan nama actor gabungan (contoh: Login → Administrator / Finance / Warehouse dan Sistem).
3. Jika proses berbeda untuk setiap actor, buat diagram terpisah sesuai perbedaan proses.

---

## 7. Instruksi Khusus (Quality Control)

1. Jangan membuat diagram melebar ke samping.
2. Jangan membuat banyak cabang dari satu node besar.
3. Jangan memakai `direction LR` pada Mermaid.
4. Jangan membuat koordinat XML terlalu bebas atau tidak sejajar.
5. Gunakan layout swimlane vertikal seperti contoh diagram akademik.
6. Pastikan aktivitas user berada di lane actor dan sistem di lane Sistem.
7. Pastikan alur antar lane tetap rapi dan mudah diikuti.
8. Gunakan decision node hanya untuk kondisi penting.
9. Jika ada proses tambah, edit, hapus, buat alurnya secara sekuensial ke bawah.
10. **Prioritaskan kerapihan visual XML** karena XML akan diedit di draw.io.

---

## 8. Format Output Wajib (File Markdown)

Dokumentasi diagram untuk suatu fitur/modul wajib disimpan dalam satu file Markdown di folder `docs` dengan struktur berikut:

```markdown
# Activity Diagram [Nama Modul/Sub Menu]

## 1. Deskripsi
Berisi deskripsi singkat proses bisnis.

## 2. Aktor yang Terlibat
Berisi actor sesuai Use Case Diagram.

## 3. Alur Proses
Berisi alur proses secara garis besar dari sisi actor dan sistem.

## 4. XML Activity Diagram
\```xml
<!-- XML draw.io / diagrams.net yang editable dan rapi -->
\```

## 5. PlantUML Activity Diagram

\```plantuml
@startuml
...
@enduml
\```

## 6. Mermaid Activity Diagram

\```mermaid
flowchart TD
...
\```

## 7. Catatan Validasi
Berisi catatan validasi proses, decision, dan kondisi penting.
```

**Catatan Akhir:** Pastikan ketiga format diagram menggambarkan alur yang sama. XML draw.io merupakan acuan visual utama agar rapi, editable, dan sesuai untuk skripsi.
