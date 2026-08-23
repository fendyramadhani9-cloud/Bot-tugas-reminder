import { createTask } from '../../services/taskService.js';
import { isAdmin } from '../../utils/auth.js';

/**
 * Parses multiline input formatted as:
 * Mapel : Matematika
 * Tugas : Mencatat materi
 * Deadline : Besok
 * Catatan : Jangan lupa belajar
 */
export function parseTaskInput(text) {
  const lines = text.split('\n');
  const result = {
    mapel: '',
    tugas: '',
    deadline: '',
    catatan: ''
  };

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === 'mapel' || key === 'mata pelajaran' || key === 'subject') {
      result.mapel = val;
    } else if (key === 'tugas' || key === 'deskripsi' || key === 'task') {
      result.tugas = val;
    } else if (key === 'deadline' || key === 'tenggat' || key === 'dl') {
      result.deadline = val;
    } else if (key === 'catatan' || key === 'note' || key === 'ket') {
      result.catatan = val;
    }
  }

  return result;
}

export async function handleTugas(sock, chatJid, senderJid, rawText) {
  const parsed = parseTaskInput(rawText);

  // If user just sent "@tugas" or missing required fields, send the input template
  if (!parsed.mapel && !parsed.tugas && !parsed.deadline) {
    const template = `Tambah Tugas\n\nMapel : \nTugas : \nDeadline : \nCatatan : `;
    await sock.sendMessage(chatJid, { text: template });
    return;
  }

  if (!parsed.mapel) {
    await sock.sendMessage(chatJid, {
      text: 'Format salah. Mapel tidak boleh kosong.\n\nContoh:\nMapel : Matematika\nTugas : Mencatat materi\nDeadline : Besok\nCatatan : Belajar bab 1'
    });
    return;
  }

  if (!parsed.tugas) {
    await sock.sendMessage(chatJid, {
      text: 'Format salah. Tugas tidak boleh kosong.'
    });
    return;
  }

  if (!parsed.deadline) {
    await sock.sendMessage(chatJid, {
      text: 'Format salah. Deadline tidak boleh kosong.'
    });
    return;
  }

  try {
    const created = createTask({
      subjectIdentifier: parsed.mapel,
      description: parsed.tugas,
      deadline: parsed.deadline,
      note: parsed.catatan
    });

    const response = `Tugas berhasil ditambahkan.\n\nKode : ${created.taskCode}\nMapel : ${created.subjectName}\nTugas : ${created.description}\nDeadline : ${created.deadline}`;

    await sock.sendMessage(chatJid, { text: response });
  } catch (err) {
    await sock.sendMessage(chatJid, { text: `Gagal menambahkan tugas: ${err.message}` });
  }
}
