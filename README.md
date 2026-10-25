# Sublimatio — Ephemeral Payload Buffer

Frontend **React + Vite** untuk Tugas 6 (BAB 6 React Dasar).

Aplikasi bertopik **buffer sinkronisasi data sementara antar device**. Entitas data
utama adalah **Payload**: satu item transient berupa file, link, atau text snippet
yang memiliki hitungan TTL dan otomatis tersublimasi (terhapus dari RAM) saat
kedaluwarsa.

## Menjalankan

```bash
npm install
npm run dev
```

Buka <http://localhost:5173> — screenshot tampilan ini dipakai sebagai bukti
instalasi berhasil.

Perintah lain:

```bash
npm run build     # production build ke dist/
npm run preview   # pratinjau hasil build
```

## Halaman (React Router)

| Route        | View          | Keterangan                          |
| ------------ | ------------- | ----------------------------------- |
| `/`          | `LoginView`   | Login dengan validasi input         |
| `/dashboard` | `DashboardView` | Buffer payload, form, log, modal  |
| `/client`    | `ClientView`  | Kirim payload dari device client    |
| `/connect`   | `ConnectView` | QR pairing device mobile            |

## Struktur

```
index.html                 # entry Vite
vite.config.js
tailwind.config.cjs        # tailwind v3 (theme & animasi custom)
src/
  main.jsx                 # ReactDOM + BrowserRouter
  App.jsx                  # state array Payload + routing + timer TTL + toast
  index.css                # tailwind directives + global styles
  data/payloads.js         # seed data entitas Payload + log
  utils/payload.js         # util murni (TTL, filter, sort, hash)
  components/
    Sidebar.jsx            # navigasi
    AppHeader.jsx          # judul aplikasi + tombol aksi
    PayloadStats.jsx       # ringkasan jumlah data
    FilterToolbar.jsx      # filter / sort / search
    PayloadList.jsx        # container list (render .map() + key)
    PayloadCard.jsx        # kartu tiap payload
    TtlRing.jsx            # circular countdown TTL
    PayloadForm.jsx        # form controlled + tombol "Tambah Payload"
    EmptyState.jsx         # conditional rendering "Belum ada data Payload"
    SublimationLog.jsx     # log riwayat sublimasi
    InspectModal.jsx       # detail payload
    Modal.jsx              # shell modal
    ToastStack.jsx         # notifikasi
    LoginView.jsx / DashboardView.jsx / ClientView.jsx / ConnectView.jsx
public/assets/             # gambar statis (grid pattern, QR code)
legacy/                    # arsip versi HTML + jQuery sebelum migrasi (di-gitignore)
```

## Pemetaan ke Instruksi Tugas

1. **Topik & entitas** — Sublimatio, entitas utama **Payload**.
2. **React + Vite** — berjalan di `http://localhost:5173`.
3. **GitHub** — remote: `git@github.com:Xaxeric/Sublimatio.git`.
4. **Minimal 5 komponen** — 17 komponen di `src/components/`, tiap komponen
   menerima props sesuai atribut entitas Payload (`id`, `type`, `name`, `device`,
   `size`, `mime`, `url`, `content`, `totalTTL`, `remainingTTL`).
5. **Interaktivitas**
   - a. Daftar payload disimpan sebagai state array di `App.jsx`, dirender dengan
     `.map()` dan `key={payload.id}` di `PayloadList.jsx`.
   - b. Form input **controlled component** di `PayloadForm.jsx` dengan tombol
     **Tambah Payload**.
   - c. **Conditional rendering**: `EmptyState.jsx` menampilkan
     `"Belum ada data Payload"` saat daftar kosong.
6. **Commit** — riwayat commit berisi migrasi bertahap.
