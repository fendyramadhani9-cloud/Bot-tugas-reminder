import db from '../database/db.js';
import { findSubject, getActiveTasksBySubject } from './taskService.js';

/**
 * Get daily schedule including material and active tasks for each subject
 * @param {number} dayOfWeek - 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat
 */
export function getScheduleWithTasksByDay(dayOfWeek) {
  if (dayOfWeek < 1 || dayOfWeek > 5) {
    return [];
  }

  const rows = db.prepare(`
    SELECT 
      sc.id AS schedule_id,
      sc.day_of_week,
      sc.order_seq,
      sc.material,
      s.id AS subject_id,
      s.name AS subject_name,
      s.code AS subject_code
    FROM schedules sc
    JOIN subjects s ON sc.subject_id = s.id
    WHERE sc.day_of_week = ? AND sc.is_active = 1
    ORDER BY sc.order_seq ASC
  `).all(dayOfWeek);

  return rows.map(row => {
    const tasks = getActiveTasksBySubject(row.subject_id);
    return {
      scheduleId: row.schedule_id,
      dayOfWeek: row.day_of_week,
      orderSeq: row.order_seq,
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      subjectCode: row.subject_code,
      material: row.material || '-',
      tasks: tasks.map(t => ({
        id: t.id,
        taskCode: t.task_code,
        description: t.description,
        deadline: t.deadline,
        note: t.note || ''
      }))
    };
  });
}

/**
 * Update material for a subject
 */
export function updateMaterial(subjectIdentifier, newMaterial, dayOfWeek = null) {
  const subject = findSubject(subjectIdentifier);
  if (!subject) {
    throw new Error(`Mata pelajaran "${subjectIdentifier}" tidak ditemukan.`);
  }

  const mat = (newMaterial && newMaterial.trim()) ? newMaterial.trim() : '-';

  if (dayOfWeek) {
    db.prepare(`
      UPDATE schedules
      SET material = ?
      WHERE subject_id = ? AND day_of_week = ?
    `).run(mat, subject.id, dayOfWeek);
  } else {
    db.prepare(`
      UPDATE schedules
      SET material = ?
      WHERE subject_id = ?
    `).run(mat, subject.id);
  }

  return {
    subjectName: subject.name,
    subjectCode: subject.code,
    material: mat
  };
}
