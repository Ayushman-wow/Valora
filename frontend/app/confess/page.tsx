'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Lock, Unlock, Users, Sparkles, MessageSquareHeart } from 'lucide-react';
import JSConfetti from 'js-confetti';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { API_BASE_URL, SOCKET_URL } from '@/config/env';

interface Message {
    _id: string;
    content: string;
    likes: number;
    theme: string;
    createdAt: string;
}

export default function ConfessPage() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [confession, setConfession] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [someoneTyping, setSomeoneTyping] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        fetchMessages();

        // Socket Initialization
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('social_presence', {
                username,
                activity: 'Confessing',
                path: '/confess'
            });
        });

        socket.on('new_confession', (newMessage: Message) => {
            setMessages(prev => {
                if (prev.find(m => m._id === newMessage._id)) return prev;
                return [newMessage, ...prev];
            });
            const jsConfetti = new JSConfetti();
            jsConfetti.addConfetti({ emojis: ['💌'], confettiNumber: 5 });
        });

        socket.on('social_update', ({ activeUsers }: { activeUsers: any[] }) => {
            setActiveUsers(activeUsers.filter(u => u.path === '/confess'));
        });

        socket.on('someone_typing', ({ username, isTyping }: { username: string, isTyping: boolean }) => {
            setSomeoneTyping(isTyping ? username : null);
        });

        return () => {
            socket.disconnect();
        };
    }, [username]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setConfession(e.target.value);

        if (socketRef.current) {
            socketRef.current.emit('typing_confession', { username, isTyping: true });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('typing_confession', { username, isTyping: false });
            }, 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confession.trim()) return;
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: confession })
            });

            if (res.ok) {
                const newMessage = await res.json();
                setMessages(prev => {
                    if (prev.find(m => m._id === newMessage._id)) return prev;
                    return [newMessage, ...prev];
                });
                setConfession('');
                if (socketRef.current) {
                    socketRef.current.emit('typing_confession', { username, isTyping: false });
                }
                const jsConfetti = new JSConfetti();
                jsConfetti.addConfetti({ emojis: ['💖'] });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Presence Indicator */}
            <div className="flex justify-center -mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-love-blush flex items-center gap-3"
                >
                    <div className="flex -space-x-2">
                        {activeUsers.slice(0, 3).map((u, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-tr from-love-rose to-love-crimson border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                                {u.username[0].toUpperCase()}
                            </div>
                        ))}
                    </div>
                    <span className="text-sm font-bold text-love-charcoal/70">
                        {activeUsers.length} {activeUsers.length === 1 ? 'heart is' : 'hearts are'} whispering right now
                    </span>
                    <Sparkles className="w-4 h-4 text-love-gold animate-pulse" />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-5xl md:text-7xl font-playfair font-black text-transparent bg-clip-text bg-gradient-to-r from-love-crimson to-love-rose drop-shadow-sm">
                    The Love Wall
                </h1>
                <p className="text-xl text-love-charcoal/70 font-outfit max-w-2xl mx-auto">
                    Anonymous confessions from hearts around the world.
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Confession Form */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white/40 backdrop-blur-lg p-8 rounded-3xl border border-white/50 shadow-glass h-fit sticky top-24"
                >
                    <h2 className="text-2xl font-bold text-love-rose mb-6 flex items-center gap-2">
                        <Lock className="w-6 h-6" /> Secret Confession
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <textarea
                                value={confession}
                                onChange={handleTyping}
                                placeholder="What does your heart want to say? (It's anonymous...)"
                                className="w-full h-48 p-5 rounded-2xl border-2 border-love-blush/30 bg-white/50 focus:ring-4 focus:ring-love-rose/10 focus:border-love-rose outline-none resize-none transition-all font-outfit text-lg"
                            />
                            <AnimatePresence>
                                {someoneTyping && someoneTyping !== username && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 bg-love-rose/10 rounded-full border border-love-rose/20"
                                    >
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-love-rose rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-love-rose rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <span className="w-1.5 h-1.5 bg-love-rose rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                        <span className="text-[10px] font-bold text-love-rose uppercase tracking-tighter">Someone is whispering...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative z-20">
                            <button
                                disabled={loading || !confession.trim()}
                                type="submit"
                                className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 border-2 border-white/20 active:scale-95 ${loading || !confession.trim()
                                        ? "bg-love-rose/20 text-love-rose/40 cursor-not-allowed"
                                        : "bg-love-crimson text-white hover:bg-love-dusk hover:shadow-love-crimson/30"
                                    }`}
                            >
                                {loading ? 'Sending...' : <><Send className="w-5 h-5 fill-current" /> <span className="text-xl font-bold">Send Whisper</span></>}
                            </button>
                        </div>
                        <p className="text-sm text-center text-love-charcoal/50 font-medium">
                            Your identity is hidden. Always.
                        </p>
                    </form>
                </motion.div>

                {/* Message Feed */}
                <div className="lg:col-span-3 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center p-12 bg-white/20 rounded-3xl border-2 border-dashed border-love-rose/30"
                            >
                                <p className="text-love-charcoal/60 text-lg">No whispers yet. Be the first to share your heart.</p>
                            </motion.div>
                        ) : (
                            messages.map((msg, idx) => (
                                <motion.div
                                    key={msg._id}
                                    layout
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                    className="p-8 bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-love-rose to-love-crimson opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-4 right-6 text-love-rose/5 group-hover:text-love-rose/10 transition-colors">
                                        <MessageSquareHeart className="w-16 h-16" />
                                    </div>
                                    <p className="text-love-charcoal font-outfit text-xl leading-relaxed mb-6 italic relative z-10">
                                        "{msg.content}"
                                    </p>
                                    <div className="flex justify-between items-center text-sm font-bold relative z-10">
                                        <span className="px-3 py-1 bg-love-blush/30 text-love-rose rounded-lg uppercase tracking-wider text-[10px]">
                                            Anonymous Heart
                                        </span>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:scale-105 transition-transform border border-love-blush/20">
                                            <Heart className={`w-4 h-4 ${msg.likes > 0 ? 'text-love-rose fill-love-rose' : 'text-love-rose'}`} />
                                            <span className="text-love-charcoal">{msg.likes || 0}</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
