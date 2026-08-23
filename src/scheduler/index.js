import cron from 'node-cron';
import { runPicketReminder } from './picketReminder.js';
import { runStudyReminder } from './studyReminder.js';

const TIMEZONE = process.env.TIMEZONE || 'Asia/Jakarta';

/**
 * Initialize all cron jobs for the bot
 * @param {object} sock - Baileys socket instance
 */
export function initSchedulers(sock) {
  console.log(`[SCHEDULER] Initializing schedulers with timezone: ${TIMEZONE}`);

  // 1. Daily Picket Reminder at 06:30 WIB (Monday to Friday)
  cron.schedule('30 6 * * *', async () => {
    console.log('[SCHEDULER] Triggered 06:30 WIB Picket & Kas Reminder cron job');
    try {
      await runPicketReminder(sock);
    } catch (err) {
      console.error('[SCHEDULER] Error in picket reminder job:', err);
    }
  }, {
    timezone: TIMEZONE
  });

  // 2. Daily Study Schedule Reminder at 18:30 WIB (Monday to Friday)
  cron.schedule('30 18 * * *', async () => {
    console.log('[SCHEDULER] Triggered 18:30 WIB Study Reminder cron job');
    try {
      await runStudyReminder(sock);
    } catch (err) {
      console.error('[SCHEDULER] Error in study reminder job:', err);
    }
  }, {
    timezone: TIMEZONE
  });

  console.log('[SCHEDULER] Schedulers registered:');
  console.log(' - 06:30 WIB : Daily Picket Reminder (+ Kas on Wednesday)');
  console.log(' - 18:30 WIB : Daily Study Schedule & Task Reminder');
}
