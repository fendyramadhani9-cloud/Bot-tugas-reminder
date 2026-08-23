import db from '../database/db.js';

// Common aliases / typos / shorthand map
const SUBJECT_ALIASES = {
  'mtk': 'MTK',
  'matematika': 'MTK',
  'mat': 'MTK',
  'math': 'MTK',
  'mate': 'MTK',
  'bing': 'BING',
  'inggris': 'BING',
  'b.ing': 'BING',
  'b.ing-12': 'BING',
  'b.inggris': 'BING',
  'english': 'BING',
  'bindo': 'BINDO',
  'indonesia': 'BINDO',
  'b.indo': 'BINDO',
  'b.indo-12': 'BINDO',
  'b.indonesia': 'BINDO',
  'devops': 'DEVOPS',
  'devopseng': 'DEVOPS',
  'dev': 'DEVOPS',
  'devop': 'DEVOPS',
  'kk-tjkt-12-devopseng': 'DEVOPS',
  'cyber': 'CYBER',
  'cybersec': 'CYBER',
  'cybersecurity': 'CYBER',
  'cyber sec': 'CYBER',
  'kk-tjkt-12-cybersec-spc': 'CYBER',
  'bjawa': 'BJAWA',
  'jawa': 'BJAWA',
  'b.jawa': 'BJAWA',
  'b.jawa-12': 'BJAWA',
  'kik': 'KIK',
  'kik-tjkt': 'KIK',
  'kik-tjkt-12': 'KIK',
  'bjpn': 'BJPN',
  'jepang': 'BJPN',
  'jpn': 'BJPN',
  'b.jpn': 'BJPN',
  'b.jepang': 'BJPN',
  'mpil-tjkt-12-b.jpn': 'BJPN',
  'pp': 'PP',
  'pp-12': 'PP',
  'pkn': 'PP',
  'pancasila': 'PP',
  'tka': 'TKA',
  '+tka': 'TKA',
  'netadmin': 'NETADMIN',
  'net': 'NETADMIN',
  'network': 'NETADMIN',
  'jaringan': 'NETADMIN',
  'kk-tjkt-12-netadmin': 'NETADMIN',
  'pai': 'PAI',
  'pai-bp': 'PAI',
  'pai-bp-12': 'PAI',
  'agama': 'PAI',
  'islam': 'PAI'
};

/**
 * Find subject by ID, code, name, or alias (case-insensitive & whitespace-tolerant)
 */
export function findSubject(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim().toLowerCase();

  // Try by ID
  if (/^\d+$/.test(clean)) {
    const row = db.prepare('SELECT * FROM subjects WHERE id = ?').get(parseInt(clean, 10));
    if (row) return row;
  }

  // Try alias map first
  if (SUBJECT_ALIASES[clean]) {
    const targetCode = SUBJECT_ALIASES[clean];
    const byAlias = db.prepare('SELECT * FROM subjects WHERE UPPER(code) = UPPER(?)').get(targetCode);
    if (byAlias) return byAlias;
  }

  // Try by Code
  const byCode = db.prepare('SELECT * FROM subjects WHERE UPPER(code) = UPPER(?)').get(clean);
  if (byCode) return byCode;

  // Try by exact Name
  const byName = db.prepare('SELECT * FROM subjects WHERE UPPER(name) = UPPER(?)').get(clean);
  if (byName) return byName;

  // Try by partial Name match
  const byPartial = db.prepare('SELECT * FROM subjects WHERE UPPER(name) LIKE UPPER(?)').get(`%${clean}%`);
  return byPartial || null;
}

/**
 * Generate next unique task code for a subject (e.g. MTK-01, MTK-02)
 */
