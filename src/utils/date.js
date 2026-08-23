const TIMEZONE = process.env.TIMEZONE || 'Asia/Jakarta';

export const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Get current Date object adjusted to configured Timezone
 */
export function getNowInTimezone() {
  const str = new Date().toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(str);
}

/**
 * Returns ISO Date string (YYYY-MM-DD) for today in timezone
 */
export function getTodayDateString() {
  const now = getNowInTimezone();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns day number: 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu, 7 = Minggu
 */
export function getDayOfWeek(date = getNowInTimezone()) {
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Format a Date into Indonesian human-readable string: "Selasa, 25 Agustus 2026"
 */
export function formatIndonesianDate(date = getNowInTimezone()) {
  const dayName = DAY_NAMES[getDayOfWeek(date)];
  const dayNum = date.getDate();
  const monthName = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

/**
 * Parse Indonesian day name to day of week number (1-5 for school days, 1-7 overall)
 */
export function parseDayName(name) {
  if (!name) return null;
  const clean = name.trim().toLowerCase();
  const map = {
    'senin': 1, 'sen': 1, 'monday': 1, 'mon': 1,
    'selasa': 2, 'sel': 2, 'tuesday': 2, 'tue': 2,
    'rabu': 3, 'rab': 3, 'wednesday': 3, 'wed': 3,
    'kamis': 4, 'kam': 4, 'thursday': 4, 'thu': 4,
    'jumat': 5, 'jum': 5, 'jum\'at': 5, 'friday': 5, 'fri': 5,
    'sabtu': 6, 'sab': 6, 'saturday': 6, 'sat': 6,
    'minggu': 7, 'min': 7, 'ahad': 7, 'sunday': 7, 'sun': 7
  };
  return map[clean] || null;
}

/**
 * Determines next school day information for study reminder (runs at 18:30)
 * - Senin (1) -> Selasa (2)
 * - Selasa (2) -> Rabu (3)
 * - Rabu (3) -> Kamis (4)
 * - Kamis (4) -> Jumat (5)
 * - Jumat (5) -> null (skip weekend)
 * - Sabtu (6) / Minggu (7) -> null or next Senin if needed
 */
export function getTomorrowSchoolDay(date = getNowInTimezone()) {
  const currentDay = getDayOfWeek(date);
  
  if (currentDay >= 1 && currentDay <= 4) {
    // Tomorrow is a school day (Tue, Wed, Thu, Fri)
    const targetDate = new Date(date);
    targetDate.setDate(date.getDate() + 1);
    return {
      dayOfWeek: currentDay + 1,
      dayName: DAY_NAMES[currentDay + 1],
      date: targetDate,
      formattedDate: formatIndonesianDate(targetDate)
    };
  }

  // Friday evening (or weekends) - no Saturday school schedule
  return null;
}
