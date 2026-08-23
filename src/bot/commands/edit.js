import { getTaskByCode, updateTask } from '../../services/taskService.js';
import { parseTaskInput } from './tugas.js';
import { isAdmin } from '../../utils/auth.js';

export async function handleEdit(sock, chatJid, senderJid, rawText) {
  // Extract first line or task code
  const lines = rawText.split('\n');
  const firstLine = lines[0].trim();
  
  // E.g. "@edit MTK-01" -> match code
  const codeMatch = firstLine.match(/@?edit\s+([A-Za-z0-9-]+)/i);
  if (!codeMatch) {
    await sock.sendMessage(chatJid, {
      text: 'Format yang benar:\n\n@edit MTK-01'
    });
    return;
  }

  const taskCode = codeMatch[1].trim().toUpperCase();
  const existing = getTaskByCode(taskCode);

  if (!existing) {
    await sock.sendMessage(chatJid, {
      text: `Tugas dengan kode ${taskCode} tidak ditemukan.`
    });
    return;
  }

  // If only "@edit MTK-01" was sent without multiline modifications, show current details
  if (lines.length === 1) {
    const response = `Edit Tugas\n\nKode : ${existing.task_code}\nMapel : ${existing.subject_name}\nTugas : ${existing.description}\nDeadline : ${existing.deadline}\nCatatan : ${existing.note || '-'}\n\nKirim format berikut untuk mengubah:\n@edit ${existing.task_code}\nTugas : ${existing.description}\nDeadline : ${existing.deadline}\nCatatan : ${existing.note || '-'}`;
    await sock.sendMessage(chatJid, { text: response });
    return;
  }

  // Parse edits from remaining lines
  const parsed = parseTaskInput(lines.slice(1).join('\n'));

  const updateData = {};
  if (parsed.tugas) updateData.description = parsed.tugas;
  if (parsed.deadline) updateData.deadline = parsed.deadline;
  if (parsed.catatan !== undefined && parsed.catatan !== '') {
    updateData.note = parsed.catatan;
  }

  if (Object.keys(updateData).length === 0) {
    await sock.sendMessage(chatJid, {
      text: 'Tidak ada perubahan yang dimasukkan.'
    });
    return;
  }

  const updated = updateTask(taskCode, updateData);

  const response = `Tugas berhasil diubah.\n\nKode : ${updated.task_code}\nMapel : ${updated.subject_name}\nTugas : ${updated.description}\nDeadline : ${updated.deadline}\nCatatan : ${updated.note || '-'}`;

  await sock.sendMessage(chatJid, { text: response });
}
