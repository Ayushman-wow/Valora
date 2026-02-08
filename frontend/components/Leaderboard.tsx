'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Flame } from 'lucide-react';

import { API_BASE_URL } from '@/config/env';

interface ScoreEntry {
    _id: string;
    username: string;
    score: number;
    gameType: string;
}

export default function Leaderboard({ gameType }: { gameType: string }) {
    const [scores, setScores] = useState<ScoreEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/leaderboard/${gameType}`);
                if (res.ok) {
                    const data = await res.json();
                    setScores(data);
                }
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();

        // Polling or Socket logic could go here
    }, [gameType]);

    if (loading) return <div className="p-8 text-center animate-pulse text-love-rose">Loading Hall of Fame...</div>;

    return (
        <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-glass overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-love-crimson to-love-rose flex items-center justify-between">
                <h3 className="text-xl font-playfair font-black text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6" /> Hall of Fame
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Top 10 Lovers</span>
            </div>

            <div className="p-4 space-y-2">
                {scores.length === 0 ? (
                    <div className="p-8 text-center text-love-charcoal/40 italic">
                        Be the first to claim the throne!
                    </div>
                ) : (
                    scores.map((entry, idx) => (
                        <motion.div
                            key={entry._id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${idx === 0
                                ? 'bg-love-gold/10 border-love-gold shadow-sm'
                                : 'bg-white/50 border-transparent hover:border-love-rose/20'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    {idx === 0 ? <Medal className="w-6 h-6 text-love-gold fill-love-gold" /> :
                                        idx === 1 ? <Medal className="w-6 h-6 text-slate-400 fill-slate-400" /> :
                                            idx === 2 ? <Medal className="w-6 h-6 text-amber-600 fill-amber-600" /> :
                                                <span className="text-sm font-bold text-love-charcoal/30">#{idx + 1}</span>}
                                </div>
                                <span className={`font-bold ${idx === 0 ? 'text-love-charcoal' : 'text-love-charcoal/70'}`}>
                                    {entry.username}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-black ${idx === 0 ? 'text-love-rose' : 'text-love-charcoal'}`}>
                                    {entry.score.toLocaleString()}
                                </span>
                                {idx === 0 && <Flame className="w-4 h-4 text-orange-500 animate-bounce" />}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
