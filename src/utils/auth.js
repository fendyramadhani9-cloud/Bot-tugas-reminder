/**
 * Check if the sender is authorized as an Admin
 * @param {string} senderJid - WhatsApp JID of sender e.g. "6281234567890@s.whatsapp.net"
 * @returns {boolean}
 */
export function isAdmin(senderJid) {
  if (!senderJid) return false;

  const adminEnv = process.env.ADMIN_NUMBER;
  if (!adminEnv) {
    console.warn('[AUTH] ADMIN_NUMBER is not set in .env! Mutating commands will be rejected.');
    return false;
  }

  // Extract phone number from JID or raw string (e.g. 6281234567890:12@s.whatsapp.net -> 6281234567890)
  const cleanSender = senderJid.replace(/@.*$/, '').replace(/:.*$/, '').replace(/\D/g, '');
  const cleanAdmin = adminEnv.replace(/\D/g, '');

  return cleanSender === cleanAdmin;
}
