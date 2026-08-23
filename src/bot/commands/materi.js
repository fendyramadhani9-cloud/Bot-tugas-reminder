import { updateMaterial } from '../../services/scheduleService.js';
import { isAdmin } from '../../utils/auth.js';

export async function handleMateri(sock, chatJid, senderJid, rawText) {
  // Format: @materi [mapel] : [materi] OR @materi [mapel] [materi]
  const clean = rawText.replace(/@?materi\s*/i, '').trim();
  
  let mapel = '';
  let materi = '';

  if (clean.includes(':')) {
    const parts = clean.split(':');
    mapel = parts[0].trim();
    materi = parts.slice(1).join(':').trim();
  } else {
    // Split first word as code/subject if simple format
    const firstSpace = clean.indexOf(' ');
    if (firstSpace !== -1) {
      mapel = clean.slice(0, firstSpace).trim();
      materi = clean.slice(firstSpace + 1).trim();
    }
  }

  if (!mapel || !materi) {
    await sock.sendMessage(chatJid, {
      text: 'Format yang benar:\n\n@materi Matematika : Translasi\natau\n@materi MTK Translasi'
    });
    return;
  }

  try {
    const res = updateMaterial(mapel, materi);
    await sock.sendMessage(chatJid, {
      text: `Materi berhasil diperbarui.\n\nMapel : ${res.subjectName}\nMateri : ${res.material}`
    });
  } catch (err) {
    await sock.sendMessage(chatJid, {
      text: `Gagal memperbarui materi: ${err.message}`
    });
  }
}
