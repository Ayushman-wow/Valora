const activeSocialUsers = {}; // { socketId: { username, activity, path, email } }

module.exports = (io) => {
    io.on('connection', (socket) => {

        socket.on('social_presence', ({ username, activity, path, email }) => {
            activeSocialUsers[socket.id] = {
                username,
                activity,
                path,
                email,
                socketId: socket.id,
                timestamp: Date.now()
            };

            // Broadcast to all to show "someone is here"
            io.emit('social_update', {
                activeUsers: Object.values(activeSocialUsers)
            });
        });

        socket.on('typing_confession', ({ username, isTyping }) => {
            socket.broadcast.emit('someone_typing', {
                username: isTyping ? username : null,
                isTyping
            });
        });

        // Real-time Couple Sync
        socket.on('couple_sync', ({ partnerEmail, action, data }) => {
            // Find partner socket
            const partner = Object.values(activeSocialUsers).find(u => u.email === partnerEmail);
            if (partner) {
                io.to(partner.socketId).emit('partner_event', { action, data });
            }
        });

        socket.on('disconnect', () => {
            if (activeSocialUsers[socket.id]) {
                delete activeSocialUsers[socket.id];
                io.emit('social_update', {
                    activeUsers: Object.values(activeSocialUsers)
                });
            }
        });
    });
};
