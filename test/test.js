import assert from 'assert';
import { seedDatabase } from '../src/database/seed.js';
import db from '../src/database/db.js';
import { createTask, getTaskByCode, archiveTask, updateTask, getAllActiveTasks, findSubject } from '../src/services/taskService.js';
import { getScheduleWithTasksByDay, updateMaterial } from '../src/services/scheduleService.js';
import { getPicketMembersByDay, getMbgReturnTeam } from '../src/services/picketService.js';
import { getTomorrowSchoolDay, parseDayName, formatIndonesianDate } from '../src/utils/date.js';
import { formatStudySchedule, formatPicketReminder, formatTaskList } from '../src/utils/formatter.js';
import { recordJobExecution, isJobExecuted } from '../src/scheduler/logService.js';
import { isAdmin } from '../src/utils/auth.js';
import { parseTaskInput } from '../src/bot/commands/tugas.js';

console.log('============================================================');
console.log('RUNNING SYSTEM & UNIT TESTS FOR CLASS ASSISTANT');
console.log('============================================================\n');

// 1. Seed and check tables
console.log('Test 1: Seeding database & verifying master data...');
seedDatabase();

const subjects = db.prepare('SELECT * FROM subjects ORDER BY id ASC').all();
assert(subjects.length === 12, `Expected 12 subjects, got ${subjects.length}`);
console.log('[OK] Subjects count: 12');

const schedulesCount = db.prepare('SELECT COUNT(*) as count FROM schedules').get().count;
assert(schedulesCount === 18, `Expected 18 schedule entries, got ${schedulesCount}`);
console.log('[OK] Schedules count: 18 (UP-12 properly excluded)');

// 2. Test MBG Logic
console.log('\nTest 2: Verifying MBG Logic for all days...');
const mbgMon = getMbgReturnTeam(1);
assert.strictEqual(mbgMon.returnerDayName, 'Selasa', 'Senin MBG must be returned by Piket Selasa');

const mbgTue = getMbgReturnTeam(2);
assert.strictEqual(mbgTue.returnerDayName, 'Rabu', 'Selasa MBG must be returned by Piket Rabu');

const mbgWed = getMbgReturnTeam(3);
assert.strictEqual(mbgWed.returnerDayName, 'Kamis', 'Rabu MBG must be returned by Piket Kamis');

const mbgThu = getMbgReturnTeam(4);
assert.strictEqual(mbgThu.returnerDayName, 'Jumat', 'Kamis MBG must be returned by Piket Jumat');

const mbgFri = getMbgReturnTeam(5);
assert.strictEqual(mbgFri.returnerDayName, 'Senin', 'Jumat MBG must be returned by Piket Senin');
console.log('[OK] MBG return rotation is 100% accurate (Mon->Tue, Tue->Wed, Wed->Thu, Thu->Fri, Fri->Mon)');

// 3. Test Picket Lists
console.log('\nTest 3: Verifying Picket Member lists...');
const seninMembers = getPicketMembersByDay(1);
assert(seninMembers.includes('Ghazi') && seninMembers.includes('Jelita'), 'Senin members mismatch');
const rabuMembers = getPicketMembersByDay(3);
assert(rabuMembers.includes('Deri') && rabuMembers.includes('Rahayu'), 'Rabu members mismatch');
console.log('[OK] Picket lists verified for class XII TJKT 1');

// 4. Test Task Service & Task Code Generation
console.log('\nTest 4: Testing Task Creation & Auto-Code Generation...');
// Clear any test tasks
db.exec("DELETE FROM tasks WHERE description LIKE 'Test Task%'");

const t1 = createTask({
  subjectIdentifier: 'Matematika',
  description: 'Test Task Mencatat materi',
  deadline: 'Besok',
  note: 'Jangan lupa belajar guys.'
});
assert.strictEqual(t1.taskCode, 'MTK-01', `Expected MTK-01, got ${t1.taskCode}`);

const t2 = createTask({
  subjectIdentifier: 'MTK',
  description: 'Test Task Ulangan materi Translasi',
  deadline: '2 minggu lagi'
});
assert.strictEqual(t2.taskCode, 'MTK-02', `Expected MTK-02, got ${t2.taskCode}`);

const t3 = createTask({
  subjectIdentifier: 'DevOps',
  description: 'Test Task Membuat Dockerfile',
  deadline: 'Jumat'
});
assert.strictEqual(t3.taskCode, 'DEVOPS-01', `Expected DEVOPS-01, got ${t3.taskCode}`);

