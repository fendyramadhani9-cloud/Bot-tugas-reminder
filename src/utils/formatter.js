const SEPARATOR = '━━━━━━━━━━━━━━━━━━';

/**
 * Format Study / Tomorrow Schedule Reminder message
 * @param {string} title - e.g. "JADWAL & TUGAS BESOK" or "JADWAL SENIN"
 * @param {string} dateHeader - e.g. "Selasa, 25 Agustus 2026" or "Senin"
 * @param {Array} scheduleItems - List of schedule objects with subjectName, material, tasks
 */
export function formatStudySchedule(title, dateHeader, scheduleItems) {
  let text = `${title}\n${dateHeader}\n`;

  if (!scheduleItems || scheduleItems.length === 0) {
    text += `\n${SEPARATOR}\n\nTidak ada jadwal pelajaran.`;
    return text;
  }

  for (const item of scheduleItems) {
    text += `\n${SEPARATOR}\n\n`;
    text += `${item.subjectName}\n`;
    text += `Materi : ${item.material || '-'}\n\n`;

    if (!item.tasks || item.tasks.length === 0) {
      text += 'Tugas : Tidak ada\n';
    } else {
      text += 'Tugas :\n';
      const taskBlocks = item.tasks.map(t => {
        let block = `[${t.taskCode}] ${t.description}\n         Deadline : ${t.deadline}`;
        if (t.note && t.note.trim()) {
          block += `\n         Catatan  : ${t.note.trim()}`;
        }
        return block;
      });
      text += taskBlocks.join('\n\n') + '\n';
    }
  }

  return text.trimEnd();
}

/**
 * Format Picket Reminder message
 * @param {string} dateHeader - e.g. "Rabu, 26 Agustus 2026"
 * @param {string[]} members - Array of member names
 * @param {string} returnerDayName - e.g. "Kamis"
 * @param {boolean} isWednesday - Whether today is Wednesday (Kas reminder)
 */
export function formatPicketReminder(dateHeader, members, returnerDayName, isWednesday = false) {
  let text = `JADWAL PIKET\n${dateHeader}\n\nPiket hari ini:\n\n`;

  if (members && members.length > 0) {
    text += members.join('\n') + '\n\n';
  } else {
    text += 'Tidak ada jadwal piket.\n\n';
  }

  text += `Tugas:\n`;
  text += `- Membersihkan kelas\n`;
  text += `- Mengambil MBG\n`;
  text += `- Membuang sampah\n`;
  text += `- Merapikan kelas\n\n`;

  if (returnerDayName) {
    text += `Pengembalian MBG:\n`;
    text += `Piket ${returnerDayName}\n\n`;
    text += `Silakan kembalikan MBG hari ini.\n`;
  }

  if (isWednesday) {
    text += `\nPENGUMUMAN\n\n`;
    text += `Kas kelas : Rp5.000\n`;
  }

  return text.trimEnd();
}

/**
 * Format active task list message
 * @param {Array} tasks - List of task records
 */
export function formatTaskList(tasks) {
  let text = 'DAFTAR TUGAS AKTIF\n\n';

  if (!tasks || tasks.length === 0) {
    text += 'Tidak ada tugas aktif.';
    return text;
  }

  const taskBlocks = tasks.map(t => {
    let block = `[${t.task_code}] ${t.description}\n${t.subject_name}\nDeadline : ${t.deadline}`;
    if (t.note && t.note.trim()) {
      block += `\nCatatan  : ${t.note.trim()}`;
    }
    return block;
  });

  text += taskBlocks.join('\n\n');
  return text;
}
