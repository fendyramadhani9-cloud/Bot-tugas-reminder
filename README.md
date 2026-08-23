# CLASS ASSISTANT — XII TJKT 1

WhatsApp Assistant Bot untuk kelas XII TJKT 1. Dibuat dengan arsitektur yang mengutamakan:
**SIMPLE → LIGHTWEIGHT → RELIABLE → EASY TO MAINTAIN**

---

## Authors & Collaborators

- **Fendy Ramadhani** — [GitHub](https://github.com/fendyramadhani9-cloud)
- **Deri Nugroho** — [GitHub](https://github.com/Deri-Nugroho)

---

## Tech Stack

- **Runtime**: Node.js (ES Module)
- **WhatsApp Library**: Baileys (`@whiskeysockets/baileys`)
- **Database**: SQLite (Built-in `node:sqlite` / SQLite3)
- **Scheduler**: `node-cron`
- **Configuration**: `dotenv`
- **Timezone**: `Asia/Jakarta` (WIB)
- **Production Process Manager**: PM2

---

## Fitur & Jadwal Otomatis

### 1. Daily Picket Reminder (Setiap Hari Pukul 06:30 WIB)
- Mengirimkan daftar petugas piket hari ini.
- Menampilkan rincian tugas piket harian.
- **Logika Pengembalian MBG**:
  - **Senin**: Piket Selasa bertanggung jawab mengembalikan MBG Senin pada hari Senin.
  - **Selasa**: Piket Rabu mengembalikan MBG Selasa pada hari Selasa.
  - **Rabu**: Piket Kamis mengembalikan MBG Rabu pada hari Rabu.
  - **Kamis**: Piket Jumat mengembalikan MBG Kamis pada hari Kamis.
  - **Jumat**: Piket Senin mengembalikan MBG Jumat pada hari Jumat.

### 2. Weekly Kas Reminder (Setiap Hari Rabu Pukul 06:30 WIB)
- Menyisipkan pengumuman tetap kas mingguan pada pesan piket:
  ```text
  PENGUMUMAN

  Kas kelas : Rp5.000
  ```

### 3. Daily Study Reminder (Setiap Hari Pukul 18:30 WIB)
- Mencari jadwal pelajaran dan tugas aktif untuk hari sekolah berikutnya.
- **Logika Weekend**: Pada hari Jumat pukul 18:30 WIB, bot otomatis tidak mencari/mengirim jadwal hari Sabtu (skip).

### 4. Scheduler Idempotency (Anti-Duplicate)
- Menggunakan tabel `scheduler_logs` dengan constraint `UNIQUE(job_name, execution_date)` untuk mencegah pengiriman pesan pengingat ganda saat bot di-restart.

---

## Daftar Perintah (Commands)

### Perintah Siswa & Umum

1. **Lihat Menu Bantuan**
   ```text
   @help
   ```

2. **Lihat Jadwal Pelajaran**
   ```text
   @jadwal [hari]
   ```
   Contoh: `@jadwal Senin`, `@jadwal Selasa`, `@jadwal` (default ke hari ini/hari sekolah terdekat).

3. **Lihat Daftar Tugas Aktif**
   ```text
   @listtugas
   ```
   atau
   ```text
   @list
   ```

### Perintah Khusus Admin

*Hanya nomor yang terdaftar di `ADMIN_NUMBER` pada file `.env` yang dapat menjalankan perintah mutasi data.*

1. **Tambah Tugas Baru**
   ```text
   @tugas
   ```
   Format pengisian:
   ```text
   @tugas
   Mapel : Matematika
   Tugas : Mencatat materi
   Deadline : Besok
   Catatan : Jangan lupa belajar
   ```
   *Sistem mendukung alias penulisan mapel yang fleksibel (misal: `mtk`, `bing`, `indo`, `devops`, `cyber`, `jawa`, `kik`, `jepang`, `pp`, `tka`, `netadmin`, `pai`). Kode tugas (seperti `MTK-01`, `MTK-02`, `DEVOPS-01`) akan di-generate otomatis secara unik.*

2. **Edit Tugas**
   ```text
   @edit [kode_tugas]
   ```
   Contoh: `@edit MTK-01`
   Format perubahan:
   ```text
   @edit MTK-01
   Tugas : Latihan Soal Bab 2
   Deadline : Jumat
   Catatan : Bawa buku berpetak
   ```

3. **Hapus / Arsipkan Tugas**
   ```text
   @hapus [kode_tugas]
   ```
   Contoh: `@hapus MTK-01`

4. **Ubah Materi Mata Pelajaran**
   ```text
   @materi [mapel] : [materi_baru]
   ```
   Contoh: `@materi MTK : Translasi` atau `@materi Matematika : Logika Fuzzy`

---

## Panduan Instalasi & Menjalankan Bot

### 1. Prasyarat
- Node.js (v20 atau lebih baru)
- Git

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/fendyramadhani9-cloud/Bot-tugas-reminder.git
cd Bot-tugas-reminder
npm install
```

### 3. Konfigurasi Environment Variable
Salin template konfigurasi:
```bash
cp .env.example .env
```
Buka file `.env` dan isi variabel berikut:
```env
# ID Chat WhatsApp Tujuan (Group JID atau Personal JID)
# Contoh Group JID: 12036304xxxxxxxxxx@g.us
WA_TARGET_CHAT_ID=12036304xxxxxxxxxx@g.us

# Nomor WhatsApp Admin (hanya nomor ini yang dapat mutasi data)
# Format: kode negara tanpa tanda + (contoh: 6281234567890)
ADMIN_NUMBER=6281234567890

# Timezone
TIMEZONE=Asia/Jakarta
```

### 4. Jalankan Bot (Scan QR Login)
```bash
npm start
```
1. Buka aplikasi WhatsApp di ponsel.
2. Masuk ke **Perangkat Tertaut (Linked Devices)** > **Tautkan Perangkat**.
3. Scan QR Code yang tercetak di terminal.
4. Kredensial autentikasi akan tersimpan di direktori `auth/` secara lokal dan persisten.

---

## Deployment ke Server Production (Linux / LXC / VM / Proxmox)

Gunakan **PM2** agar bot berjalan stabil di background dan otomatis restart bila server reboot:

```bash
# Install PM2 jika belum ada
npm install -g pm2

# Jalankan bot dengan nama class-assistant
pm2 start src/index.js --name class-assistant

# Simpan process list PM2
pm2 save

# Aktifkan startup hook sistem
pm2 startup
```

### Monitoring PM2:
- `pm2 logs class-assistant` : Melihat log realtime
- `pm2 status` : Memeriksa status proses
- `pm2 restart class-assistant` : Me-restart bot

---

## Pengujian / Unit Tests

Jalankan rangkaian test otomatis untuk memverifikasi seluruh modul:
```bash
npm test
```

---

## License

Didistribusikan di bawah lisensi MIT. Lihat file [LICENSE](LICENSE) untuk informasi lebih lanjut.
