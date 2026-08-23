import { archiveTask } from '../../services/taskService.js';
import { isAdmin } from '../../utils/auth.js';

export async function handleHapus(sock, chatJid, senderJid, argsText) {
  const taskCode = argsText ? argsText.trim().toUpperCase() : '';

  if (!taskCode) {
    await sock.sendMessage(chatJid, {
      text: 'Format yang benar:\n\n@hapus MTK-01'
    });
    return;
  }

  const deleted = archiveTask(taskCode);

  if (!deleted) {
    await sock.sendMessage(chatJid, {
      text: `Tugas dengan kode ${taskCode} tidak ditemukan.`
    });
    return;
  }

  const response = `Tugas berhasil dihapus.\n\nKode : ${deleted.task_code}\nMapel : ${deleted.subject_name}\nTugas : ${deleted.description}`;

  await sock.sendMessage(chatJid, { text: response });
}
