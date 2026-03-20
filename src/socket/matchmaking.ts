import { Server } from 'socket.io';
import { roomTopics } from './battle';

interface QueuedPlayer {
    socketId: string;
    userId: string;
    username: string;
    topic: string;
    skillScore: number;
}

const queues = new Map<string, QueuedPlayer[]>();

// Registry: userId → current socketId (survives reconnects)
const userSocketMap = new Map<string, string>();

export function setupMatchmaking(io: Server) {
    io.on('connection', (socket) => {
        console.log('[Socket] Connected:', socket.id);

        // Register stable userId → socketId mapping
        socket.on('register', (data: { userId: string }) => {
            if (!data?.userId) return;
            const prev = userSocketMap.get(data.userId);
            userSocketMap.set(data.userId, socket.id);
            console.log(`[Registry] userId ${data.userId} → socket ${socket.id}${prev ? ` (was ${prev})` : ''}`);
        });

        socket.on('matchmaking:join', async (data: {
            userId: string;
            username: string;
            topic: string;
            skillScore?: number;
        }) => {
            if (!data?.userId || !data?.topic) return;
            console.log('[Matchmaking] Join:', data.username, 'topic:', data.topic);

            // Register userId → socketId
            userSocketMap.set(data.userId, socket.id);

            // Remove from any existing queue
            queues.forEach(q => {
                const i = q.findIndex(p => p.userId === data.userId);
                if (i !== -1) q.splice(i, 1);
            });

            const player: QueuedPlayer = {
                socketId: socket.id,
                userId: data.userId,
                username: data.username,
                topic: data.topic,
                skillScore: data.skillScore || 50,
            };

            if (!queues.has(data.topic)) queues.set(data.topic, []);
            const queue = queues.get(data.topic)!;

            if (queue.length > 0) {
                const opponent = queue.shift()!;
                const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                console.log('[Matchmaking] Match! Room:', roomId, '|', opponent.username, 'vs', player.username);

                roomTopics.set(roomId, data.topic);

                // Fetch opponent's current socket if they reconnected
                const opponentCurrentSocket = userSocketMap.get(opponent.userId) || opponent.socketId;

                // Broadcast found event
                const foundPayload = {
                    roomId,
                    topic: data.topic,
                    player1: { userId: opponent.userId, username: opponent.username, skillScore: opponent.skillScore },
                    player2: { userId: player.userId, username: player.username, skillScore: player.skillScore },
                };

                io.to(roomId).emit('matchmaking:found', foundPayload); // if they had joined
                // Also send directly (in case they're not in the room yet)
                socket.emit('matchmaking:found', foundPayload);
                const oppSocket = io.sockets.sockets.get(opponentCurrentSocket);
                if (oppSocket) oppSocket.emit('matchmaking:found', foundPayload);

                console.log('[Matchmaking] matchmaking:found emitted');
            } else {
                queue.push(player);
                console.log(`[Matchmaking] ${player.username} waiting in ${data.topic}. Queue size: ${queue.length}`);
                socket.emit('matchmaking:searching', { topic: data.topic });

                // Auto-match with bot after 15 seconds if still waiting
                setTimeout(() => {
                    const q = queues.get(data.topic);
                    if (!q) return;
                    const idx = q.findIndex(p => p.userId === player.userId);
                    if (idx !== -1) {
                        q.splice(idx, 1);
                        const roomId = `room_${Date.now()}_bot`;
                        console.log('[Matchmaking] Bot Match! Room:', roomId);
                        roomTopics.set(roomId, data.topic);

                        const botId = `bot_${Math.random().toString(36).substr(2, 5)}`;

                        const botNames = [
                            "Alex", "Sam", "Jordan", "Taylor", "Casey", "Morgan",
                            "Riley", "Quinn", "Avery", "Skyler", "Cameron", "Dakota",
                            "Reese", "Peyton", "Blake", "Hayden", "Rowan", "Charlie",
                            "Finley", "Emerson", "Kendall", "River", "Parker", "Sutton",
                            "Phoenix", "Ellis", "Lennon", "Sage", "Micah", "Rory"
                        ];
                        const botName = botNames[Math.floor(Math.random() * botNames.length)];

                        const foundPayload = {
                            roomId,
                            topic: data.topic,
                            player1: { userId: player.userId, username: player.username, skillScore: player.skillScore },
                            player2: { userId: botId, username: botName, skillScore: 50, isBot: true },
                        };

                        socket.emit('matchmaking:found', foundPayload);
                    }
                }, 15000);
            }
        });

        socket.on('matchmaking:cancel', () => {
            queues.forEach(q => {
                const i = q.findIndex(p => p.socketId === socket.id);
                if (i !== -1) q.splice(i, 1);
            });
        });

        socket.on('disconnect', () => {
            // Delay removal slightly to allow for reconnects without losing queue spot?
            // For now just standard remove.
            queues.forEach(q => {
                const i = q.findIndex(p => p.socketId === socket.id);
                if (i !== -1) q.splice(i, 1);
            });
        });
    });
}

// Exported so battle.ts can update socket IDs on reconnect if needed
export { userSocketMap };
