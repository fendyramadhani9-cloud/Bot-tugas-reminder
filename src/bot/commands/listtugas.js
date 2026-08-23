import { getAllActiveTasks } from '../../services/taskService.js';
import { formatTaskList } from '../../utils/formatter.js';

export async function handleListTugas(sock, chatJid) {
  const activeTasks = getAllActiveTasks();
  const message = formatTaskList(activeTasks);
  await sock.sendMessage(chatJid, { text: message });
}
