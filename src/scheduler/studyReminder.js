import { getTomorrowSchoolDay, getTodayDateString, getNowInTimezone } from '../utils/date.js';
import { getScheduleWithTasksByDay } from '../services/scheduleService.js';
import { formatStudySchedule } from '../utils/formatter.js';
import { recordJobExecution } from './logService.js';

export async function runStudyReminder(sock) {
  const todayDateStr = getTodayDateString();
  const jobName = 'DAILY_STUDY_REMINDER';

  const tomorrow = getTomorrowSchoolDay(getNowInTimezone());
  if (!tomorrow) {
    console.log(`[SCHEDULER] Study reminder: Hari ini libur / Jumat sore (tidak ada jadwal sekolah besok). Skipping.`);
    return;
  }

  // Check idempotency (prevent duplicate reminder on same day)
  const isNew = recordJobExecution(jobName, todayDateStr);
  if (!isNew) {
    console.log(`[SCHEDULER] Study reminder for ${todayDateStr} already executed. Skipping.`);
    return;
  }

  const scheduleItems = getScheduleWithTasksByDay(tomorrow.dayOfWeek);
  const message = formatStudySchedule(
    'JADWAL & TUGAS BESOK',
    tomorrow.formattedDate,
    scheduleItems
  );

  const targetChat = process.env.WA_TARGET_CHAT_ID;
  if (!targetChat) {
    console.warn(`[SCHEDULER] WA_TARGET_CHAT_ID is not configured in .env. Message preview:\n${message}`);
    return;
  }

  try {
    await sock.sendMessage(targetChat, { text: message });
    console.log(`[SCHEDULER] Successfully sent Daily Study Reminder to ${targetChat}`);
  } catch (err) {
    console.error(`[SCHEDULER] Error sending Daily Study Reminder:`, err);
  }
}
