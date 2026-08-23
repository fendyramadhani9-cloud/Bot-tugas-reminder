import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handleIncomingMessage } from './messageHandler.js';
import { initSchedulers } from '../scheduler/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authDir = path.resolve(__dirname, '../../auth');

if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

let sockInstance = null;
let isSchedulerInitialized = false;

export async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[BAILEYS] Using Baileys version: ${version.join('.')} (isLatest: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    generateHighQualityLinkPreview: false,
    browser: ['Class Assistant XII TJKT 1', 'Chrome', '1.0.0']
  });

  sockInstance = sock;

  // Listen for authentication credentials updates
  sock.ev.on('creds.update', saveCreds);

  // Connection update handling (QR code, open, close, reconnect)
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n============================================================');
      console.log('SCAN QR CODE DI BAWAH INI UNTUK LOGIN WHATSAPP BOT:');
      console.log('============================================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\nSilakan buka WhatsApp > Perangkat Tertaut > Tautkan Perangkat\n');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`[BAILEYS] Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(() => {
          startWhatsAppBot();
        }, 5000);
      } else {
        console.log('[BAILEYS] Logged out. Please remove auth/ directory and restart to scan new QR code.');
      }
    } else if (connection === 'open') {
      console.log('============================================================');
      console.log('[WHATSAPP] BOT BERHASIL TERHUBUNG & SIAP DIGUNAKAN!');
      console.log('============================================================\n');

      if (!isSchedulerInitialized) {
        initSchedulers(sock);
        isSchedulerInitialized = true;
      }
    }
  });

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
      for (const msg of messages) {
        await handleIncomingMessage(sock, msg);
      }
    }
  });

  return sock;
}

export function getSocket() {
  return sockInstance;
}
