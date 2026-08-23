import db from '../database/db.js';

/**
 * Record job execution in scheduler_logs to prevent duplicate runs on restart
 * @param {string} jobName 
 * @param {string} executionDate - YYYY-MM-DD
 * @returns {boolean} true if newly executed, false if already executed today
 */
export function recordJobExecution(jobName, executionDate) {
  try {
    const stmt = db.prepare(`
      INSERT INTO scheduler_logs (job_name, execution_date, executed_at)
      VALUES (?, ?, datetime('now', 'localtime'))
    `);
    stmt.run(jobName, executionDate);
    return true;
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return false; // Already executed
    }
    throw err;
  }
}

/**
 * Check if job has already been executed for a specific date
 * @param {string} jobName 
 * @param {string} executionDate - YYYY-MM-DD
 * @returns {boolean}
 */
export function isJobExecuted(jobName, executionDate) {
  const row = db.prepare(`
    SELECT id FROM scheduler_logs
    WHERE job_name = ? AND execution_date = ?
  `).get(jobName, executionDate);

  return !!row;
}
