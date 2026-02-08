'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Users, LogOut, MessageCircle, Heart,
    Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '@/config/env';

// Types (matching backend)
interface RoomMember {
    _id: string;
    username: string;
    alias: string;
    avatar?: string;
}

interface RoomModel {
    roomCode: string;
    name: string;
    emoji: string;
    members: RoomMember[];
}

interface RoomMessage {
    _id: string;
    user: string; // or User object
    username: string; // helper
    text: string;
    type: 'text' | 'system' | 'action';
    reactions: { user: string; emoji: string }[];
    createdAt: string;
}

export default function RoomPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Socket
    const socketRef = useRef<Socket | null>(null);

    // State
    const [roomCode, setRoomCode] = useState('');
    const [currentRoom, setCurrentRoom] = useState<RoomModel | null>(null);
    const [joined, setJoined] = useState(false);
    const [messages, setMessages] = useState<RoomMessage[]>([]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'join' | 'create'>('create');
    const [availableRooms, setAvailableRooms] = useState<RoomModel[]>([]);

    // Room creation
    const [roomName, setRoomName] = useState('');
    const [roomEmoji, setRoomEmoji] = useState('🎪');
    const [creating, setCreating] = useState(false);

    // Initial Guest/User Name
    const [username, setUsername] = useState('');
    const [tempUsername, setTempUsername] = useState('');
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

    // Room actions dropdown
    const [showActions, setShowActions] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Helper: Get user email or fallback
    // Note: Backend uses email header to identify user/guest
    const getUserEmail = () => {
        if (session?.user?.email) return session.user.email;
        if (username) return `${username.replace(/\s+/g, '')}@guest.com`; // Fallback for guest
        return '';
    };

    const getDisplayName = () => {
        return session?.user?.name || session?.user?.email?.split('@')[0] || username || 'Guest';
    };

    // 1. Initialize Socket & Auth
    useEffect(() => {
        // Handle Guest/Auth Username
        if (status === 'unauthenticated') {
            const saved = localStorage.getItem('heartsync_username');
            if (saved) setUsername(saved);
            else setShowUsernamePrompt(true);
        } else if (status === 'authenticated') {
            setUsername(session?.user?.name || '');
        }

        // Initialize Socket
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL);

            socketRef.current.on('connect', () => {
                console.log('Socket connected:', socketRef.current?.id);
            });
        }

        // Fetch user's existing rooms if logged in
        if (session) {
            fetchMyRooms();
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            socketRef.current = null;
        };
    }, [status, session]);

    // 2. Fetch User's Rooms
    const fetchMyRooms = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/rooms/user/my-rooms`, {
                headers: { 'x-user-email': getUserEmail() }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableRooms(data.rooms || []);
            }
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
        }
    };

    // 3. Socket Event Listeners
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        // Room state update (from join)
        socket.on('room_state', ({ room, messages, members }: any) => {
            setCurrentRoom(room);
            setMessages(messages || []);
            setJoined(true);
            setCreating(false);
            setRoomCode(room.roomCode);
        });

        // New message received
        socket.on('receive_message', (message: RoomMessage) => {
            setMessages(prev => [...prev, message]);
        });

        // Message updated (reactions)
        socket.on('message_updated', (updatedMessage: RoomMessage) => {
            setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
        });

        // User joined
        socket.on('user_joined', ({ username, message, memberCount }: any) => {
            if (message) setMessages(prev => [...prev, message]);
            // Update member count in currentRoom if possible
            setCurrentRoom(prev => prev ? { ...prev, members: new Array(memberCount) } : null);
        });

        // User left
        socket.on('user_left', ({ username, memberCount }: any) => {
            // System message is sent by server usually, if not we can add one manually but roomHandler emits message usually? 
            // Wait, roomHandler only emits 'user_left', not a message object.
            // We can rely on system messages if backend sends them, or just ignore.
            setCurrentRoom(prev => prev ? { ...prev, members: new Array(memberCount) } : null);
        });

        // Room Action
        socket.on('room_action_received', ({ from, action, message }: any) => {
            if (message) setMessages(prev => [...prev, message]);

            // Handle client-side effects (Confetti, etc.)
            if (action.id === 'confetti') createConfetti();
            if (action.id === 'lofi') window.open('https://www.youtube.com/watch?v=jfKfPfyJRdk', '_blank');
        });

        // Errors state
        socket.on('error', ({ message }: any) => {
            alert(message);
            setCreating(false);
        });

        return () => {
            socket.off('room_state');
            socket.off('receive_message');
            socket.off('user_joined');
            socket.off('user_left');
            socket.off('room_action_received');
            socket.off('error');
        };
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    // Handlers
    const handleCreateRoom = async () => {
        if (!roomName.trim()) return;
        setCreating(true);

        try {
            // Call API to create (persists in MongoDB)
            const res = await fetch(`${API_BASE_URL}/api/rooms/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': getUserEmail()
                },
                body: JSON.stringify({
                    name: roomName,
                    emoji: roomEmoji,
                    type: 'friends' // default
                })
            });

            const data = await res.json();
            if (res.ok) {
                // Join via Socket
                joinRoomSocket(data.roomCode);
            } else {
                alert(data.msg || 'Failed to create room');
                setCreating(false);
            }
        } catch (err) {
            console.error(err);
            setCreating(false);
        }
    };

    const handleJoinRoom = () => {
        if (!roomCode.trim()) return;
        joinRoomSocket(roomCode);
    };

    const joinRoomSocket = (code: string) => {
        if (!socketRef.current) return;

        socketRef.current.emit('join_room', {
            roomCode: code,
            userId: session?.user?.email || `guest_${tempUsername || username}`, // Need ID but email works for lookup
            username: getDisplayName()
        });
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !roomCode || !socketRef.current) return;

        // Optimistic UI could be added here
        const email = session?.user?.email;
        // Ideally we need userId, but roomHandler uses socket activeUsers map or expects userId.
        // Let's check roomHandler.js: line 102: socket.on('send_message', async ({ roomCode, userId, text...
        // And joining: socket.on('join_room', ... { userId } ... activeUsers[socket.id] = { userId ... }

        // Wait, how do we get the actual MongoDB _id?
        // The join_room handler receives `userId`. The roomHandler.js tries to `User.findById(userId)`? No, see line 29: `if (!room.members.includes(userId))`.
        // If we send email as ID, `User.findById(email)` will fail because it expects ObjectId.

        // **Correction**: We need the actual User ID (_id).
        // Solution: When `join_room` is called, we should probably pass the email and let backend resolve user, OR fetch user profile first.
        // But to keep it simple and migrating from local storage: 
        // 1. We should fetch our profile to get _id.
        // OR 2. We modify `roomHandler` to accept email? No, safer to fetch _id.

        // Update: We'll modify the client to fetch profile first (useSession doesn't have _id).
        // Or we use the updated `join_room` logic:
        // Actually, let's fetch profile _id in useEffect.

        // TEMPORARY FIX: For now, we will rely on `join_room` to set up context. 
        // But specifically for `send_message`, the handler does: `const user = await User.findById(userId);`
        // So we MUST send a valid MongoID.

        // Strategy:
        // 1. Fetch `/api/users/me` on load to get `_id`.
        // 2. Pass that `_id` to socket events.
    };

    // NEW: User ID State
    const [myUserId, setMyUserId] = useState<string>('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/users/me`, {
                    headers: { 'x-user-email': getUserEmail() }
                });
                if (res.ok) {
                    const user = await res.json();
                    setMyUserId(user._id);
                }
            } catch (err) {
                // Guest creation implicitly handles creation on backend via middleware usually, 
                // but /users/me works for auto-created guests too if middleware is good.
                console.error(err);
            }
        };
        if (getUserEmail()) fetchUser();
    }, [session, username]);


    // Refined sendMessage with myUserId
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !roomCode || !socketRef.current || !myUserId) return;

        socketRef.current.emit('send_message', {
            roomCode,
            userId: myUserId,
            text: input
        });
        setInput('');
    };

    const reactToMessage = (messageId: string, emoji: string) => {
        if (!socketRef.current || !myUserId) return;
        socketRef.current.emit('message_reaction', {
            messageId,
            userId: myUserId,
            emoji
        });
    };

    const sendRoomAction = (action: any) => {
        if (!socketRef.current || !myUserId) return;

        socketRef.current.emit('room_action', {
            roomCode,
            fromUserId: myUserId,
            fromUsername: getDisplayName(),
            action
        });
        setShowActions(false);
    };

    // ... (Confetti helper remains same)
    const createConfetti = () => {
        const confettiEmojis = ['🎉', '🎊', '✨', '💕', '❤️', '⭐'];
        const container = document.body;
        for (let i = 0; i < 30; i++) {
            const emoji = document.createElement('div');
            emoji.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.top = '-50px';
            emoji.style.fontSize = '30px';
            emoji.style.zIndex = '9999';
            emoji.style.pointerEvents = 'none';
            emoji.style.transition = 'all 3s ease-out';
            container.appendChild(emoji);
            setTimeout(() => {
                emoji.style.top = '120vh';
                emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
                emoji.style.opacity = '0';
            }, 100);
            setTimeout(() => container.removeChild(emoji), 3100);
        }
    };

    const handleLeaveRoom = () => {
        if (!socketRef.current || !roomCode) return;
        socketRef.current.emit('leave_room', {
            roomCode,
            username: getDisplayName()
        });
        setJoined(false);
        setCurrentRoom(null);
        setMessages([]);
        setRoomCode('');
    };

    const roomActions = [
        { id: 'hug', emoji: '🤗', label: 'Group Hug', color: '#FFB6C1' },
        { id: 'high-five', emoji: '✋', label: 'High-Five', color: '#FFD700' },
        { id: 'confetti', emoji: '🎉', label: 'Confetti', color: '#DC143C' },
        { id: 'cheer', emoji: '📣', label: 'Cheer', color: '#FF1493' },
        { id: 'vibe-check', emoji: '✨', label: 'Vibe Check', color: '#9370DB' },
        { id: 'lofi', emoji: '🎵', label: 'Lo-Fi Mode', color: '#8A2BE2' },
        { id: 'truth', emoji: '🤔', label: 'Truth?', color: '#20B2AA' },
        { id: 'dare', emoji: '😈', label: 'Dare!', color: '#FF4500' },
    ];

    const quickReactions = ['❤️', '😂', '😭', '🔥', '🫶'];

    const saveUsername = () => {
        if (tempUsername.trim()) {
            setUsername(tempUsername);
            localStorage.setItem('heartsync_username', tempUsername);
            setShowUsernamePrompt(false);
        }
    };

    if (status === 'loading') return <div className="p-12 text-center">Loading...</div>;

    // ... (Username prompt Modal - same as/similar to before)
    if (showUsernamePrompt) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-love-rose to-love-crimson rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <span className="text-4xl">👋</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-playfair font-bold text-love-charcoal mb-2">What's your name?</h2>
                        <input
                            type="text"
                            value={tempUsername}
                            onChange={(e) => setTempUsername(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveUsername()}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 rounded-xl border-2 border-love-blush outline-none text-center"
                            autoFocus
                        />
                        <button onClick={saveUsername} disabled={!tempUsername.trim()} className="w-full py-3 mt-4 bg-[#FF5090] text-white rounded-xl font-bold">
                            Continue 🎪
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-2 px-2 h-full">
            {!joined ? (
                // Lobby
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="glass-card p-4 space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-love-rose to-love-crimson rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <span className="text-4xl">🎪</span>
                        </div>

                        <div className="text-center">
                            <h1 className="text-3xl md:text-4xl font-playfair font-black text-love-charcoal mb-2 tracking-tight">
                                {mode === 'create' ? 'Create a Room' : 'Join a Room'}
                            </h1>
                            <p className="text-love-charcoal/70 max-w-md mx-auto">
                                {mode === 'create' ? 'Start your own party room! 🎉' : 'Enter a room code to join! 🎪'}
                            </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex gap-2 max-w-md mx-auto">
                            <button onClick={() => setMode('create')} className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${mode === 'create' ? 'bg-[#FF5090] text-white border-transparent' : 'bg-white border-[#FFF0F3] text-love-charcoal'}`}>Create Room</button>
                            <button onClick={() => setMode('join')} className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${mode === 'join' ? 'bg-[#FF5090] text-white border-transparent' : 'bg-white border-[#FFF0F3] text-love-charcoal'}`}>Join Room</button>
                        </div>

                        {mode === 'create' ? (
                            <div className="space-y-4 max-w-md mx-auto">
                                <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room Name" className="w-full px-4 py-3 rounded-xl border-2 border-love-blush outline-none bg-white/50" />
                                <div className="grid grid-cols-6 gap-2">
                                    {['🎪', '🎉', '❤️', '🎮', '🎬', '💕', '🌹', '🍫', '⭐', '🎵', '🔥', '✨'].map(emoji => (
                                        <button key={emoji} onClick={() => setRoomEmoji(emoji)} className={`text-3xl p-3 rounded-xl border-2 ${roomEmoji === emoji ? 'bg-love-crimson/10 border-love-crimson' : 'bg-white border-love-blush/30'}`}>{emoji}</button>
                                    ))}
                                </div>
                                <button onClick={handleCreateRoom} disabled={!roomName.trim() || creating} className="w-full py-4 bg-[#FF5090] text-white rounded-xl font-bold shadow-lg disabled:opacity-50">
                                    {creating ? 'Creating...' : 'Create & Join Room 🎪'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-md mx-auto">
                                <input type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} placeholder="ABC1234" className="w-full px-6 py-4 rounded-xl border-2 border-love-blush outline-none bg-white/50 text-center text-xl font-bold uppercase" maxLength={6} />
                                <button onClick={handleJoinRoom} disabled={roomCode.length !== 6} className="w-full py-4 bg-[#FF5090] text-white rounded-xl font-bold shadow-lg disabled:opacity-50">Enter Room 🎪</button>

                                {availableRooms.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-love-blush">
                                        <p className="text-sm font-medium text-love-charcoal mb-3">Your Rooms:</p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {availableRooms.map(room => (
                                                <button key={room.roomCode} onClick={() => { setRoomCode(room.roomCode); joinRoomSocket(room.roomCode); }} className="w-full p-3 bg-white rounded-lg hover:bg-love-blush/20 text-left flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{room.emoji}</span>
                                                        <div><p className="font-medium">{room.name}</p><p className="text-xs opacity-60">{room.members.length} members</p></div>
                                                    </div>
                                                    <span className="font-mono font-bold text-love-crimson bg-white px-2 py-1 rounded">{room.roomCode}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                // Room Interface
                <div className="flex flex-col h-full gap-2">
                    <div className="glass-card p-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-love-rose to-love-crimson rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-2xl">{currentRoom?.emoji}</span>
                            </div>
                            <div>
                                <h2 className="font-bold text-xl text-love-charcoal">{currentRoom?.name}</h2>
                                <p className="text-sm text-love-charcoal/60 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {currentRoom?.members?.length || 0} members · Code: <span className="font-mono font-bold">{roomCode}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={() => router.push('/interactions/gift')} className="px-4 py-2 bg-gradient-to-r from-love-gold to-yellow-500 text-white rounded-xl font-medium shadow-md flex items-center gap-2">
                                <span className="text-lg">🎁</span> Gift
                            </button>
                            <button onClick={() => setShowActions(!showActions)} className="px-4 py-2 bg-love-rose/20 text-love-rose rounded-xl font-medium hover:bg-love-rose/30 transition-all flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Actions
                            </button>
                            <button onClick={handleLeaveRoom} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-all flex items-center gap-2">
                                <LogOut className="w-4 h-4" /> Leave
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showActions && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-4 mb-4">
                                <h3 className="font-bold mb-3 text-love-charcoal">Send Room Action</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {roomActions.map(action => (
                                        <button key={action.id} onClick={() => sendRoomAction(action)} className="p-4 bg-white rounded-xl hover:shadow-lg transition-all text-center" style={{ borderLeft: `4px solid ${action.color}` }}>
                                            <span className="text-3xl block mb-2">{action.emoji}</span>
                                            <span className="text-xs font-medium text-love-charcoal">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex-1 glass-card p-6 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
                            {messages.map((msg, i) => {
                                // To check if me, we need myUserId. 
                                // Backend message object populates user: { _id, username... } or sometimes just ID if not populated deep enough?
                                // roomHandler: await message.populate('user'...)
                                // So msg.user is an object.
                                const isMe = (typeof msg.user === 'object' && (msg.user as any)._id === myUserId) || (msg.user as any) === myUserId;
                                const isSystem = msg.type === 'system';
                                const displayName = typeof msg.user === 'object' ? (msg.user as any).alias || (msg.user as any).username : 'Unknown';

                                return (
                                    <motion.div key={msg._id || i} initial={{ opacity: 0, x: isMe ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSystem ? 'items-center' : ''}`}>
                                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isSystem ? 'bg-love-blush/30 text-love-charcoal text-center text-sm mx-auto' : isMe ? 'bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-br-none shadow-md' : 'bg-white text-love-charcoal border border-love-blush rounded-bl-none shadow-sm'}`}>
                                            {!isMe && !isSystem && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold opacity-80">{displayName}</span>
                                                </div>
                                            )}
                                            <p>{msg.text}</p>
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {msg.reactions.map((r, ri) => <span key={ri} className="text-xs bg-white/20 px-2 py-1 rounded-full">{r.emoji}</span>)}
                                                </div>
                                            )}
                                        </div>
                                        {!isSystem && msg._id && !isMe && (
                                            <div className="flex gap-1 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                                                {quickReactions.map(emoji => <button key={emoji} onClick={() => reactToMessage(msg._id, emoji)} className="text-xs hover:scale-125 transition-transform">{emoji}</button>)}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="relative">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="w-full pl-4 pr-12 py-4 rounded-full border-2 border-love-blush outline-none bg-white/70" />
                            <button type="submit" disabled={!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-full hover:shadow-lg disabled:opacity-50">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
