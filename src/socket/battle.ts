import { Server, Socket } from 'socket.io';
import { supabaseAdmin } from '../lib/supabase';

// State Maps from user
const roomPlayers = new Map<string, Set<string>>();
const roomQuestions = new Map<string, any[]>();
const roomCurrentQuestion = new Map<string, number>();
const roomTimers = new Map<string, NodeJS.Timeout>();
const roomAnswers = new Map<string, Record<string, number>>();
const roomScores = new Map<string, Record<string, number>>();
const roomUsernames = new Map<string, Record<string, string>>();
const roomCorrectAnswers = new Map<string, Record<string, number>>();
const roomQuestionStartTime = new Map<string, number>();
export const roomTopics = new Map<string, string>();

export function setupBattleHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {

        socket.on('battle:join', async (data: {
            roomId: string,
            userId: string,
            username: string,
            topic?: string
        }) => {
            console.log('Player joining battle room:', data);

            socket.join(data.roomId);

            if (data.topic && !roomTopics.has(data.roomId)) {
                roomTopics.set(data.roomId, data.topic);
            }

            // Track players in room
            if (!roomPlayers.has(data.roomId)) {
                roomPlayers.set(data.roomId, new Set());
                roomUsernames.set(data.roomId, {});
                roomCorrectAnswers.set(data.roomId, {});
            }
            roomPlayers.get(data.roomId)!.add(data.userId);
            roomUsernames.get(data.roomId)![data.userId] = data.username;

            if (data.roomId.includes('_bot')) {
                const existingBot = Array.from(roomPlayers.get(data.roomId)!).find(id => id.startsWith('bot_'));
                if (!existingBot) {
                    const botId = `bot_${Math.random().toString(36).substr(2, 5)}`;
                    roomPlayers.get(data.roomId)!.add(botId);

                    const botNames = [
                        "Alex", "Sam", "Jordan", "Taylor", "Casey", "Morgan",
                        "Riley", "Quinn", "Avery", "Skyler", "Cameron", "Dakota",
                        "Reese", "Peyton", "Blake", "Hayden", "Rowan", "Charlie",
                        "Finley", "Emerson", "Kendall", "River", "Parker", "Sutton",
                        "Phoenix", "Ellis", "Lennon", "Sage", "Micah", "Rory"
                    ];
                    roomUsernames.get(data.roomId)![botId] = botNames[Math.floor(Math.random() * botNames.length)];
                }
            }

            const playersInRoom = roomPlayers.get(data.roomId)!;
            console.log(`Room ${data.roomId} has ${playersInRoom.size} players`);

            // When both players joined start countdown or resume if already active
            if (playersInRoom.size >= 2) {
                if (roomCurrentQuestion.has(data.roomId)) {
                    console.log('Player rejoined active battle, sending current state...');
                    const currentIndex = roomCurrentQuestion.get(data.roomId)!;
                    const questions = roomQuestions.get(data.roomId);
                    if (questions) {
                        const timeElapsed = Date.now() - (roomQuestionStartTime.get(data.roomId) || Date.now());
                        const timeRemaining = Math.max(0, 15 - Math.floor(timeElapsed / 1000));

                        socket.emit('battle:resume', {
                            question: sanitizeQuestion(questions[currentIndex]),
                            questionIndex: currentIndex,
                            totalQuestions: questions.length,
                            topic: roomTopics.get(data.roomId) || 'DSA',
                            scores: roomScores.get(data.roomId) || {},
                            timeRemaining: timeRemaining,
                            opponentAnswered: Object.keys(roomAnswers.get(data.roomId) || {}).length > 0 && !(data.userId in (roomAnswers.get(data.roomId) || {}))
                        });
                        return;
                    }
                }

                console.log('Both players joined! Starting countdown');

                // Start 3 second countdown
                let count = 3;
                const countdownInterval = setInterval(() => {
                    io.to(data.roomId).emit('battle:countdown', {
                        seconds: count
                    });
                    console.log('Countdown:', count);
                    count--;

                    if (count < 0) {
                        clearInterval(countdownInterval);
                        startBattle(io, data.roomId);
                    }
                }, 1000);
            }
        });

        socket.on('battle:answer', (data: {
            roomId: string;
            userId: string;
            questionIndex: number;
            answerIndex: number;
            timeTakenMs: number;
        }) => {
            const { roomId, userId, questionIndex, answerIndex, timeTakenMs } = data;

            const questions = roomQuestions.get(roomId);
            if (!questions) return;
            const question = questions[questionIndex];
            if (!question) return;

            // Reject answers for questions we've already moved well past (allow 1 tolerance for lag)
            const currentQ = roomCurrentQuestion.get(roomId);
            if (currentQ !== undefined && currentQ > questionIndex + 1) {
                console.log(`Rejecting stale answer from ${userId} for Q${questionIndex} (currently on Q${currentQ})`);
                return;
            }

            // Track answers
            if (!roomAnswers.has(roomId)) roomAnswers.set(roomId, {});
            const answers = roomAnswers.get(roomId)!;
            if (answers[userId] !== undefined) return; // already answered

            answers[userId] = answerIndex;

            // Calculate points
            const isCorrect = answerIndex === parseInt(String(question.correct_index), 10);
            let pointsEarned = 0;
            if (isCorrect) {
                pointsEarned = timeTakenMs < 5000 ? 15 : timeTakenMs < 10000 ? 10 : 5;
                const correctCount = roomCorrectAnswers.get(roomId)!;
                correctCount[userId] = (correctCount[userId] || 0) + 1;
            }

            // Track scores
            if (!roomScores.has(roomId)) roomScores.set(roomId, {});
            const scores = roomScores.get(roomId)!;
            scores[userId] = (scores[userId] || 0) + pointsEarned;

            console.log(`Score update - User: ${userId} Points: +${pointsEarned} Total: ${scores[userId]}`);

            // Emit result to specific user
            socket.emit('battle:answer_result', {
                isCorrect,
                pointsEarned,
                correctIndex: question.correct_index,
                explanation: question.explanation
            });

            // Tell others opponent answered
            socket.to(roomId).emit('battle:opponent_answered', {
                opponentAnswered: true
            });

            // Do NOT advance early — always wait for the full 15s timer
            // This ensures both players see the question for the full duration
        });
    });
}

