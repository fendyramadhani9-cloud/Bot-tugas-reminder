import db from './db.js';
import { initSchema } from './schema.js';

export const SUBJECTS_DATA = [
  { name: 'Matematika', code: 'MTK' },
  { name: 'Bahasa Inggris', code: 'BING' },
  { name: 'Bahasa Indonesia', code: 'BINDO' },
  { name: 'Kejuruan — DevOps Engineering', code: 'DEVOPS' },
  { name: 'Kejuruan — Cyber Security', code: 'CYBER' },
  { name: 'Bahasa Jawa', code: 'BJAWA' },
  { name: 'KIK TJKT', code: 'KIK' },
  { name: 'Bahasa Jepang', code: 'BJPN' },
  { name: 'PP', code: 'PP' },
  { name: 'TKA', code: 'TKA' },
  { name: 'Kejuruan — Network Administration', code: 'NETADMIN' },
  { name: 'PAI & BP', code: 'PAI' }
];

export const SCHEDULES_DATA = [
  // SENIN (1)
  { day: 1, subjectCode: 'BING', order: 1 },
  { day: 1, subjectCode: 'BINDO', order: 2 },
  { day: 1, subjectCode: 'DEVOPS', order: 3 },

  // SELASA (2)
  { day: 2, subjectCode: 'CYBER', order: 1 },
  { day: 2, subjectCode: 'BJAWA', order: 2 },
  { day: 2, subjectCode: 'KIK', order: 3 },
  { day: 2, subjectCode: 'BJPN', order: 4 },
  { day: 2, subjectCode: 'PP', order: 5 },
  { day: 2, subjectCode: 'TKA', order: 6 },

  // RABU (3)
  { day: 3, subjectCode: 'MTK', order: 1 },
  { day: 3, subjectCode: 'KIK', order: 2 },
  { day: 3, subjectCode: 'BJPN', order: 3 },
  { day: 3, subjectCode: 'BING', order: 4 },
  { day: 3, subjectCode: 'TKA', order: 5 },

  // KAMIS (4)
  { day: 4, subjectCode: 'NETADMIN', order: 1 },
  { day: 4, subjectCode: 'DEVOPS', order: 2 },

  // JUMAT (5)
  { day: 5, subjectCode: 'NETADMIN', order: 1 },
  { day: 5, subjectCode: 'PAI', order: 2 }
];

export const PICKETS_DATA = [
  // SENIN (1)
  { day: 1, members: ['Ghazi', 'Haikal', 'Nanda', 'Dias', 'Awa', 'Beni', 'Bayu', 'Jelita'] },
  // SELASA (2)
  { day: 2, members: ['Bagas', 'Khaira', 'Zaskia', 'Salsa', 'Naura', 'Imam', 'Fai'] },
  // RABU (3)
  { day: 3, members: ['Deri', 'Bunga', 'Asty', 'Keisya', 'Ian', 'Bastian', 'Rahayu'] },
  // KAMIS (4)
  { day: 4, members: ['Wisnu', 'Fendy', 'Dimas', 'Nabil', 'Pipit', 'Rehana', 'Viona'] },
  // JUMAT (5)
  { day: 5, members: ['Ganang', 'Tasya', 'Nathania', 'Lathif', 'Bilqis', 'Apri', 'Hamdan'] }
];

export function seedDatabase() {
  initSchema();

  const insertSubject = db.prepare('INSERT OR IGNORE INTO subjects (name, code) VALUES (?, ?)');
  const getSubjectByCode = db.prepare('SELECT id FROM subjects WHERE code = ?');

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. Seed Subjects
    for (const sub of SUBJECTS_DATA) {
      insertSubject.run(sub.name, sub.code);
    }

    // 2. Seed Schedules if table is empty
    const scheduleCount = db.prepare('SELECT COUNT(*) as count FROM schedules').get().count;
    if (scheduleCount === 0) {
      const insertSchedule = db.prepare(
        'INSERT INTO schedules (day_of_week, subject_id, order_seq, material) VALUES (?, ?, ?, ?)'
      );
      for (const item of SCHEDULES_DATA) {
        const sub = getSubjectByCode.get(item.subjectCode);
        if (sub) {
          insertSchedule.run(item.day, sub.id, item.order, '-');
        }
      }
    }

    // 3. Seed Pickets if table is empty
    const picketCount = db.prepare('SELECT COUNT(*) as count FROM pickets').get().count;
    if (picketCount === 0) {
      const insertPicket = db.prepare(
        'INSERT INTO pickets (day_of_week, name, order_seq) VALUES (?, ?, ?)'
      );
      for (const group of PICKETS_DATA) {
        group.members.forEach((name, index) => {
          insertPicket.run(group.day, name, index + 1);
        });
      }
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
  console.log('Database seeded successfully.');
}
