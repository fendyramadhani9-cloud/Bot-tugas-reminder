<div align="center">

# CLASS ASSISTANT — XII TJKT 1
### WhatsApp Automation Bot for School Schedule & Tasks Management

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Baileys](https://img.shields.io/badge/Engine-Baileys%20WA-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/WhiskeySockets/Baileys)
[![Cron](https://img.shields.io/badge/Scheduler-Node--Cron-FF6C37?style=for-the-badge&logo=clock&logoColor=white)](https://www.npmjs.com/package/node-cron)
[![PM2](https://img.shields.io/badge/Deploy-PM2%20Ready-2B037A?style=for-the-badge&logo=pm2&logoColor=white)](https://pm2.keymetrics.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Simple</b> • <b>Lightweight</b> • <b>Reliable</b> • <b>Easy to Maintain</b>
</p>

</div>

---

## Authors & Collaborators

<div align="center">

<table>
  <tr>
    <td align="center" width="220">
      <a href="https://github.com/fendyramadhani9-cloud">
        <img src="https://github.com/fendyramadhani9-cloud.png?size=120" width="100px;" alt="Fendy Ramadhani" style="border-radius:50%; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" /><br />
        <sub><b>Fendy Ramadhani</b></sub>
      </a>
      <br />
      <a href="https://github.com/fendyramadhani9-cloud">
        <img src="https://img.shields.io/badge/Developer-Lead-0078D4?style=flat-square" />
      </a>
    </td>
    <td align="center" width="220">
      <a href="https://github.com/Deri-Nugroho">
        <img src="https://github.com/Deri-Nugroho.png?size=120" width="100px;" alt="Deri Nugroho" style="border-radius:50%; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" /><br />
        <sub><b>Deri Nugroho</b></sub>
      </a>
      <br />
      <a href="https://github.com/Deri-Nugroho">
        <img src="https://img.shields.io/badge/DevOps-Deployment%20%26%20CI%2FCD-2EA44F?style=flat-square" />
      </a>
    </td>
  </tr>
</table>

</div>

---

## System Architecture & Workflow

```mermaid
flowchart TD
    subgraph Trigger [Pemicu Sistem]
        A1[Cron 06:30 WIB]
        A2[Cron 18:30 WIB]
        A3[Pesan WhatsApp Masuk]
    end

    subgraph Core [Logic & Security Layer]
        B1{Cek scheduler_logs}
        B2[Picket & MBG Service]
        B3[Schedule & Task Service]
        B4{Validasi Admin JID}
        B5[Command Router]
    end

    subgraph Storage [Database Engine]
        DB[(SQLite Database)]
    end

    subgraph Output [WhatsApp Dispatcher]
        WA[Baileys Socket Connection]
        TG[Target Chat / Group WA]
    end

    %% Cron 06:30 Flow
    A1 --> B1
    B1 -- Belum Eksekusi Hari Ini --> B2
    B2 <--> DB
    B2 --> WA --> TG

    %% Cron 18:30 Flow
    A2 --> B1
    B1 -- Belum Eksekusi Hari Ini --> B3
    B3 <--> DB
    B3 --> WA --> TG

    %% Message Flow
    A3 --> B4
    B4 -- Perintah Mutasi --> B5
    B4 -- Perintah Publik --> B5
    B5 <--> DB
    B5 --> WA --> TG
```

---

## Daily Routine & Timeline

```mermaid
gantt
    title Jadwal Harian Otomatis Bot (Asia/Jakarta)
    dateFormat HH:mm
    axisFormat %H:%M

    section Pagi Hari
    Pengingat Piket & MBG (06:30)           :active, 06:30, 06:35
    Pengumuman Kas Rp5.000 (Khusus Rabu)    :crit, 06:30, 06:35

    section Sore Hari
    Jadwal & Tugas Besok (18:30)            :active, 18:30, 18:35
    Jumat Sore (Skip Hari Sabtu)            :done, 18:30, 18:35
```

---

## Siklus Logika Pengembalian MBG

Sistem memastikan pengembalian MBG dilakukan tepat waktu oleh regu piket hari berikutnya pada hari yang sama:

```mermaid
graph LR
    Senin[Piket Senin Ambil MBG] -->|Dikembalikan hari Senin oleh| Selasa[Piket Selasa]
    Selasa -->|Dikembalikan hari Selasa oleh| Rabu[Piket Rabu]
    Rabu -->|Dikembalikan hari Rabu oleh| Kamis[Piket Kamis]
    Kamis -->|Dikembalikan hari Kamis oleh| Jumat[Piket Jumat]
    Jumat -->|Dikembalikan hari Jumat oleh| Senin[Piket Senin]
```

---

## Daftar Perintah (Command Cheatsheet)

### Perintah Publik (Semua Siswa)

| Perintah | Fungsi | Contoh |
|---|---|---|
| `@help` | Melihat panduan penggunaan | `@help` |
| `@jadwal [hari]` | Melihat jadwal & tugas hari tertentu | `@jadwal Senin` / `@jadwal` |
| `@listtugas` / `@list` | Melihat semua tugas aktif | `@listtugas` |

### Perintah Khusus Admin

*Hanya nomor terdaftar di `ADMIN_NUMBER` yang dapat melakukan mutasi data.*

#### 1. Tambah Tugas (`@tugas`)
Mendukung input alias toleran typo/huruf kecil (`mtk`, `bing`, `indo`, `devops`, `cyber`, dll). Kode unik otomatis dibuat (`MTK-01`, `MTK-02`, dst.).
```text
@tugas
Mapel : Matematika
Tugas : Mencatat materi
Deadline : Besok
Catatan : Bawa buku berpetak
```

#### 2. Edit Tugas (`@edit`)
```text
@edit MTK-01
Tugas : Latihan Soal Translasi
Deadline : Jumat
Catatan : Jangan lupa kalkulator
```

#### 3. Hapus Tugas (`@hapus`)
```text
@hapus MTK-01
```

#### 4. Update Materi (`@materi`)
```text
@materi MTK : Translasi
```

---

## Panduan Instalasi & Menjalankan

### 1. Prasyarat
- Node.js v20+
- Git

### 2. Clone & Install
```bash
git clone https://github.com/fendyramadhani9-cloud/Bot-tugas-reminder.git
cd Bot-tugas-reminder
npm install
```

### 3. Konfigurasi `.env`
Salin template:
```bash
cp .env.example .env
```
Isi variabel:
```env
WA_TARGET_CHAT_ID=12036304xxxxxxxxxx@g.us
ADMIN_NUMBER=6281234567890
TIMEZONE=Asia/Jakarta
```

### 4. Jalankan (Scan QR Login)
```bash
npm start
```
Scan QR yang muncul di terminal melalui WhatsApp di ponsel (**Perangkat Tertaut**).

---

## Deployment Server / Proxmox (PM2)

```bash
# Install PM2
npm install -g pm2

# Start Bot di background
pm2 start src/index.js --name class-assistant

# Simpan state & autostart saat boot
pm2 save
pm2 startup
```

---

## Testing

Jalankan test suite untuk memvalidasi database, format pesan, MBG logic, dan scheduler:
```bash
npm test
```

---

## License

Didistribusikan di bawah [MIT License](LICENSE). Copyright (c) 2026 **Fendy Ramadhani** & **Deri Nugroho**.
