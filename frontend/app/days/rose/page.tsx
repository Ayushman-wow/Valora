'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Flower2, Heart, Users, Sparkles, Send, MapPin, Sparkle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as MemoryStorage from '@/lib/memoryStorage';
import confetti from 'canvas-confetti';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config/env';

interface Rose {
    id: string;
    type: 'red' | 'yellow' | 'pink';
    message: string;
    sender: string;
    recipient: string;
    timestamp: number;
}

const ROSE_TYPES = [
    { type: 'red', label: 'Love', color: 'text-red-500', bg: 'bg-red-100', emoji: '🌹' },
    { type: 'yellow', label: 'Friendship', color: 'text-yellow-500', bg: 'bg-yellow-100', emoji: '🌻' },
    { type: 'pink', label: 'Admiration', color: 'text-pink-500', bg: 'bg-pink-100', emoji: '🌸' },
];

export default function RoseGardenPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [roses, setRoses] = useState<Rose[]>([]);
    const [showPlantModal, setShowPlantModal] = useState(false);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const socketRef = useRef<Socket | null>(null);

    // Form State
    const [username, setUsername] = useState('');
    const [selectedType, setSelectedType] = useState(ROSE_TYPES[0]);
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const name = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';
        setUsername(name);

        // Socket for Presence
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('social_presence', {
                username: name,
                activity: 'Gardening',
                path: '/days/rose'
            });
        });

        socket.on('social_update', ({ activeUsers }: { activeUsers: any[] }) => {
            setActiveUsers(activeUsers.filter(u => u.path === '/days/rose'));
        });

        return () => { socket.disconnect(); };
    }, [session]);

    const getUserEmail = () => session?.user?.email || (username ? `${username.replace(/\s+/g, '')}@guest.com` : '');

    useEffect(() => {
        const loadRoses = async () => {
            const email = getUserEmail();
            if (email) {
                const memories = await MemoryStorage.getMemoriesByDay('rose', email);
                setRoses(memories.map(m => ({
                    id: m._id || Date.now().toString(),
                    type: m.content.type,
                    message: m.content.message,
                    sender: m.content.sender || 'You',
                    recipient: m.recipient || m.content.recipient,
                    timestamp: m.content.timestamp || Date.now()
                } as Rose)));
            }
        };
        loadRoses();
    }, [username, session]);

    const handlePlantRose = async () => {
        if (!recipient.trim() || !message.trim()) return;

        const newRosePart = {
            type: selectedType.type,
            message,
            sender: username || 'You',
            recipient,
            timestamp: Date.now()
        };

        await MemoryStorage.saveMemory('rose', 'given', newRosePart, recipient, getUserEmail());
        setRoses(prev => [...prev, {
            id: Date.now().toString(),
            ...newRosePart,
            type: newRosePart.type as any
        } as Rose]);

        setShowPlantModal(false);
        setRecipient('');
        setMessage('');

        confetti({
            particleCount: 50,
            spread: 60,
            colors: [selectedType.type === 'red' ? '#EF4444' : selectedType.type === 'yellow' ? '#EAB308' : '#EC4899']
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 font-outfit relative overflow-hidden">
            {/* Presence Indicator */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
                <AnimatePresence>
                    {activeUsers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-emerald-100 flex items-center gap-3"
                        >
                            <div className="flex -space-x-2">
                                {activeUsers.slice(0, 3).map((u, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                                        {u.username[0].toUpperCase()}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-emerald-800/70">
                                {activeUsers.length} {activeUsers.length === 1 ? 'person is' : 'people are'} in the garden
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Header */}
            <header className="p-6 flex items-center justify-between z-20 relative">
                <button onClick={() => router.push('/days')} className="p-3 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white text-emerald-800 transition-all active:scale-90">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-3xl font-playfair font-black text-emerald-900 tracking-tight flex items-center gap-2">
                        Rose Garden <Flower2 className="w-6 h-6 text-emerald-500 animate-pulse" />
                    </h1>
                </div>
                <div className="w-11" /> {/* Spacer */}
            </header>

            {/* Garden Area */}
            <div className="max-w-5xl mx-auto px-6 pb-32 relative z-10 min-h-[70vh] flex flex-col items-center justify-center">
                {roses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6 max-w-sm"
                    >
                        <div className="w-32 h-32 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto shadow-inner border-8 border-emerald-100/50">
                            <Flower2 className="w-16 h-16 text-emerald-300" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-emerald-900">Your Garden Awaits</h2>
                            <p className="text-emerald-700/60 font-medium">Plant a token rose for someone special. Watch your secret garden grow with Every memory.</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full py-12">
                        <AnimatePresence>
                            {roses.map((rose, idx) => {
                                const config = ROSE_TYPES.find(t => t.type === rose.type) || ROSE_TYPES[0];
                                return (
                                    <motion.div
                                        key={rose.id}
                                        initial={{ scale: 0, y: 50 }}
                                        animate={{ scale: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05, type: "spring", damping: 15 }}
                                        className="group relative flex flex-col items-center justify-end"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0], y: -10 }}
                                            className="text-7xl filter drop-shadow-2xl relative z-10 cursor-pointer transition-all duration-300 origin-bottom"
                                        >
                                            {config.emoji}
                                            <Sparkle className="absolute -top-2 -right-2 w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </motion.div>
                                        <div className="w-20 h-6 bg-emerald-900/5 rounded-full blur-md -mt-4 group-hover:bg-emerald-900/10 transition-colors" />

                                        <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:-translate-y-20 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl text-xs font-bold shadow-xl text-center min-w-[160px] pointer-events-none z-30 border border-emerald-100">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                                                <p className="text-emerald-900">To: {rose.recipient}</p>
                                            </div>
                                            <p className="text-emerald-700/60 text-[10px] mb-2 font-medium">From: {rose.sender}</p>
                                            <div className="p-2 bg-emerald-50/50 rounded-xl">
                                                <p className="text-emerald-800 font-medium italic leading-tight">"{rose.message}"</p>
                                            </div>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-3 h-3 bg-white rotate-45 border-r border-b border-emerald-100" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-10 left-0 w-full flex justify-center z-30 pointer-events-none">
                <button
                    onClick={() => setShowPlantModal(true)}
                    className="pointer-events-auto flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full font-playfair font-black text-xl shadow-2xl shadow-emerald-900/20 hover:shadow-emerald-500/40 hover:-translate-y-1 active:scale-95 transition-all group"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" /> Plant a Rose
                </button>
            </div>

            {/* Planting Modal */}
            <AnimatePresence>
                {showPlantModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-emerald-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
                        onClick={() => setShowPlantModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%', scale: 0.9 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: '100%', scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] space-y-8 relative overflow-hidden ring-1 ring-white/20"
                        >
                            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-gradient" />

                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-playfair font-black text-emerald-900">Plant a New Rose</h3>
                                <p className="text-emerald-700/60 font-medium italic">Tokens of love never wither.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {ROSE_TYPES.map(type => (
                                    <button
                                        key={type.type}
                                        onClick={() => setSelectedType(type)}
                                        className={`p-5 rounded-3xl border-4 transition-all flex flex-col items-center gap-3 ${selectedType.type === type.type
                                            ? `border-emerald-500 bg-emerald-50/50 shadow-inner scale-105`
                                            : 'border-transparent bg-gray-50/50 hover:bg-gray-100/50'
                                            }`}
                                    >
                                        <span className="text-5xl drop-shadow-md">{type.emoji}</span>
                                        <span className={`text-xs font-black uppercase tracking-widest ${selectedType.type === type.type ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {type.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.2em] ml-2">For Someone Special</label>
                                    <div className="relative group">
                                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-900/20 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={recipient}
                                            onChange={e => setRecipient(e.target.value)}
                                            placeholder="Who receives this token?"
                                            className="w-full pl-16 pr-6 py-5 bg-emerald-50/30 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl outline-none font-bold text-emerald-900 transition-all placeholder:text-emerald-900/10 placeholder:font-normal"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.2em] ml-2">Your Secret Message</label>
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        placeholder="Pour your heart out in a few words..."
                                        rows={3}
                                        className="w-full p-6 bg-emerald-50/30 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl outline-none font-bold text-emerald-900 transition-all resize-none placeholder:text-emerald-900/10 placeholder:font-normal"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handlePlantRose}
                                disabled={!recipient.trim() || !message.trim()}
                                className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 group"
                            >
                                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Plant in Garden
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-20 left-10 text-emerald-800/5 text-9xl pointer-events-none font-playfair font-black rotate-12 select-none">Rose</div>
            <div className="absolute bottom-20 right-10 text-teal-800/5 text-9xl pointer-events-none font-playfair font-black -rotate-6 select-none">Garden</div>
        </div>
    );
}
