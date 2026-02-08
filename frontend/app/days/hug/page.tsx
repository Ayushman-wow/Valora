'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Hand, Zap, Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as MemoryStorage from '@/lib/memoryStorage';
import confetti from 'canvas-confetti';

interface Hug {
    id: string;
    type: 'warm' | 'tight' | 'bear';
    recipient: string;
    timestamp: number;
}

const HUG_TYPES = [
    { id: 'warm', label: 'Warm Hug', icon: Heart, color: 'text-orange-500', bg: 'bg-orange-100', emoji: '🤗' },
    { id: 'tight', label: 'Tight Squeeze', icon: Zap, color: 'text-red-500', bg: 'bg-red-100', emoji: '🫂' },
    { id: 'bear', label: 'Bear Hug', icon: Smile, color: 'text-brown-500', bg: 'bg-yellow-100', emoji: '🐻' },
];

export default function HugDayPage() {
    const router = useRouter();
    const [hugs, setHugs] = useState<Hug[]>([]);
    const [hugging, setHugging] = useState(false);

    // Config
    const [selectedType, setSelectedType] = useState(HUG_TYPES[0]);
    const [recipient, setRecipient] = useState('');
    const [holdDuration, setHoldDuration] = useState(0);

    const { data: session } = useSession();
    const getUserEmail = () => session?.user?.email || localStorage.getItem('heartsync_username') ? `${localStorage.getItem('heartsync_username')!.replace(/\s+/g, '')}@guest.com` : '';

    useEffect(() => {
        const loadMemories = async () => {
            const email = getUserEmail();
            if (email) {
                const memories = await MemoryStorage.getMemoriesByDay('hug', email);
                setHugs(memories.map(m => m.content as Hug));
            }
        };
        loadMemories();
    }, [session]);

    // Timer for hold
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (hugging) {
            interval = setInterval(() => {
                setHoldDuration(prev => Math.min(prev + 5, 100));
            }, 50);
        } else {
            setHoldDuration(0);
        }
        return () => clearInterval(interval);
    }, [hugging]);

    const handleSendHug = async () => {
        if (!recipient.trim()) return;

        const newHug: Hug = {
            id: Date.now().toString(),
            type: selectedType.id as any,
            recipient,
            timestamp: Date.now()
        };

        const email = getUserEmail();
        if (email) {
            await MemoryStorage.saveMemory('hug', 'given', newHug, recipient, email);
            setHugs([...hugs, newHug]);
        }
        setRecipient('');

        // FX
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFB74D', '#FFCC80']
        });
    };

    return (
        <div className="min-h-screen bg-orange-50 font-outfit relative overflow-hidden flex flex-col items-center justify-center">

            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-6 flex justify-between z-20">
                <button onClick={() => router.push('/days')} className="p-3 bg-white/50 backdrop-blur rounded-full hover:bg-white text-orange-900 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-playfair font-bold text-orange-900 tracking-wide">Hug Station 🤗</h1>
                </div>
                <div className="w-10" />
            </header>

            {/* Main Area */}
            <div className="relative z-10 text-center space-y-8 max-w-md w-full px-6">

                {/* Visualizer */}
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                    {/* Ripple Effect */}
                    <AnimatePresence>
                        {hugging && (
                            <>
                                <motion.div
                                    className="absolute inset-0 rounded-full border-4 border-orange-300 opacity-50"
                                    initial={{ scale: 0.8, opacity: 0.5 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-full border-4 border-orange-200 opacity-30"
                                    initial={{ scale: 0.8, opacity: 0.5 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Main Button */}
                    <motion.button
                        onMouseDown={() => setHugging(true)}
                        onMouseUp={() => { setHugging(false); handleSendHug(); }}
                        onTouchStart={() => setHugging(true)}
                        onTouchEnd={() => { setHugging(false); handleSendHug(); }}
                        whileTap={{ scale: 0.9 }}
                        disabled={!recipient.trim()}
                        className={`w-48 h-48 rounded-full bg-gradient-to-br ${selectedType.id === 'warm' ? 'from-orange-400 to-orange-600' : selectedType.id === 'tight' ? 'from-red-400 to-red-600' : 'from-yellow-500 to-orange-700'} text-white shadow-2xl flex flex-col items-center justify-center relative z-20 transition-all ${!recipient.trim() ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                    >
                        <span className="text-6xl mb-2 filter drop-shadow-md">{selectedType.emoji}</span>
                        <span className="font-playfair font-bold text-lg pointer-events-none">
                            {holdDuration > 0 ? 'Charging...' : 'Hold to Hug'}
                        </span>
                        {/* Progress Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                            <circle cx="96" cy="96" r="90" fill="none" stroke="white" strokeWidth="4" strokeDasharray="565" strokeDashoffset={565 - (565 * holdDuration) / 100} strokeLinecap="round" className="opacity-50" />
                        </svg>
                    </motion.button>
                </div>

                {/* Controls */}
                <div className="bg-white/60 backdrop-blur p-6 rounded-3xl shadow-xl space-y-6">
                    <div>
                        <label className="text-xs font-bold text-orange-900/60 uppercase ml-1">Hug Type</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {HUG_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type)}
                                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${selectedType.id === type.id ? 'bg-white shadow-md ring-2 ring-orange-400 scale-105' : 'hover:bg-white/50'}`}
                                >
                                    <span className="text-2xl">{type.emoji}</span>
                                    <span className="text-[10px] font-bold text-orange-900">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-orange-900/60 uppercase ml-1">Send To</label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                            placeholder="Name..."
                            className="w-full mt-1 px-4 py-3 rounded-xl bg-orange-50 border-none outline-none focus:ring-2 focus:ring-orange-300 text-orange-900 placeholder-orange-300 text-center font-bold"
                        />
                    </div>
                </div>

                {/* History */}
                {hugs.length > 0 && (
                    <div className="pt-8 opacity-60">
                        <p className="text-xs font-bold text-orange-900 uppercase mb-2">Recent Hugs</p>
                        <div className="flex justify-center gap-2 flex-wrap">
                            {hugs.slice(-5).map((h, i) => (
                                <div key={i} className="bg-white/40 px-3 py-1 rounded-full text-xs text-orange-800">
                                    {h.recipient}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