export function generateNextTaskCode(subjectId, subjectCode) {
  // Find highest sequence number for this subject
  const rows = db.prepare(
    'SELECT task_code FROM tasks WHERE subject_id = ?'
  ).all(subjectId);

  let maxNum = 0;
  const prefix = subjectCode.toUpperCase();
  const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');

  for (const row of rows) {
    const match = row.task_code.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  const nextNum = String(maxNum + 1).padStart(2, '0');
  return `${prefix}-${nextNum}`;
}

/**
 * Create a new task
 */
export function createTask({ subjectIdentifier, description, deadline, note = '' }) {
  const subject = findSubject(subjectIdentifier);
  if (!subject) {
    throw new Error(`Mata pelajaran "${subjectIdentifier}" tidak ditemukan.`);
  }

  if (!description || !description.trim()) {
    throw new Error('Deskripsi tugas tidak boleh kosong.');
  }

  if (!deadline || !deadline.trim()) {
    throw new Error('Deadline tugas tidak boleh kosong.');
  }

  const taskCode = generateNextTaskCode(subject.id, subject.code);

  const stmt = db.prepare(`
    INSERT INTO tasks (subject_id, task_code, description, deadline, note, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', datetime('now', 'localtime'), datetime('now', 'localtime'))
  `);

  stmt.run(subject.id, taskCode, description.trim(), deadline.trim(), (note || '').trim());

  return {
    taskCode,
    subjectName: subject.name,
    subjectCode: subject.code,
    description: description.trim(),
    deadline: deadline.trim(),
    note: (note || '').trim()
  };
}

/**
 * Get active task by code
 */
export function getTaskByCode(taskCode) {
  if (!taskCode) return null;
  const cleanCode = taskCode.trim().toUpperCase();
  const row = db.prepare(`
    SELECT t.*, s.name AS subject_name, s.code AS subject_code
    FROM tasks t
    JOIN subjects s ON t.subject_id = s.id
    WHERE UPPER(t.task_code) = UPPER(?) AND t.status = 'active'
  `).get(cleanCode);

  return row || null;
}

/**
 * Get any task by code (including archived, for checking)
 */
export function getAnyTaskByCode(taskCode) {
  if (!taskCode) return null;
  const cleanCode = taskCode.trim().toUpperCase();
  return db.prepare(`
    SELECT t.*, s.name AS subject_name, s.code AS subject_code
    FROM tasks t
    JOIN subjects s ON t.subject_id = s.id
    WHERE UPPER(t.task_code) = UPPER(?)
  `).get(cleanCode) || null;
}

/**
 * Archive / delete a task
 */
export function archiveTask(taskCode) {
  const task = getTaskByCode(taskCode);
  if (!task) {
    return null;
  }

  db.prepare(`
    UPDATE tasks
    SET status = 'archived', updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(task.id);

  return task;
}

/**
 * Update an existing task
 */
export function updateTask(taskCode, { description, deadline, note }) {
  const task = getTaskByCode(taskCode);
  if (!task) {
    return null;
  }

  const newDesc = description !== undefined ? description.trim() : task.description;
  const newDeadline = deadline !== undefined ? deadline.trim() : task.deadline;
  const newNote = note !== undefined ? note.trim() : task.note;

  db.prepare(`
    UPDATE tasks
    SET description = ?, deadline = ?, note = ?, updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(newDesc, newDeadline, newNote, task.id);

  return {
    ...task,
    description: newDesc,
    deadline: newDeadline,
    note: newNote
  };
}

/**
 * Get all active tasks, ordered by subject and creation date
 */
export function getAllActiveTasks() {
  return db.prepare(`
    SELECT t.*, s.name AS subject_name, s.code AS subject_code
    FROM tasks t
    JOIN subjects s ON t.subject_id = s.id
    WHERE t.status = 'active'
    ORDER BY s.name ASC, t.id ASC
  `).all();
}

/**
 * Get active tasks for a specific subject
 */
export function getActiveTasksBySubject(subjectId) {
  return db.prepare(`
    SELECT *
    FROM tasks
    WHERE subject_id = ? AND status = 'active'
    ORDER BY id ASC
  `).all(subjectId);
}
