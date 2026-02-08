const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/heartsync')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Socket.io - Enhanced Room System
const roomHandler = require('./sockets/roomHandler');
roomHandler(io);

const callHandler = require('./sockets/callHandler');
callHandler(io);

const socialHandler = require('./sockets/socialHandler');
socialHandler(io);

// Routes
const authRoutes = require('./routes/auth');
const wallRoutes = require('./routes/wall');
const eventRoutes = require('./routes/events'); // New
const userRoutes = require('./routes/users'); // New
const placesRoutes = require('./routes/places'); // Places API
const interactionsRoutes = require('./routes/interactions'); // Interactions
const callsRoutes = require('./routes/calls'); // Calls
const roomsRoutes = require('./routes/rooms'); // Rooms
const timelineRoutes = require('./routes/timeline'); // Timeline Routes
const giftRoutes = require('./routes/giftRoutes'); // Gift Sharing
const gamesRoutes = require('./routes/games'); // Games Routes
const leaderboardRoutes = require('./routes/leaderboard');
const coupleRoutes = require('./routes/couples');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/messages', wallRoutes);
app.use('/api/events', eventRoutes); // New
app.use('/api/users', userRoutes); // New
app.use('/api/places', placesRoutes); // Places API
app.use('/api/interactions', interactionsRoutes); // Interactions
app.use('/api/calls', callsRoutes); // Calls
app.use('/api/rooms', roomsRoutes); // Rooms
app.use('/api/timeline', timelineRoutes); // Timeline
app.use('/api/games', gamesRoutes); // Games
app.use('/api/gifts', giftRoutes); // Gift Sharing
app.use('/api/leaderboard', leaderboardRoutes); // Leaderboard
app.use('/api/couples', coupleRoutes); // Couples
app.use('/api/ai', aiRoutes); // AI Personalization

app.get('/', (req, res) => {
    res.send('HeartSync API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
