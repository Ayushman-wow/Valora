const Room = require('../models/Room');
const RoomMessage = require('../models/RoomMessage');
const RoomGame = require('../models/RoomGame');
const RoomPoll = require('../models/RoomPoll');
const User = require('../models/User');

// Store active socket connections
const activeUsers = {}; // { socketId: { userId, username, roomCode } }
const roomSockets = {}; // { roomCode: [socketId1, socketId2, ...] }

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);

        // ====================
        // ROOM MANAGEMENT
        // ====================

        socket.on('join_room', async ({ roomCode, userId, username }) => {
            try {
                // Find room
                const room = await Room.findOne({ roomCode, isActive: true });
                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                // Add to members if not already
                if (!room.members.includes(userId)) {
                    room.members.push(userId);
                    await room.save();
                }

                // Join socket.io room
                socket.join(roomCode);

                // Track active user
                activeUsers[socket.id] = { userId, username, roomCode };
                if (!roomSockets[roomCode]) roomSockets[roomCode] = [];
                roomSockets[roomCode].push(socket.id);

                // Send room state to new user
                const messages = await RoomMessage.find({ room: roomCode })
                    .populate('user', 'username alias avatar')
                    .sort({ createdAt: -1 })
                    .limit(50);

                socket.emit('room_state', {
                    room: room.toObject(),
                    messages: messages.reverse(),
                    members: roomSockets[roomCode].length
                });

                // Notify room
                const systemMessage = await RoomMessage.create({
                    room: roomCode,
                    user: userId,
                    text: `${username} joined the room! 🎉`,
                    type: 'system'
                });

                io.to(roomCode).emit('user_joined', {
                    userId,
                    username,
                    message: systemMessage,
                    memberCount: roomSockets[roomCode].length
                });

                console.log(`✅ ${username} joined room: ${roomCode}`);
            } catch (err) {
                console.error('Error joining room:', err);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        socket.on('leave_room', async ({ roomCode, username }) => {
            try {
                socket.leave(roomCode);

                // Remove from active users
                delete activeUsers[socket.id];
                if (roomSockets[roomCode]) {
                    roomSockets[roomCode] = roomSockets[roomCode].filter(id => id !== socket.id);
                }

                // Notify room
                io.to(roomCode).emit('user_left', {
                    username,
                    memberCount: roomSockets[roomCode]?.length || 0
                });

                console.log(`👋 ${username} left room: ${roomCode}`);
            } catch (err) {
                console.error('Error leaving room:', err);
            }
        });

        // ====================
        // CHAT & MESSAGING
        // ====================

        socket.on('send_message', async ({ roomCode, userId, text, effects, replyTo }) => {
            try {
                const user = await User.findById(userId);
                if (!user) return;

                const message = await RoomMessage.create({
                    room: roomCode,
                    user: userId,
                    text,
                    type: 'text',
                    effects,
                    replyTo
                });

                await message.populate('user', 'username alias avatar mood');

                // Update room stats
                await Room.updateOne(
                    { roomCode },
                    { $inc: { 'stats.messageCount': 1 } }
                );

                io.to(roomCode).emit('receive_message', message);
            } catch (err) {
                console.error('Error sending message:', err);
            }
        });

        socket.on('message_reaction', async ({ messageId, userId, emoji }) => {
            try {
                const message = await RoomMessage.findById(messageId);
                if (!message) return;

                // Check if user already reacted
                const existingReaction = message.reactions.find(
                    r => r.user.toString() === userId && r.emoji === emoji
                );

                if (existingReaction) {
                    // Remove reaction
                    message.reactions = message.reactions.filter(
                        r => !(r.user.toString() === userId && r.emoji === emoji)
                    );
                } else {
                    // Add reaction
                    message.reactions.push({ user: userId, emoji });
                }

                await message.save();

                io.to(message.room).emit('message_updated', message);
            } catch (err) {
                console.error('Error adding reaction:', err);
            }
        });

        // ====================
        // ROOM ACTIONS
        // ====================

        socket.on('room_action', async ({ roomCode, fromUserId, fromUsername, toUserId, action }) => {
            try {
                const message = await RoomMessage.create({
                    room: roomCode,
                    user: fromUserId,
                    text: `${fromUsername} sent ${action.emoji} ${action.label}`,
                    type: 'action',
                    metadata: { action, toUserId }
                });

                io.to(roomCode).emit('room_action_received', {
                    from: fromUsername,
                    to: toUserId,
                    action,
                    message
                });
            } catch (err) {
                console.error('Error sending room action:', err);
            }
        });

        // ====================
        // GAMES
        // ====================

        socket.on('start_game', async ({ roomCode, gameType, userId }) => {
            try {
                const game = await RoomGame.create({
                    room: roomCode,
                    type: gameType,
                    status: 'waiting',
                    players: [{ user: userId, ready: true }]
                });

                io.to(roomCode).emit('game_started', game);
            } catch (err) {
                console.error('Error starting game:', err);
            }
        });

        socket.on('join_game', async ({ gameId, userId }) => {
            try {
                const game = await RoomGame.findById(gameId);
                if (!game) return;

                const alreadyJoined = game.players.some(p => p.user.toString() === userId);
                if (!alreadyJoined) {
                    game.players.push({ user: userId, ready: false });
                    await game.save();
                }

                io.to(game.room).emit('game_updated', game);
            } catch (err) {
                console.error('Error joining game:', err);
            }
        });

        socket.on('game_ready', async ({ gameId, userId }) => {
            try {
                const game = await RoomGame.findById(gameId);
                if (!game) return;

                const player = game.players.find(p => p.user.toString() === userId);
                if (player) {
                    player.ready = true;
                    await game.save();
                }

                // Check if all ready
                const allReady = game.players.every(p => p.ready);
                if (allReady && game.players.length >= 2) {
                    game.status = 'active';
                    game.startedAt = new Date();
                    await game.save();

                    io.to(game.room).emit('game_active', game);
                } else {
                    io.to(game.room).emit('game_updated', game);
                }
            } catch (err) {
                console.error('Error setting ready:', err);
            }
        });

        socket.on('game_answer', async ({ gameId, userId, answer, roundTime }) => {
            try {
                const game = await RoomGame.findById(gameId);
                if (!game) return;

                const player = game.players.find(p => p.user.toString() === userId);
                if (player) {
                    player.answers.push({ answer, roundTime, round: game.currentRound });

                    // Check answer correctness (game-specific logic)
                    // For now, just broadcast
                    await game.save();
                }

                io.to(game.room).emit('game_answer_received', {
                    gameId,
                    userId,
                    answer
                });
            } catch (err) {
                console.error('Error handling game answer:', err);
            }
        });

        socket.on('end_game', async ({ gameId }) => {
            try {
                const game = await RoomGame.findById(gameId);
                if (!game) return;

                game.status = 'completed';
                game.endedAt = new Date();

                // Calculate winner (highest score)
                const winner = game.players.reduce((prev, current) =>
                    (current.score > prev.score) ? current : prev
                );

                game.winner = winner.user;
                await game.save();

                // Update room stats
                await Room.updateOne(
                    { roomCode: game.room },
                    { $inc: { 'stats.gamesPlayed': 1 } }
                );

                await game.populate('players.user', 'username alias avatar');
                await game.populate('winner', 'username alias');

                io.to(game.room).emit('game_ended', game);
            } catch (err) {
                console.error('Error ending game:', err);
            }
        });

        // ====================
        // POLLS
        // ====================

        socket.on('create_poll', async ({ roomCode, userId, question, options, type }) => {
            try {
                const poll = await RoomPoll.create({
                    room: roomCode,
                    creator: userId,
                    question,
                    options,
                    type
                });

                await poll.populate('creator', 'username alias');

                io.to(roomCode).emit('poll_created', poll);
            } catch (err) {
                console.error('Error creating poll:', err);
            }
        });

        socket.on('vote_poll', async ({ pollId, userId, optionIndex }) => {
            try {
                const poll = await RoomPoll.findById(pollId);
                if (!poll || !poll.isActive) return;

                // Remove previous vote if exists
                poll.votes = poll.votes.filter(v => v.user.toString() !== userId);

                // Add new vote
                poll.votes.push({ user: userId, optionIndex });
                await poll.save();

                io.to(poll.room).emit('poll_updated', poll);
            } catch (err) {
                console.error('Error voting on poll:', err);
            }
        });

        socket.on('close_poll', async ({ pollId }) => {
            try {
                const poll = await RoomPoll.findById(pollId);
                if (!poll) return;

                poll.isActive = false;
                await poll.save();

                io.to(poll.room).emit('poll_closed', poll);
            } catch (err) {
                console.error('Error closing poll:', err);
            }
        });

        // ====================
        // WATCH TOGETHER
        // ====================

        socket.on('watch_sync', ({ roomCode, currentTime, isPlaying }) => {
            socket.to(roomCode).emit('watch_update', {
                currentTime,
                isPlaying
            });
        });

        socket.on('watch_reaction', ({ roomCode, userId, emoji }) => {
            io.to(roomCode).emit('watch_reaction_received', {
                userId,
                emoji,
                timestamp: Date.now()
            });
        });

        // ====================
        // DISCONNECT
        // ====================

        socket.on('disconnect', async () => {
            const userData = activeUsers[socket.id];
            if (userData) {
                const { roomCode, username } = userData;

                // Remove from room sockets
                if (roomSockets[roomCode]) {
                    roomSockets[roomCode] = roomSockets[roomCode].filter(id => id !== socket.id);

                    io.to(roomCode).emit('user_left', {
                        username,
                        memberCount: roomSockets[roomCode].length
                    });
                }

                delete activeUsers[socket.id];
            }

            console.log('❌ Client disconnected:', socket.id);
        });
    });
};
