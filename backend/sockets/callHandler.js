module.exports = (io) => {
    io.on('connection', (socket) => {

        // ====================
        // CALL SIGNALING
        // ====================

        socket.on('join_call', ({ roomId, userId }) => {
            socket.join(roomId);
            console.log(`📞 User ${userId} joined call room: ${roomId}`);

            // Notify others in room
            socket.to(roomId).emit('user_joined_call', { userId });
        });

        socket.on('call_offer', ({ roomId, offer }) => {
            socket.to(roomId).emit('receive_call_offer', { offer, from: socket.id });
        });

        socket.on('call_answer', ({ roomId, answer }) => {
            socket.to(roomId).emit('receive_call_answer', { answer, from: socket.id });
        });

        socket.on('ice_candidate', ({ roomId, candidate }) => {
            socket.to(roomId).emit('receive_ice_candidate', { candidate, from: socket.id });
        });

        socket.on('leave_call', ({ roomId }) => {
            socket.leave(roomId);
            socket.to(roomId).emit('user_left_call', { userId: socket.id });
        });

        socket.on('disconnect', () => {
            // Cleanup handled by socket.io automatically leaving rooms
        });
    });
};
