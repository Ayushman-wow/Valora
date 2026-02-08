'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Heart, Star, Sparkles, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as MemoryStorage from '@/lib/memoryStorage';

export default function ValentineDayPage() {
    const router = useRouter();
    const [memories, setMemories] = useState<MemoryStorage.Memory[]>([]);

    const { data: session } = useSession();
    // Helper to get email or guest email
    const getUserEmail = () => session?.user?.email || (typeof window !== 'undefined' && localStorage.getItem('heartsync_username') ? `${localStorage.getItem('heartsync_username')!.replace(/\s+/g, '')}@guest.com` : '');


    useEffect(() => {
        const loadMemories = async () => {
            const email = getUserEmail();
            if (email) {
                const all = await MemoryStorage.getMemories(email);
                // Sort by createdAt descending
                setMemories(all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
            }
        };
        loadMemories();
    }, [session]);

    const getDayIcon = (day: string) => {
        switch (day) {
            case 'rose': return '🌹';
            case 'propose': return '💌';
            case 'chocolate': return '🍫';
            case 'teddy': return '🧸';
            case 'promise': return '🤞';
            case 'hug': return '🤗';
            case 'kiss': return '💋';
            default: return '❤️';
        }
    };

    const getDayLabel = (day: string) => {
        return day.charAt(0).toUpperCase() + day.slice(1) + ' Day';
    };

    const MemoryCard = ({ memory }: { memory: MemoryStorage.Memory }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 relative overflow-hidden group hover:shadow-xl transition-all"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">
                {getDayIcon(memory.day)}
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getDayIcon(memory.day)}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-pink-400">{getDayLabel(memory.day)}</span>
                </div>

                <h3 className="text-lg font-playfair font-bold text-gray-800 mb-1">
                    To: {memory.recipient || memory.content.recipient}
                </h3>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 italic">
                    {memory.day === 'rose' && `Sent a ${memory.content.type} rose: "${memory.content.message}"`}
                    {memory.day === 'propose' && `Sealed a letter (opens ${new Date(memory.content.revealTime).toLocaleDateString()})`}
                    {memory.day === 'chocolate' && `Curated a box of ${memory.content.slots?.filter(Boolean).length} chocolates`}
                    {memory.day === 'teddy' && `Designed a teddy named "${memory.content.name}"`}
                    {memory.day === 'promise' && `Locked a promise: "${memory.content.promise}"`}
                    {memory.day === 'hug' && `Sent a ${memory.content.type} hug`}
                    {memory.day === 'kiss' && `Reacted with ${memory.content.type} style`}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(memory.createdAt || memory.content.timestamp || Date.now()).toLocaleString()}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-pink-50/50 font-outfit relative">

            {/* Header */}
            <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-20 border-b border-pink-100">
                <button onClick={() => router.push('/days')} className="p-3 hover:bg-pink-50 rounded-full text-pink-900 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-playfair font-bold text-pink-900">Memory Hall ❤️</h1>
                    <p className="text-xs text-pink-500 font-bold uppercase tracking-widest">Your Week in Review</p>
                </div>
                <div className="w-10" />
            </header>

            {/* Timeline */}
            <div className="max-w-3xl mx-auto p-6 pb-24 space-y-8">
                {memories.length === 0 ? (
                    <div className="text-center py-20 opacity-60">
                        <Folder className="w-24 h-24 mx-auto mb-4 text-pink-200" />
                        <h2 className="text-2xl font-bold text-pink-900">No Memories Yet</h2>
                        <p className="text-pink-700 mt-2">Start visiting the days to create moments.</p>
                        <button
                            onClick={() => router.push('/days')}
                            className="mt-6 px-8 py-3 bg-pink-500 text-white rounded-full font-bold shadow-lg hover:bg-pink-600 transition-all"
                        >
                            Start Journey
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {memories.map((memory) => (
                            <MemoryCard key={memory._id || Math.random().toString()} memory={memory} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {memories.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur p-4 border-t border-pink-100 z-30 flex justify-center">
                    <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Memories</p>
                        <p className="text-3xl font-playfair font-black text-pink-600">{memories.length}</p>
                    </div>
                </div>
            )}

        </div>
    );
}