async function startBattle(io: Server, roomId: string) {
    const topic = roomTopics.get(roomId) || 'DSA';
    console.log(`Starting battle for room ${roomId} with topic: ${topic}`);

    const topicMap: Record<string, string> = {
        'DSA': 'DSA',
        'JavaScript': 'JavaScript',
        'SQL': 'SQL',
        'OS': 'OS',
        'DBMS': 'DBMS',
        'CN': 'CN',
        'OOP': 'OOP',
        'Python': 'Python',
        'Java': 'Java',
        'C': 'C',
    };

    const dbTopic = topicMap[topic] || 'DSA';

    const { data: questions, error } = await supabaseAdmin
        .from('questions')
        .select('*')
        .eq('topic', dbTopic) // use dynamic topic
        // Removing order('RANDOM()') since it requires creating a SQL function or view, taking random slice in memory instead
        .limit(50);

    if (error) {
        console.error('Error fetching questions:', error);
    }

    // Select 10 unique questions by ID
    const shuffled = ((questions || []) as any[]).sort(() => Math.random() - 0.5);
    const seenIds = new Set<string>();
    let selectedQuestions: any[] = [];
    for (const q of shuffled) {
        if (!seenIds.has(q.id)) {
            seenIds.add(q.id);
            selectedQuestions.push(q);
            if (selectedQuestions.length === 10) break;
        }
    }

    // Fallback to DSA if topic has no questions yet
    if (selectedQuestions.length === 0) {
        console.warn(`No questions found for ${dbTopic}, falling back to DSA`);
        const { data: fallback } = await supabaseAdmin
            .from('questions')
            .select('*')
            .eq('topic', 'DSA')
            .limit(50);

        const fallbackShuffled = ((fallback || []) as any[]).sort(() => Math.random() - 0.5);
        const fallbackSeenIds = new Set<string>();
        selectedQuestions = [];
        for (const q of fallbackShuffled) {
            if (!fallbackSeenIds.has(q.id)) {
                fallbackSeenIds.add(q.id);
                selectedQuestions.push(q);
                if (selectedQuestions.length === 10) break;
            }
        }

        if (!selectedQuestions || selectedQuestions.length === 0) {
            io.to(roomId).emit('battle:error', {
                message: 'No questions available for this topic'
            });
            return;
        }
    }

    roomQuestions.set(roomId, selectedQuestions);
    roomCurrentQuestion.set(roomId, 0);
    roomAnswers.set(roomId, {});
    roomScores.set(roomId, {});

    // Create the battle record in Supabase first
    const playerIds = Array.from(roomPlayers.get(roomId) || []);
    const isBotMatch = roomId.includes('_bot');

    if (playerIds.length >= 2 && !isBotMatch) {
        const { error: insertError } = await supabaseAdmin
            .from('battles')
            .insert({
                room_id: roomId,
                player1_id: playerIds[0],
                player2_id: playerIds[1],
                topic: dbTopic,
                status: 'active',
                started_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('Error creating battle record:', insertError);
        } else {
            console.log('Battle record created in Supabase');
        }
    }

    // Send first question to both players
    roomQuestionStartTime.set(roomId, Date.now());
    io.to(roomId).emit('battle:start', {
        question: sanitizeQuestion(selectedQuestions[0]),
        questionIndex: 0,
        totalQuestions: selectedQuestions.length,
        topic: dbTopic
    });

    // Start 15 second timer for first question
    startQuestionTimer(io, roomId, 0, selectedQuestions);
}

function startQuestionTimer(
    io: Server,
    roomId: string,
    questionIndex: number,
    questions: any[]
) {
    // Clear existing timer
    const existingTimer = roomTimers.get(roomId);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
        // Time up - move to next question
        io.to(roomId).emit('battle:timeout', { questionIndex });
        moveToNextQuestion(io, roomId, questionIndex, questions);
    }, 15000);

    roomTimers.set(roomId, timer);

    // Bot answering logic
    if (roomId.includes('_bot')) {
        const botId = Array.from(roomPlayers.get(roomId) || []).find(id => id.startsWith('bot_'));
        if (botId) {
            const botDelayMs = 3000 + Math.random() * 5000;
            setTimeout(() => {
                const currentData = roomCurrentQuestion.get(roomId);
                if (currentData !== questionIndex) return; // already moved on
                if (!roomAnswers.has(roomId)) roomAnswers.set(roomId, {});
                const answers = roomAnswers.get(roomId)!;
                if (answers[botId] !== undefined) return;

                const q = questions[questionIndex];
                const answerIndex = Math.random() < 0.7 ? parseInt(String(q.correct_index), 10) : Math.floor(Math.random() * 4);

                answers[botId] = answerIndex;
                const isCorrect = answerIndex === parseInt(String(q.correct_index), 10);
                const pointsEarned = isCorrect ? (botDelayMs < 5000 ? 15 : botDelayMs < 10000 ? 10 : 5) : 0;

                if (isCorrect) {
                    const correctCount = roomCorrectAnswers.get(roomId)!;
                    correctCount[botId] = (correctCount[botId] || 0) + 1;
                }

                if (!roomScores.has(roomId)) roomScores.set(roomId, {});
                const scores = roomScores.get(roomId)!;
                scores[botId] = (scores[botId] || 0) + pointsEarned;

                io.to(roomId).emit('battle:opponent_answered', { opponentAnswered: true });

                // Do NOT advance early — always wait for the full 15s timer
            }, botDelayMs);
        }
    }
}

