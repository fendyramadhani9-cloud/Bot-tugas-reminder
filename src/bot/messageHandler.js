import { handleHelp } from './commands/help.js';
import { handleJadwal } from './commands/jadwal.js';
import { handleListTugas } from './commands/listtugas.js';
import { handleTugas } from './commands/tugas.js';
import { handleHapus } from './commands/hapus.js';
import { handleEdit } from './commands/edit.js';
import { handleMateri } from './commands/materi.js';

/**
 * Extract plain text from various Baileys message shapes
 */
export function extractMessageText(msg) {
  if (!msg.message) return '';
  return (
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    ''
  ).trim();
}

/**
 * Main Baileys message listener / router
 */
export async function handleIncomingMessage(sock, msg) {
  try {
    // Ignore messages from status broadcasts or without message content
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
    // Ignore messages sent by bot itself
    if (msg.key.fromMe) return;

    const rawText = extractMessageText(msg);
    if (!rawText) return;

    const chatJid = msg.key.remoteJid;
    // senderJid: in group chat it is participant, in DM it is remoteJid
    const senderJid = msg.key.participant || msg.key.remoteJid;

    // Check for command prefix '@'
    const cleanText = rawText.trim();
    if (!cleanText.startsWith('@')) {
      // Also check if text matches multiline task creation format without @ prefix (e.g. Mapel : MTK)
      if (cleanText.toLowerCase().startsWith('mapel :') || cleanText.toLowerCase().startsWith('mapel:')) {
        await handleTugas(sock, chatJid, senderJid, rawText);
      }
      return;
    }

    // Extract command name
    const firstWord = cleanText.split(/\s+/)[0].toLowerCase();
    const argsText = cleanText.slice(firstWord.length).trim();

    switch (firstWord) {
      case '@help':
      case '@bantuan':
      case '@menu':
        await handleHelp(sock, chatJid);
        break;

      case '@jadwal':
        await handleJadwal(sock, chatJid, argsText);
        break;

      case '@list':
      case '@listtugas':
        await handleListTugas(sock, chatJid);
        break;

      case '@tugas':
        await handleTugas(sock, chatJid, senderJid, rawText);
        break;

      case '@hapus':
      case '@delete':
        await handleHapus(sock, chatJid, senderJid, argsText);
        break;

      case '@edit':
        await handleEdit(sock, chatJid, senderJid, rawText);
        break;

      case '@materi':
        await handleMateri(sock, chatJid, senderJid, rawText);
        break;

      default:
        // Unknown command - ignore or gently help
        break;
    }
  } catch (err) {
    console.error('[BOT] Error handling message:', err);
  }
}
