import db from './db.js';

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL, -- 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat
      subject_id INTEGER NOT NULL,
      order_seq INTEGER DEFAULT 0,
      material TEXT DEFAULT '-',
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      task_code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      deadline TEXT NOT NULL,
      note TEXT DEFAULT '',
      status TEXT DEFAULT 'active', -- active, archived
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL, -- 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat
      name TEXT NOT NULL,
      order_seq INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS scheduler_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_name TEXT NOT NULL,
      execution_date TEXT NOT NULL,
      executed_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(job_name, execution_date)
    );

    CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);
    CREATE INDEX IF NOT EXISTS idx_tasks_subject ON tasks(subject_id, status);
    CREATE INDEX IF NOT EXISTS idx_tasks_code ON tasks(task_code);
    CREATE INDEX IF NOT EXISTS idx_pickets_day ON pickets(day_of_week);
  `);
}
