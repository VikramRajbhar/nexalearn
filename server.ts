import { config } from 'dotenv';
config({ path: '.env.local' });

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketServer } from 'socket.io';
import { setupMatchmaking } from './src/socket/matchmaking';
import { setupBattleHandlers } from './src/socket/battle';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
        },
    });

    // Attach io to global for access in API routes if needed
    (global as any).io = io;

    setupMatchmaking(io);
    setupBattleHandlers(io);

    const PORT = parseInt(process.env.PORT || '3000', 10);
    httpServer.listen(PORT, () => {
        console.log(`> NexaLearn server running on http://localhost:${PORT}`);
    });
});
