import { getDayOfWeek, getTodayDateString, formatIndonesianDate, getNowInTimezone } from '../utils/date.js';
import { getPicketMembersByDay, getMbgReturnTeam } from '../services/picketService.js';
import { formatPicketReminder } from '../utils/formatter.js';
import { recordJobExecution } from './logService.js';

export async function runPicketReminder(sock) {
  const now = getNowInTimezone();
  const dayOfWeek = getDayOfWeek(now);
  const todayDateStr = getTodayDateString();
  const jobName = 'DAILY_PICKET_REMINDER';

  // Only run on school days (Monday to Friday = 1 to 5)
  if (dayOfWeek < 1 || dayOfWeek > 5) {
    console.log(`[SCHEDULER] Picket reminder: Weekend (Hari ke-${dayOfWeek}). Skipping.`);
    return;
  }

  // Check idempotency (prevent duplicate reminder on same day)
  const isNew = recordJobExecution(jobName, todayDateStr);
  if (!isNew) {
    console.log(`[SCHEDULER] Picket reminder for ${todayDateStr} already executed. Skipping.`);
    return;
  }

  const members = getPicketMembersByDay(dayOfWeek);
  const mbgReturn = getMbgReturnTeam(dayOfWeek);
  const isWednesday = (dayOfWeek === 3);

  const message = formatPicketReminder(
    formatIndonesianDate(now),
    members,
    mbgReturn ? mbgReturn.returnerDayName : null,
    isWednesday
  );

  const targetChat = process.env.WA_TARGET_CHAT_ID;
  if (!targetChat) {
    console.warn(`[SCHEDULER] WA_TARGET_CHAT_ID is not configured in .env. Message preview:\n${message}`);
    return;
  }

  try {
    await sock.sendMessage(targetChat, { text: message });
    console.log(`[SCHEDULER] Successfully sent Daily Picket Reminder to ${targetChat}`);
  } catch (err) {
    console.error(`[SCHEDULER] Error sending Daily Picket Reminder:`, err);
  }
}
