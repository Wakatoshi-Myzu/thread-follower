# 🏛️ OOP Mastery for Frontend Developers
### Interactive Learning Hub: 4 Pilar Object-Oriented Programming (OOP)

Aplikasi web interaktif modern yang dirancang khusus bagi frontend developer untuk memahami, mempraktikkan, dan menguasai **4 Pilar Utama Object-Oriented Programming (OOP)** melalui implementasi *real-world mini projects*.

Dibangun menggunakan stack mutakhir:
- ⚡ **[TanStack Start](https://tanstack.com/start)** (Full-stack React framework dengan SSR & type-safe file-based routing)
- ⚛️ **React 19**
- 🛡️ **TypeScript** (Strict mode dengan ES2022 Private Fields `#`)
- 🎨 **Tailwind CSS v4** (`@tailwindcss/vite`)
- 🧩 **Shadcn UI Components** (Card, Tabs, Button, Badge, Input, Table, Alert)

---

## 📁 Struktur Routing & Halaman Dinamis (Nested Dynamic Routes)

Aplikasi memanfaatkan sistem routing file-based dari TanStack Router / TanStack Start:

```
src/routes/
├── __root.tsx                               # Layout root, navbar, tema, footer
├── index.tsx                                # Dashboard Overview 4 Pilar OOP (/)
├── about.tsx                                # Panduan filosofi OOP & Clean Architecture (/about)
├── pillars.$pillarId.index.tsx              # Detail overview pilar & list sub-project (/pillars/$pillarId)
└── pillars.$pillarId.$projectId.tsx         # Interactive Playground & Code Inspector (/pillars/$pillarId/$projectId)
```

---

## 🎯 4 Pilar OOP & 8 Real-World Mini Projects

### 🛡️ Pilar 1: Encapsulation (`/pillars/encapsulation`)
*Menyembunyikan data sensitif dan melindungi integritas state melalui kontrol akses yang ketat.*
- **Mini Project 1: Bank Account & Wallet Engine** (`/pillars/encapsulation/bank-account`)
  - Mengelola saldo (`#balance`), PIN rahasia (`#pin`), dan riwayat mutasi transaksi secara privat di dalam class.
  - Sedia tombol uji coba simulasi injeksi/mutasi paksa `wallet.#balance = 999M` yang diblokir otomatis oleh JavaScript Private Field.
- **Mini Project 2: User Session Manager** (`/pillars/encapsulation/user-session`)
  - Mengatur token JWT bertopeng (*masked*), expiry countdown timer, dan data user imutabel menggunakan `Object.freeze` untuk mencegah *Client-Side Privilege Escalation*.

---

### 🧬 Pilar 2: Inheritance (`/pillars/inheritance`)
*Menggunakan kembali kode umum pada Parent Class dan memperluas spesialisasi perilaku pada Subclass.*
- **Mini Project 1: Employee Payroll System** (`/pillars/inheritance/payroll`)
  - Base class `Employee` (id, nama, departemen, slip gaji umum).
  - Subclass `FulltimeEmployee` meng-override perhitungan kompensasi dengan tunjangan bulanan dan bonus tahunan.
  - Subclass `FreelancerEmployee` meng-override perhitungan kompensasi berdasarkan jam kerja logistik (`logHours`).
- **Mini Project 2: E-Commerce Product Catalog** (`/pillars/inheritance/product-catalog`)
  - Base class `Product` (SKU, judul, harga, stok).
  - Subclass `DigitalProduct` memenuhi pesanan dengan instant download link & serial lisensi (ongkir Rp 0).
  - Subclass `PhysicalProduct` menghitung ongkir dinamis berdasarkan berat, asuransi pecah belah (*fragile*), dan kota tujuan.

---

### 🎭 Pilar 3: Polymorphism (`/pillars/polymorphism`)
*Satu antarmuka universal, banyak bentuk implementasi spesifik di baliknya (Dynamic Dispatch).*
- **Mini Project 1: Multi-Payment Gateway** (`/pillars/polymorphism/payment-gateway`)
  - Interface universal `PaymentGateway` dengan method tunggal `.pay(amount)`.
  - Tiga implementasi kelas: `CreditCardPayment`, `EWalletPayment` (GoPay/OVO), dan `QrisPayment` (Standar BI).
  - Fungsi orchestrator `executeUniversalCheckout(gateway, amount)` mengeksekusi transaksi secara polimorfik tanpa `switch-case` atau `if-else` panjang.
- **Mini Project 2: Multi-Channel Notification System** (`/pillars/polymorphism/notification`)
  - Interface universal `NotificationChannel` dengan method `.send(recipient, message)`.
  - Implementasi: `EmailNotification` (SMTP), `SmsNotification` (SMPP), dan `PushNotification` (FCM/APNs).
  - Broadcaster mengeksekusi batch broadcast ke seluruh array saluran terpilih secara seragam.

---

### 🧭 Pilar 4: Abstraction (`/pillars/abstraction`)
*Fokus pada apa yang dilakukan (kontrak), sembunyikan kerumitan cara kerjanya secara internal.*
- **Mini Project 1: Storage Adapter Engine** (`/pillars/abstraction/storage`)
  - Abstract class `StorageAdapter` (`get`, `set`, `remove`, `clear`).
  - Implementasi konkret: `LocalStorageAdapter` (browser disk) dan `MemoryStorageAdapter` (RAM Map).
  - `NoteManagerService` menerima adapter lewat *Dependency Injection*. User dapat menukar engine penyimpanan secara live saat runtime tanpa mengubah satu baris pun logika bisnis!
- **Mini Project 2: API Client Service (REST vs GraphQL)** (`/pillars/abstraction/api-client`)
  - Abstract class `BaseApiClient` menyembunyikan detail protokol networking HTTP headers dan serialization.
  - Implementasi konkret: `RestMockClient` dan `GraphQLMockClient`.
  - Komponen UI memanggil method abstrak `.get()` dan `.post()` dengan response seragam.

---

## 💻 Fitur di Setiap Halaman Mini Project

1. **Interactive UI Demo**:
   - Simulator form dan tombol aksi yang langsung berinteraksi dengan instance class TypeScript murni yang sedang aktif di memori.
2. **Code Inspector / Snippet View**:
   - Tab switcher antara:
     - `TypeScript Class Engine` (Class OOP murni)
     - `Client Usage / Driver` (Cara komponen mengonsumsi class tersebut)
     - `Penjelasan Konsep & Analogi` (Analogi dunia nyata & alasan mengapa krusial di frontend modern)
   - Tombol **Salin Kode (Copy to Clipboard)**.
3. **Responsive & Modern Styling**:
   - Clean dark & light mode (disinkronkan dengan preferensi sistem/toggle).
   - Glassmorphic card styling, badge bergradasi, dan notifikasi alert dinamis.

---

## 🚀 Menjalankan Project Secara Lokal

Pastikan Anda telah menginstal **Bun** (atau Node.js / pnpm).

```bash
# Pindah ke direktori project
cd /Users/nurrohmanmarduki/Documents/project/for-learning/object-oriented-programming

# Jalankan server development
bun run dev
```

Buka browser Anda di:
👉 **`http://localhost:3000`**

### Perintah Lainnya:
```bash
# Men-generate ulang route tree jika ada file rute baru
bun run generate-routes

# Build produksi (SSR + Client bundle)
bun run build

# Preview build produksi
bun run preview
```
