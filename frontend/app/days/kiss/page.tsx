'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as MemoryStorage from '@/lib/memoryStorage';
import confetti from 'canvas-confetti';

interface Kiss {
    id: string;
    type: 'shy' | 'filmy' | 'muah';
    recipient: string;
    timestamp: number;
}

const REACTIONS = [
    { id: 'shy', label: 'Shy / Blush', emoji: '🫣', color: 'bg-pink-200' },
    { id: 'filmy', label: 'Filmy Style', emoji: '🎬', color: 'bg-red-200' },
    { id: 'muah', label: 'Flying Kiss', emoji: '💋', color: 'bg-rose-200' },
];

export default function KissDayPage() {
    const router = useRouter();
    const [kisses, setKisses] = useState<Kiss[]>([]);
    const [animating, setAnimating] = useState<string | null>(null);

    // Config
    const [recipient, setRecipient] = useState('');

    const { data: session } = useSession();
    const getUserEmail = () => session?.user?.email || localStorage.getItem('heartsync_username') ? `${localStorage.getItem('heartsync_username')!.replace(/\s+/g, '')}@guest.com` : '';


    useEffect(() => {
        const loadMemories = async () => {
            const email = getUserEmail();
            if (email) {
                const memories = await MemoryStorage.getMemoriesByDay('kiss', email);
                setKisses(memories.map(m => m.content as Kiss));
            }
        };
        loadMemories();
    }, [session]);

    const sendReaction = (type: any) => {
        if (!recipient.trim()) return;

        setAnimating(type.id);

        // Simulate animation delay
        setTimeout(async () => {
            const newKiss: Kiss = {
                id: Date.now().toString(),
                type: type.id as any,
                recipient,
                timestamp: Date.now()
            };

            const email = getUserEmail();
            if (email) {
                await MemoryStorage.saveMemory('kiss', 'given', newKiss, recipient, email);
                setKisses(prev => [...prev, newKiss]);
            }

            // FX
            if (type.id === 'muah') {
                confetti({
                    shapes: ['heart'],
                    colors: ['#E91E63', '#F48FB1']
                });
            }

            setAnimating(null);
            setRecipient('');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-pink-50 font-outfit relative overflow-hidden flex flex-col items-center justify-center">

            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-6 flex justify-between z-20">
                <button onClick={() => router.push('/days')} className="p-3 bg-white/50 backdrop-blur rounded-full hover:bg-white text-pink-900 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-playfair font-bold text-pink-900 tracking-wide">Kiss Reactions 💋</h1>
                </div>
                <div className="w-10" />
            </header>

            {/* Main Area */}
            <div className="relative z-10 w-full max-w-md px-6 space-y-8 text-center">

                {/* Stage */}
                <div className="h-64 flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {animating ? (
                            <motion.div
                                key={animating}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 1, rotate: [0, -10, 10, 0] }}
                                exit={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="text-9xl filter drop-shadow-2xl"
                            >
                                {REACTIONS.find(r => r.id === animating)?.emoji}
                            </motion.div>
                        ) : (
                            <div className="opacity-50 space-y-2">
                                <Sparkles className="w-16 h-16 text-pink-300 mx-auto animate-pulse" />
                                <p className="text-sm font-bold text-pink-800 uppercase tracking-widest">Select a Vibe</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Recipient Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                        placeholder="Who is this for?"
                        className="w-full text-center text-xl font-bold bg-transparent border-b-2 border-pink-200 focus:border-pink-500 outline-none placeholder-pink-200 text-pink-900 transition-colors py-2"
                    />
                </div>

                {/* Reaction Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {REACTIONS.map(reaction => (
                        <button
                            key={reaction.id}
                            onClick={() => sendReaction(reaction)}
                            disabled={!recipient.trim() || !!animating}
                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${!recipient.trim() ? 'opacity-50 cursor-not-allowed bg-gray-100' : `${reaction.color} hover:scale-105 active:scale-95 shadow-lg`}`}
                        >
                            <span className="text-4xl">{reaction.emoji}</span>
                            <span className="text-[10px] font-bold text-pink-900 uppercase">{reaction.label}</span>
                        </button>
                    ))}
                </div>

                {/* Counter */}
                {kisses.length > 0 && (
                    <div className="text-pink-400 text-xs font-bold uppercase tracking-widest mt-8">
                        {kisses.length} Reactions Sent Today
                    </div>
                )}
            </div>

            {/* Floating Background Hearts */}
            <div className="fixed inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-pink-200 text-4xl"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: window.innerHeight + 50
                        }}
                        animate={{
                            y: -50,
                            rotate: 360
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear"
                        }}
                    >
                        ❤️
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
