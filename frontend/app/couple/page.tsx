'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Clock, Sparkles, Trophy, Users, Save, Copy, Check, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '@/config/env';

export default function CoupleDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [couple, setCouple] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [anniversary, setAnniversary] = useState('');
    const [copied, setCopied] = useState(false);
    const [isPartnerOnline, setIsPartnerOnline] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (session?.user?.email) {
            fetchCouple();

            const socket = io(SOCKET_URL);
            socketRef.current = socket;

            socket.emit('social_presence', {
                username: session.user.name,
                email: session.user.email,
                activity: 'In Shared Space',
                path: '/couple'
            });

            socket.on('social_update', ({ activeUsers }: { activeUsers: any[] }) => {
                const partner = couple?.members?.find((m: any) => m.username !== session?.user?.name);
                if (partner) {
                    const online = activeUsers.some(u => u.username === partner.username);
                    setIsPartnerOnline(online);
                }
            });

            socket.on('partner_event', ({ action, data }) => {
                if (action === 'anniversary_updated') {
                    setAnniversary(data.date);
                    // Proactively refresh couple state if needed
                    fetchCouple();
                }
            });

            return () => { socket.disconnect(); };
        }
    }, [session, couple?.members]);

    const fetchCouple = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/couples/me`, {
                headers: { 'x-user-email': session?.user?.email || '' }
            });
            if (res.ok) {
                const data = await res.json();
                setCouple(data);
                if (data.anniversary) {
                    setAnniversary(new Date(data.anniversary).toISOString().split('T')[0]);
                }
            } else {
                router.push('/profile');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateAnniversary = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/couples/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': session?.user?.email || ''
                },
                body: JSON.stringify({ anniversary })
            });
            if (res.ok) {
                // Notify partner in real-time
                const partner = couple?.members?.find((m: any) => m.username !== session?.user?.name);
                if (partner && socketRef.current) {
                    socketRef.current.emit('couple_sync', {
                        partnerEmail: partner.email, // We need to ensure email is populated in fetch
                        action: 'anniversary_updated',
                        data: { date: anniversary }
                    });
                }
                alert('Anniversary updated! ❤️');
                fetchCouple();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(couple.coupleCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDaysTogether = () => {
        if (!anniversary) return null;
        const start = new Date(anniversary);
        const today = new Date();
        const diff = today.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    if (loading) return <div className="p-20 text-center text-love-rose animate-pulse">Loading Our Space...</div>;
    if (!couple) return null;

    const partner = couple.members.find((m: any) => m.username !== session?.user?.name);

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="flex justify-center items-center gap-6 mb-4">
                    <div className="text-right">
                        <p className="font-playfair text-3xl font-black text-love-charcoal">{session?.user?.name}</p>
                        <p className="text-love-rose font-bold text-sm">YOU</p>
                    </div>
                    <div className="relative">
                        <Heart className="w-16 h-16 text-love-rose animate-pulse fill-love-rose" />
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-love-gold animate-bounce" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <p className="font-playfair text-3xl font-black text-love-charcoal">{partner?.alias || partner?.username}</p>
                            {isPartnerOnline && (
                                <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse ring-4 ring-green-500/20" />
                            )}
                        </div>
                        <p className="text-love-rose font-bold text-sm">
                            {isPartnerOnline ? 'ONLINE NOW' : 'PARTNER'}
                        </p>
                    </div>
                </div>
                <h1 className="text-5xl font-playfair font-black text-transparent bg-clip-text bg-gradient-to-r from-love-crimson to-love-rose">
                    Our Shared Space
                </h1>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Anniversary & Countdown */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 bg-white/60 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calendar className="w-24 h-24 text-love-crimson" />
                    </div>
                    <h2 className="text-2xl font-bold text-love-crimson mb-8 flex items-center gap-2">
                        <Clock className="w-6 h-6" /> Our Timeline
                    </h2>

                    <div className="space-y-8 relative z-10">
                        <div className="text-center py-6 bg-love-crimson/5 rounded-3xl border-2 border-love-crimson/10 shadow-inner">
                            {anniversary ? (
                                <>
                                    <p className="text-sm font-black uppercase tracking-widest text-love-crimson/60 mb-2">Days Together</p>
                                    <p className="text-7xl font-black text-love-crimson">{getDaysTogether()}</p>
                                </>
                            ) : (
                                <p className="text-love-charcoal/40 font-bold italic p-4">When did your story begin?</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-black text-love-charcoal/40 uppercase tracking-widest ml-1">Anniversary Date</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={anniversary}
                                    onChange={(e) => setAnniversary(e.target.value)}
                                    className="flex-1 bg-white/80 border-2 border-love-blush focus:border-love-rose px-4 py-3 rounded-2xl outline-none font-bold text-love-charcoal transition-all"
                                />
                                <button
                                    onClick={updateAnniversary}
                                    className="p-4 bg-love-crimson text-white rounded-2xl hover:bg-love-dusk transition-all shadow-lg active:scale-90"
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Couple Quests/Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-8 bg-love-crimson/5 border-love-crimson/20"
                >
                    <h2 className="text-2xl font-bold text-love-crimson mb-8 flex items-center gap-2">
                        <Trophy className="w-6 h-6" /> Current Quests
                    </h2>
                    <div className="space-y-4">
                        <QuestItem title="Visit Rose Garden together" progress={80} emoji="🌹" />
                        <QuestItem title="Post 5 confessions on Love Wall" progress={40} emoji="💌" />
                        <QuestItem title="Complete the 'Couple Sync' quiz" progress={0} emoji="🧠" />
                    </div>
                </motion.div>

                {/* Identity & Misc */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-8"
                >
                    <div className="glass-card p-8 bg-white/80 border-love-gold/20">
                        <h2 className="text-xl font-bold text-love-charcoal mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-love-gold" /> Our Secret Code
                        </h2>
                        <div className="flex items-center justify-between p-4 bg-love-gold/5 rounded-2xl border-2 border-dashed border-love-gold/40">
                            <span className="font-mono text-xl font-black text-love-charcoal tracking-widest">{couple.coupleCode}</span>
                            <button onClick={copyCode} className="text-love-gold hover:scale-110 transition-transform">
                                {copied ? <Check /> : <Copy />}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-8 bg-white shadow-xl hover:shadow-2xl transition-all cursor-pointer group" onClick={() => router.push('/timeline')}>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-black text-love-charcoal group-hover:text-love-crimson transition-colors">Shared Memories</h3>
                                <p className="text-xs text-love-charcoal/50">Relive your highlights</p>
                            </div>
                            <div className="p-3 bg-love-blush rounded-xl group-hover:rotate-12 transition-transform">
                                <Users className="w-6 h-6 text-love-crimson" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function QuestItem({ title, progress, emoji }: { title: string, progress: number, emoji: string }) {
    return (
        <div className="p-4 bg-white/80 rounded-2xl border border-white shadow-sm space-y-3">
            <div className="flex justify-between items-start">
                <p className="font-bold text-love-charcoal text-sm pr-4 leading-tight">{title}</p>
                <span className="text-xl">{emoji}</span>
            </div>
            <div className="h-2 bg-love-charcoal/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-love-rose to-love-crimson"
                />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-love-charcoal/30">{progress}% Completed</p>
        </div>
    );
}
