export async function handleHelp(sock, chatJid) {
  const message = `CLASS ASSISTANT — XII TJKT 1

DAFTAR PERINTAH:

1. LIHAT JADWAL
@jadwal [hari]
Contoh: @jadwal Senin
(Pilihan hari: Senin, Selasa, Rabu, Kamis, Jumat)

2. LIHAT TUGAS AKTIF
@listtugas
atau
@list
Menampilkan seluruh tugas yang belum selesai.

3. TAMBAH TUGAS (Admin)
@tugas
Kirim @tugas untuk melihat template, atau kirim langsung dengan format:
@tugas
Mapel : Matematika
Tugas : Mencatat materi
Deadline : Besok
Catatan : Bawa buku tugas

4. EDIT TUGAS (Admin)
@edit [kode_tugas]
Contoh: @edit MTK-01

5. HAPUS TUGAS (Admin)
@hapus [kode_tugas]
Contoh: @hapus MTK-01

6. UBAH MATERI (Admin)
@materi [mapel] : [materi_baru]
Contoh: @materi MTK : Translasi`;

  await sock.sendMessage(chatJid, { text: message });
}
