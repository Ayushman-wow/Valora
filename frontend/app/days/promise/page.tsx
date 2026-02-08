'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Unlock, Key, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as MemoryStorage from '@/lib/memoryStorage';

interface PromiseLock {
    id: string;
    promise: string;
    recipient: string;
    locked: boolean;
    timestamp: number;
}

export default function PromiseDayPage() {
    const router = useRouter();
    const [locks, setLocks] = useState<PromiseLock[]>([]);
    const [creating, setCreating] = useState(false);

    // Form State
    const [promiseText, setPromiseText] = useState('');
    const [recipient, setRecipient] = useState('');

    const { data: session } = useSession();
    const getUserEmail = () => session?.user?.email || localStorage.getItem('heartsync_username') ? `${localStorage.getItem('heartsync_username')!.replace(/\s+/g, '')}@guest.com` : '';

    useEffect(() => {
        const loadMemories = async () => {
            const email = getUserEmail();
            if (email) {
                const memories = await MemoryStorage.getMemoriesByDay('promise', email);
                setLocks(memories.map(m => m.content as PromiseLock));
            }
        };
        loadMemories();
    }, [session]);

    const handleLockPromise = async () => {
        if (!promiseText.trim()) return;

        const newLock: PromiseLock = {
            id: Date.now().toString(),
            promise: promiseText,
            recipient: recipient || 'Self',
            locked: true,
            timestamp: Date.now()
        };

        const email = getUserEmail();
        if (email) {
            await MemoryStorage.saveMemory('promise', 'given', newLock, recipient, email);
            setLocks([...locks, newLock]);
        }
        setCreating(false);
        setPromiseText('');
        setRecipient('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 font-playfair relative overflow-hidden text-indigo-100">

            {/* Ambient Stars */}
            <div className="fixed inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full opacity-20 animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3}px`,
                            height: `${Math.random() * 3}px`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="p-6 flex items-center justify-between z-20 relative">
                <button onClick={() => router.push('/days')} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all text-indigo-100">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-widest text-indigo-50">Promise Vault</h1>
                    <p className="text-xs text-indigo-300/60 font-sans tracking-wide">Seal your words forever.</p>
                </div>
                <div className="w-10" />
            </header>

            {/* Locks Grid */}
            <div className="max-w-5xl mx-auto px-6 pb-24 relative z-10 min-h-[60vh] flex flex-col items-center justify-center">

                {locks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center space-y-6 opacity-60"
                    >
                        <Lock className="w-20 h-20 text-indigo-300 mx-auto" />
                        <h2 className="text-2xl font-bold">No promises locked yet.</h2>
                        <p className="text-sm font-sans max-w-xs mx-auto">Make a promise that lasts. Lock it here as a symbol of your trust.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
                        {locks.map((lock, idx) => (
                            <motion.div
                                key={lock.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative flex flex-col items-center"
                            >
                                {/* Lock Body */}
                                <div className="relative w-32 h-40">
                                    {/* Shackle */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-24 border-[6px] border-yellow-500/80 rounded-t-full z-0 transition-all group-hover:-translate-y-2" />

                                    {/* Body */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-2xl z-10 flex items-center justify-center border-t border-yellow-300/50">
                                        <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center shadow-inner">
                                            <ShieldCheck className="w-6 h-6 text-yellow-100/50" />
                                        </div>
                                    </div>
                                </div>

                                {/* Tag */}
                                <div className="mt-4 text-center bg-black/30 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                                    <p className="text-sm font-bold text-yellow-100">To: {lock.recipient}</p>
                                    <p className="text-xs text-indigo-200 mt-1 font-sans italic truncate w-32">"{lock.promise}"</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <div className="fixed bottom-8 left-0 w-full flex justify-center z-30">
                <button
                    onClick={() => setCreating(true)}
                    className="px-8 py-4 bg-yellow-500 text-indigo-900 rounded-full font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <Key className="w-5 h-5" /> Make a Promise
                </button>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {creating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#1E1E2E] border border-indigo-500/30 w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Lock className="w-6 h-6 text-yellow-500" /> New Promise
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">To Whom?</label>
                                    <input
                                        value={recipient}
                                        onChange={e => setRecipient(e.target.value)}
                                        placeholder="Recipient Name"
                                        className="w-full mt-2 bg-black/20 border border-indigo-500/20 rounded-xl px-4 py-3 text-indigo-100 placeholder-indigo-500/50 outline-none focus:border-indigo-400 transition-colors font-sans"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Your Promise</label>
                                    <textarea
                                        value={promiseText}
                                        onChange={e => setPromiseText(e.target.value)}
                                        placeholder="I promise to..."
                                        rows={3}
                                        className="w-full mt-2 bg-black/20 border border-indigo-500/20 rounded-xl px-4 py-3 text-indigo-100 placeholder-indigo-500/50 outline-none focus:border-indigo-400 transition-colors font-sans resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setCreating(false)}
                                        className="px-6 py-3 rounded-xl bg-white/5 text-indigo-300 hover:bg-white/10 font-sans font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleLockPromise}
                                        disabled={!promiseText.trim()}
                                        className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-indigo-950 rounded-xl font-bold shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 transition-all font-sans flex items-center justify-center gap-2"
                                    >
                                        Lock It Forever <Lock className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
