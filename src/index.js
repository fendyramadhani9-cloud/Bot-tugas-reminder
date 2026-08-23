import 'dotenv/config';
import { seedDatabase } from './database/seed.js';
import { startWhatsAppBot } from './bot/whatsapp.js';

console.log('============================================================');
console.log('   CLASS ASSISTANT — XII TJKT 1 WHATSAPP BOT');
console.log('============================================================');

// 1. Ensure Database & Master Data are ready
try {
  console.log('[SYSTEM] Initializing database and verifying seed data...');
  seedDatabase();
  console.log('[SYSTEM] Database initialization complete.');
} catch (err) {
  console.error('[SYSTEM] Failed to initialize database:', err);
  process.exit(1);
}

// 2. Start WhatsApp Baileys Bot
console.log('[SYSTEM] Starting WhatsApp client...');
startWhatsAppBot().catch(err => {
  console.error('[SYSTEM] Fatal error starting WhatsApp client:', err);
  process.exit(1);
});

// 3. Graceful Shutdown Handlers
process.on('SIGINT', () => {
  console.log('\n[SYSTEM] Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[SYSTEM] Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});