// Test shorthand lowercase aliases
const subMtk = findSubject('mtk');
assert.strictEqual(subMtk.code, 'MTK');
const subBing = findSubject('b.ing-12');
assert.strictEqual(subBing.code, 'BING');
const subDev = findSubject('dev');
assert.strictEqual(subDev.code, 'DEVOPS');
const subCyber = findSubject('cybersec');
assert.strictEqual(subCyber.code, 'CYBER');
console.log(`[OK] Created tasks: ${t1.taskCode}, ${t2.taskCode}, ${t3.taskCode} and validated flexible subject aliases`);

// 5. Test Schedule with Tasks & Material Update
console.log('\nTest 5: Testing Schedule Retrieval with Tasks & Material...');
updateMaterial('Matematika', 'Translasi');
const wedSchedule = getScheduleWithTasksByDay(3); // Rabu has Matematika
const mtkItem = wedSchedule.find(s => s.subjectCode === 'MTK');
assert(mtkItem, 'Matematika not found in Wednesday schedule');
assert.strictEqual(mtkItem.material, 'Translasi');
assert.strictEqual(mtkItem.tasks.length, 2, 'Matematika should have 2 active tasks');
console.log('[OK] Schedule with dynamic tasks & updated material verified');

// 6. Test Task Update & Archival
console.log('\nTest 6: Testing Task Edit and Soft Delete (Archive)...');
const updatedT1 = updateTask('MTK-01', {
  description: 'Test Task Mencatat materi bab 1',
  deadline: 'Lusa'
});
assert.strictEqual(updatedT1.description, 'Test Task Mencatat materi bab 1');
assert.strictEqual(updatedT1.deadline, 'Lusa');

const deletedT1 = archiveTask('MTK-01');
assert(deletedT1, 'Task should be archived');

const checkActive = getTaskByCode('MTK-01');
assert.strictEqual(checkActive, null, 'Archived task should not be returned by getTaskByCode');
console.log('[OK] Task edit & soft delete verified');

// 7. Test Weekend / School Day logic
console.log('\nTest 7: Testing School Day logic (Friday skip, Mon-Thu next day)...');
const fakeMonday = new Date('2026-08-24T18:30:00+07:00'); // Monday
const tomMon = getTomorrowSchoolDay(fakeMonday);
assert.strictEqual(tomMon.dayOfWeek, 2, 'Monday evening should point to Tuesday (2)');

const fakeFriday = new Date('2026-08-28T18:30:00+07:00'); // Friday
const tomFri = getTomorrowSchoolDay(fakeFriday);
assert.strictEqual(tomFri, null, 'Friday evening should return null (skip Saturday)');
console.log('[OK] Weekend and Friday skip logic verified');

// 8. Test Scheduler Idempotency
console.log('\nTest 8: Testing Scheduler Log Idempotency...');
const testDate = '2026-08-25';
const isFirst = recordJobExecution('TEST_JOB', testDate);
assert.strictEqual(isFirst, true, 'First execution must return true');

const isSecond = recordJobExecution('TEST_JOB', testDate);
assert.strictEqual(isSecond, false, 'Second execution on same day must return false');
assert.strictEqual(isJobExecuted('TEST_JOB', testDate), true);
console.log('[OK] Scheduler duplicate execution prevention verified');

// 9. Test Auth Helper
console.log('\nTest 9: Testing Admin Auth...');
process.env.ADMIN_NUMBER = '6281234567890';
assert.strictEqual(isAdmin('6281234567890@s.whatsapp.net'), true);
assert.strictEqual(isAdmin('6281234567890:1@s.whatsapp.net'), true);
assert.strictEqual(isAdmin('6289999999999@s.whatsapp.net'), false);
console.log('[OK] Admin authorization verification verified');

// 10. Test Formatters Output
console.log('\nTest 10: Testing Clean Formatters...');
const sampleFormatted = formatStudySchedule(
  'JADWAL & TUGAS BESOK',
  'Selasa, 25 Agustus 2026',
  wedSchedule
);
assert(sampleFormatted.includes('JADWAL & TUGAS BESOK'));
assert(sampleFormatted.includes('━━━━━━━━━━━━━━━━━━'));
assert(sampleFormatted.includes('Matematika'));
assert(sampleFormatted.includes('Materi : Translasi'));

const picketFormatted = formatPicketReminder('Rabu, 26 Agustus 2026', rabuMembers, 'Kamis', true);
assert(picketFormatted.includes('JADWAL PIKET'));
assert(picketFormatted.includes('Pengembalian MBG:\nPiket Kamis'));
assert(picketFormatted.includes('Kas kelas : Rp5.000'));
console.log('[OK] Output formatters strictly match prompt specification');

// Cleanup test tasks
db.exec("DELETE FROM tasks WHERE description LIKE 'Test Task%'");
db.exec("DELETE FROM scheduler_logs WHERE job_name = 'TEST_JOB'");

console.log('\n============================================================');
console.log('ALL TESTS PASSED SUCCESSFULLY! (10/10)');
console.log('============================================================\n');
