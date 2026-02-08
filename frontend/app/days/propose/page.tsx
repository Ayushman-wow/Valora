'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Lock, Eye, Mail, Feather, PenTool } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as MemoryStorage from '@/lib/memoryStorage';

interface Letter {
    id: string;
    content: string;
    revealTime: number; // timestamp
    sealed: boolean;
    recipient: string;
}

export default function ProposeDayPage() {
    const router = useRouter();
    const [letters, setLetters] = useState<Letter[]>([]);
    const [writing, setWriting] = useState(false);

    // Form State
    const [content, setContent] = useState('');
    const [recipient, setRecipient] = useState('');
    const [revealDelay, setRevealDelay] = useState(0); // 0 = now, 3600 = 1 hour, etc.

    const { data: session } = useSession();
    // Helper
    const getUserEmail = () => session?.user?.email || localStorage.getItem('heartsync_username') ? `${localStorage.getItem('heartsync_username')!.replace(/\s+/g, '')}@guest.com` : '';

    useEffect(() => {
        const loadMemories = async () => {
            const email = getUserEmail();
            if (email) {
                const memories = await MemoryStorage.getMemoriesByDay('propose', email);
                setLetters(memories.map(m => ({
                    id: m._id || Date.now().toString(),
                    content: m.content.content,
                    revealTime: m.content.revealTime,
                    sealed: m.content.sealed,
                    recipient: m.recipient || m.content.recipient || 'Someone Special'
                } as Letter)));
            }
        };
        loadMemories();
    }, [session]);

    const handleSealLetter = async () => {
        if (!content.trim()) return;

        const newLetterContent = {
            content,
            revealTime: Date.now() + revealDelay * 1000,
            sealed: true,
            recipient: recipient || 'Someone Special'
        };

        const email = getUserEmail();
        if (email) {
            await MemoryStorage.saveMemory('propose', 'given', newLetterContent, recipient, email);
            // Optimistic Update
            setLetters(prev => [...prev, {
                id: Date.now().toString(),
                ...newLetterContent
            } as Letter]);
        }

        setWriting(false);
        setContent('');
        setRecipient('');
        setRevealDelay(0);
    };

    const openLetter = (letter: Letter) => {
        if (Date.now() < letter.revealTime) {
            alert(`This letter is sealed until ${new Date(letter.revealTime).toLocaleTimeString()}!`);
            return;
        }
        alert(`Letter Content:\n\n${letter.content}`);
    };

    return (
        <div className="min-h-screen bg-[#FDF6E3] font-playfair relative overflow-hidden flex flex-col">

            {/* Header */}
            <header className="p-6 flex items-center justify-between z-20">
                <button onClick={() => router.push('/days')} className="p-3 bg-white/50 backdrop-blur rounded-full hover:bg-white text-amber-900 shadow-sm transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-amber-900 tracking-widest uppercase">The Envelope Room</h1>
                    <p className="text-xs text-amber-800/60 font-sans tracking-wide">Write. Seal. Reveal.</p>
                </div>
                <div className="w-10" />
            </header>

            {/* Desk Area */}
            <div className="flex-1 max-w-5xl mx-auto w-full p-8 relative z-10">

                {letters.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <Feather className="w-16 h-16 text-amber-300 mb-4" />
                        <h2 className="text-3xl font-bold text-amber-800/40">The desk is clear.</h2>
                        <p className="font-sans text-amber-700/40 mt-2">Write a letter to confess your feelings.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {letters.map((letter, idx) => (
                            <motion.div
                                key={letter.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => openLetter(letter)}
                                className="group cursor-pointer perspective-1000"
                            >
                                <div className="relative bg-amber-100 w-full aspect-[4/3] shadow-lg hover:shadow-xl transition-all transform group-hover:-rotate-2 group-hover:-translate-y-2 border-t-2 border-white/50">
                                    {/* Envelope Flap */}
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-amber-200 clip-path-polygon-[0_0,50%_100%,100%_0] z-20 shadow-sm" style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} />

                                    {/* Wax Seal */}
                                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-800 rounded-full shadow-inner flex items-center justify-center text-white/80 text-xs font-serif italic border-2 border-red-900 z-30">
                                        HS
                                    </div>

                                    {/* Label */}
                                    <div className="absolute bottom-4 left-0 w-full text-center">
                                        <p className="font-handwriting text-amber-900 text-lg">For {letter.recipient}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-amber-800/40 font-sans mt-1">
                                            {Date.now() < letter.revealTime ? 'SEALED 🔒' : 'OPEN 🔓'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Write Button */}
            <div className="fixed bottom-8 left-0 w-full flex justify-center z-30 pointer-events-none">
                <button
                    onClick={() => setWriting(true)}
                    className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-amber-900 text-amber-50 rounded-full font-bold text-lg shadow-2xl hover:bg-amber-800 hover:scale-105 active:scale-95 transition-all"
                >
                    <PenTool className="w-5 h-5" /> Write a Letter
                </button>
            </div>

            {/* Writing Modal */}
            <AnimatePresence>
                {writing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#FFFDF5] w-full max-w-2xl aspect-[3/4] md:aspect-[4/3] shadow-2xl relative p-8 md:p-12 flex flex-col font-serif text-gray-800"
                            style={{
                                backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px)',
                                backgroundSize: '100% 2rem'
                            }}
                        >
                            {/* Paper Header */}
                            <div className="flex justify-between items-start mb-8 relative z-10 w-full bg-[#FFFDF5]/80 backdrop-blur-sm p-4 -mx-4 -mt-4 rounded-xl">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-1">Dear...</h2>
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={e => setRecipient(e.target.value)}
                                        placeholder="Name of recipient"
                                        className="bg-transparent border-b-2 border-gray-300 focus:border-gray-900 outline-none w-full text-xl text-gray-600 placeholder-gray-300 font-handwriting"
                                    />
                                </div>
                                <button onClick={() => setWriting(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Letter Content */}
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Pour your heart out..."
                                className="flex-1 w-full bg-transparent border-none outline-none text-xl resize-none font-handwriting leading-8 text-gray-700 placeholder-gray-300/50"
                                style={{ lineHeight: '2rem' }}
                                autoFocus
                            />

                            {/* Footer Actions */}
                            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between bg-[#FFFDF5] relative z-20">
                                <div className="flex items-center gap-4">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                    <select
                                        value={revealDelay}
                                        onChange={e => setRevealDelay(Number(e.target.value))}
                                        className="bg-white border text-sm rounded-lg px-2 py-1 outline-none text-gray-600 font-sans"
                                    >
                                        <option value={0}>Open Immediately</option>
                                        <option value={60}>Open in 1 Min</option>
                                        <option value={3600}>Open in 1 Hour</option>
                                        <option value={86400}>Open Tomorrow</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleSealLetter}
                                    disabled={!content.trim()}
                                    className="px-6 py-2 bg-amber-900 text-white font-sans font-bold text-sm tracking-widest uppercase rounded hover:bg-amber-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    Seal Envelope <Send className="w-3 h-3" />
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
