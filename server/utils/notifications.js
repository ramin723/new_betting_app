import { WebSocket } from 'ws';

const clients = new Map();

export function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const userId = req.headers['x-user-id'];
    if (userId) {
      clients.set(userId, ws);

      ws.on('close', () => {
        clients.delete(userId);
      });
    }
  });
}

export function sendNotification(userId, notification) {
  const ws = clients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(notification));
  }
}

export function broadcastNotification(notification) {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
    }
  });
} 