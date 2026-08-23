import db from '../database/db.js';
import { DAY_NAMES } from '../utils/date.js';

/**
 * Get picket members for a specific day
 * @param {number} dayOfWeek - 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat
 * @returns {string[]} List of member names
 */
export function getPicketMembersByDay(dayOfWeek) {
  if (dayOfWeek < 1 || dayOfWeek > 5) {
    return [];
  }

  const rows = db.prepare(`
    SELECT name
    FROM pickets
    WHERE day_of_week = ?
    ORDER BY order_seq ASC
  `).all(dayOfWeek);

  return rows.map(r => r.name);
}

/**
 * Calculate which picket group is responsible for returning MBG today.
 * Rule:
 * Senin (1) -> MBG Senin dikembalikan oleh Piket Selasa (2)
 * Selasa (2) -> MBG Selasa dikembalikan oleh Piket Rabu (3)
 * Rabu (3) -> MBG Rabu dikembalikan oleh Piket Kamis (4)
 * Kamis (4) -> MBG Kamis dikembalikan oleh Piket Jumat (5)
 * Jumat (5) -> MBG Jumat dikembalikan oleh Piket Senin (1)
 * 
 * @param {number} todayDayOfWeek - 1 to 5
 * @returns {{ returnerDay: number, returnerDayName: string }}
 */
export function getMbgReturnTeam(todayDayOfWeek) {
  if (todayDayOfWeek < 1 || todayDayOfWeek > 5) {
    return null;
  }

  let returnerDay;
  if (todayDayOfWeek === 5) {
    // Friday's MBG is returned by Monday picket team
    returnerDay = 1;
  } else {
    // Mon->Tue, Tue->Wed, Wed->Thu, Thu->Fri
    returnerDay = todayDayOfWeek + 1;
  }

  return {
    returnerDay,
    returnerDayName: DAY_NAMES[returnerDay]
  };
}