function moveToNextQuestion(
    io: Server,
    roomId: string,
    currentIndex: number,
    questions: any[]
) {
    // RACE CONDITION GUARD: If the room has already moved past this question,
    // skip this call. This prevents double-advances when both the timer timeout
    // and the "both answered" check fire for the same question.
    const actualCurrent = roomCurrentQuestion.get(roomId);
    if (actualCurrent !== undefined && actualCurrent !== currentIndex) {
        console.log(`Skipping duplicate moveToNextQuestion for Q${currentIndex} (already at Q${actualCurrent})`);
        return;
    }

    const nextIndex = currentIndex + 1;
    console.log(`Moving to question ${nextIndex} of ${questions.length}`);

    if (nextIndex >= questions.length) {
        console.log('All questions done - calling endBattle')
        // Battle over
        endBattle(io, roomId);
        return;
    }

    // Reset answers for new question
    roomAnswers.set(roomId, {});
    roomCurrentQuestion.set(roomId, nextIndex);
    roomQuestionStartTime.set(roomId, Date.now());

    io.to(roomId).emit('battle:next_question', {
        question: sanitizeQuestion(questions[nextIndex]),
        questionIndex: nextIndex
    });

    startQuestionTimer(io, roomId, nextIndex, questions);
}

async function endBattle(io: Server, roomId: string) {
    console.log('=== endBattle called for room:', roomId);
    console.log('roomScores:', Object.fromEntries(roomScores));
    console.log('roomPlayers:', Object.fromEntries(roomPlayers));
    console.log('roomTopics:', Object.fromEntries(roomTopics));

    const timer = roomTimers.get(roomId);
    if (timer) clearTimeout(timer);

    const scores = roomScores.get(roomId) || {};
    const players = Array.from(roomPlayers.get(roomId) || []);

    const p1Id = players[0];
    const p2Id = players[1];

    const p1Score = scores[p1Id] || 0;
    const p2Score = scores[p2Id] || 0;

    let winner = 'draw';
    if (p1Score > p2Score) winner = p1Id;
    else if (p2Score > p1Score) winner = p2Id;

    const usernames = roomUsernames.get(roomId) || {};
    const correctCount = roomCorrectAnswers.get(roomId) || {};

    const xpEarned = {
        player1: winner === p1Id ? 100 + p1Score : (winner === 'draw' ? 50 + p1Score : 20 + p1Score),
        player2: winner === p2Id ? 100 + p2Score : (winner === 'draw' ? 50 + p2Score : 20 + p2Score),
    };

    io.to(roomId).emit('battle:end', {
        winner,
        scores,
        player1: { userId: p1Id, username: usernames[p1Id] || 'Player 1', score: p1Score, correctAnswers: correctCount[p1Id] || 0 },
        player2: { userId: p2Id, username: usernames[p2Id] || 'Player 2', score: p2Score, correctAnswers: correctCount[p2Id] || 0 },
        xpEarned
    });

    try {
        const topic = roomTopics.get(roomId) || 'DSA';
        const questions = roomQuestions.get(roomId) || [];
        const maxScore = questions.length * 15;
        const isBotMatch = roomId.includes('_bot');

        let battleRecord: any = null;

        if (!isBotMatch) {
            // Update battles table
            const { error: battleUpdateError } = await supabaseAdmin
                .from('battles')
                .update({
                    winner_id: winner === 'draw' ? null : winner,
                    player1_score: p1Score,
                    player2_score: p2Score,
                    status: 'completed',
                    ended_at: new Date().toISOString()
                })
                .eq('room_id', roomId);

            if (battleUpdateError) console.error('Error updating battle:', battleUpdateError);

            const { data } = await supabaseAdmin
                .from('battles')
                .select('id')
                .eq('room_id', roomId)
                .single();
            battleRecord = data;
        }

        for (const playerId of players) {
            if (!playerId || playerId.startsWith('bot_')) continue;

            const playerScore = scores[playerId] || 0;
            const opponentId = players.find(id => id !== playerId) || null;
            const opponentScore = opponentId ? (scores[opponentId] || 0) : 0;
            const result = winner === 'draw' ? 'draw' : (winner === playerId ? 'win' : 'loss');

            // Update user table
            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('username, college, league, total_xp, battles_played, battles_won')
                .eq('id', playerId)
                .single();

            if (userData) {
                const won = winner === playerId;
                const newXp = (userData.total_xp || 0) + playerScore;

                await supabaseAdmin
                    .from('users')
                    .update({
                        total_xp: newXp,
                        battles_played: (userData.battles_played || 0) + 1,
                        battles_won: (userData.battles_won || 0) + (won ? 1 : 0)
                    })
                    .eq('id', playerId);

                const xpEarned = won ? 100 + playerScore : (winner === 'draw' ? 50 + playerScore : 20 + playerScore);

                const { data: guildMember } = await supabaseAdmin
                    .from('guild_members')
                    .select('guild_id, weekly_xp')
                    .eq('user_id', playerId)
                    .single();

                if (guildMember) {
                    await supabaseAdmin
                        .from('guild_members')
                        .update({ weekly_xp: (guildMember.weekly_xp || 0) + xpEarned })
                        .eq('user_id', playerId)
                        .eq('guild_id', guildMember.guild_id);

                    const { data: guild } = await supabaseAdmin
                        .from('guilds')
                        .select('weekly_xp, total_xp')
                        .eq('id', guildMember.guild_id)
                        .single();

                    if (guild) {
                        await supabaseAdmin
                            .from('guilds')
                            .update({
                                weekly_xp: (guild.weekly_xp || 0) + xpEarned,
                                total_xp: (guild.total_xp || 0) + xpEarned
                            })
                            .eq('id', guildMember.guild_id);
                    }
                }

                // Send to Redis leaderboard API
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaderboard/update`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: playerId,
                            username: userData.username,
                            college: userData.college,
                            league: userData.league,
                            xpEarned,
                            topic
                        })
                    });
                } catch (err) {
                    console.error('Failed to notify leaderboard API', err);
                }
            }

            // Insert battle_history
            if (battleRecord) {
                await supabaseAdmin
                    .from('battle_history')
                    .insert({
                        user_id: playerId,
                        battle_id: battleRecord.id,
                        opponent_id: opponentId,
                        topic: topic,
                        result: result,
                        user_score: playerScore,
                        opponent_score: opponentScore,
                        xp_earned: playerScore,
                        played_at: new Date().toISOString()
                    });
            }

            // Update skill_scores
            const { data: existing } = await supabaseAdmin
                .from('skill_scores')
                .select('score, battles_played')
                .eq('user_id', playerId)
                .eq('topic', topic)
                .single();

            const oldScore = existing?.score || 50;
            const oldBattles = existing?.battles_played || 0;
            const battleResultPercentage = maxScore > 0 ? (playerScore / maxScore) * 100 : 50;
            const newScore = Math.round(oldScore * 0.8 + battleResultPercentage * 0.2);

            if (existing) {
                await supabaseAdmin
                    .from('skill_scores')
                    .update({
                        score: newScore,
                        battles_played: oldBattles + 1,
                        last_updated: new Date().toISOString()
                    })
                    .eq('user_id', playerId)
                    .eq('topic', topic);
            } else {
                await supabaseAdmin
                    .from('skill_scores')
                    .insert({
                        user_id: playerId,
                        topic: topic,
                        score: newScore,
                        battles_played: 1,
                        last_updated: new Date().toISOString()
                    });
            }

            // Achievement check after updating stats
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/achievements/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: playerId,
                        triggerData: {
                            battleResult: result,
                            correctAnswers: Math.round(playerScore / 10),
                            totalQuestions: questions.length,
                        }
                    })
                });

                if (response.ok) {
                    const { achievements } = await response.json();
                    if (achievements && achievements.length > 0) {
                        io.to(roomId).emit('achievement:earned', {
                            userId: playerId,
                            achievements
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to check achievements', err);
            }
        }
        console.log('Battle results saved successfully!');
    } catch (e) {
        console.error('Error saving battle results:', e);
    }

    // Cleanup
    roomPlayers.delete(roomId);
    roomQuestions.delete(roomId);
    roomCurrentQuestion.delete(roomId);
    roomTimers.delete(roomId);
    roomAnswers.delete(roomId);
    roomScores.delete(roomId);
    roomTopics.delete(roomId);
    roomUsernames.delete(roomId);
    roomCorrectAnswers.delete(roomId);
    roomQuestionStartTime.delete(roomId);
}

// Remove explanation from question before sending
function sanitizeQuestion(question: any) {
    const { explanation, correct_index, ...safe } = question;
    return safe;
}
