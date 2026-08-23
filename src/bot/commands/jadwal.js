import { parseDayName, DAY_NAMES, getDayOfWeek, getNowInTimezone } from '../../utils/date.js';
import { getScheduleWithTasksByDay } from '../../services/scheduleService.js';
import { formatStudySchedule } from '../../utils/formatter.js';

export async function handleJadwal(sock, chatJid, argsText) {
  let targetDay;

  if (!argsText || !argsText.trim()) {
    // Default to today or next school day
    const current = getDayOfWeek(getNowInTimezone());
    targetDay = (current >= 1 && current <= 5) ? current : 1;
  } else {
    targetDay = parseDayName(argsText.trim());
  }

  if (!targetDay) {
    await sock.sendMessage(chatJid, {
      text: `Hari tidak dikenali. Gunakan format:\n@jadwal Senin\n(Pilihan: Senin, Selasa, Rabu, Kamis, Jumat)`
    });
    return;
  }

  if (targetDay === 6 || targetDay === 7) {
    await sock.sendMessage(chatJid, {
      text: `Hari ${DAY_NAMES[targetDay]} adalah hari libur (tidak ada jadwal sekolah).`
    });
    return;
  }

  const dayName = DAY_NAMES[targetDay];
  const scheduleItems = getScheduleWithTasksByDay(targetDay);
  const formatted = formatStudySchedule(`JADWAL ${dayName.toUpperCase()}`, dayName, scheduleItems);

  await sock.sendMessage(chatJid, { text: formatted });
}
