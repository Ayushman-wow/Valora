'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Phone, Clock, User, Search, PhoneCall, History } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';

interface CallSession {
    _id: string;
    participants: Array<{ _id: string; username: string; alias: string; avatar?: string }>;
    initiator: { username: string; alias: string };
    roomUrl: string;
    roomName: string;
    status: string;
    duration: number;
    callType: string;
    createdAt: string;
}

export default function CallsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [callHistory, setCallHistory] = useState<CallSession[]>([]);
    const [activeCalls, setActiveCalls] = useState<CallSession[]>([]);
    const [searchUsername, setSearchUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchCalls();
        }
    }, [status, router]);

    const fetchCalls = async () => {
        setLoading(true);
        try {
            const [historyRes, activeRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/calls/history/all`, {
                    headers: { 'x-user-email': session?.user?.email || '' }
                }),
                fetch(`${API_BASE_URL}/api/calls/active/all`, {
                    headers: { 'x-user-email': session?.user?.email || '' }
                })
            ]);

            if (historyRes.ok) {
                const data = await historyRes.json();
                setCallHistory(data.callSessions || []);
            }

            if (activeRes.ok) {
                const data = await activeRes.json();
                setActiveCalls(data.activeCalls || []);
            }
        } catch (err) {
            console.error('Failed to fetch calls:', err);
        } finally {
            setLoading(false);
        }
    };

    const createCall = async () => {
        if (!searchUsername) return;

        setCreating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/calls/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': session?.user?.email || ''
                },
                body: JSON.stringify({
                    participantUsername: searchUsername,
                    callType: 'video'
                })
            });

            const data = await response.json();

            if (response.ok) {
                router.push(data.roomUrl);
            } else {
                alert(data.msg || 'Failed to create call');
            }
        } catch (err) {
            alert('Network error. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-love-rose border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-playfair font-bold text-love-charcoal mb-4">
                    📞 Video Calls
                </h1>
                <p className="text-lg text-love-charcoal/70 max-w-2xl mx-auto">
                    Connect face-to-face with friends, crushes, or your special someone!
                </p>
            </motion.div>

            {/* Start New Call */}
            <section className="glass-card p-8 mb-8">
                <h3 className="font-bold text-lg text-love-charcoal mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-love-rose" />
                    Start a Video Call
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        placeholder="Enter username (e.g., john123)"
                        className="flex-1 px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50"
                        onKeyPress={(e) => e.key === 'Enter' && createCall()}
                    />
                    <div className="relative z-20">
                        <button
                            onClick={createCall}
                            disabled={!searchUsername || creating}
                            className="px-8 py-3 bg-[#FF5090] text-white rounded-xl font-bold shadow-lg hover:bg-[#E02E6E] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 border-2 border-white/20"
                            style={{ backgroundColor: '#FF5090', color: 'white' }}
                        >
                            {creating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <PhoneCall className="w-5 h-5 fill-current" />
                                    <span className="text-white font-bold">Start Call</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <p className="mt-3 text-xs text-love-charcoal/60">
                    💡 You'll be taken to a video call room where you can connect instantly!
                </p>
            </section>

            {/* Active Calls */}
            {activeCalls.length > 0 && (
                <section className="mb-8">
                    <h3 className="font-bold text-lg text-love-charcoal mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        Active Calls ({activeCalls.length})
                    </h3>
                    <div className="space-y-3">
                        {activeCalls.map((call) => {
                            const otherParticipant = call.participants.find(p => p.username !== session?.user?.name);
                            return (
                                <motion.div
                                    key={call._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass-card p-5 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-green-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-love-charcoal">{otherParticipant?.alias}</p>
                                            <p className="text-sm text-love-charcoal/60">
                                                {call.status === 'active' ? '🔴 Call in progress' : '⏳ Connecting...'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.push(call.roomUrl)}
                                        className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all"
                                    >
                                        Join Call
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'new'
                        ? 'bg-love-crimson text-white shadow-lg'
                        : 'bg-white text-love-charcoal hover:bg-love-blush'
                        }`}
                >
                    <Video className="w-5 h-5" />
                    Quick Call
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'history'
                        ? 'bg-love-crimson text-white shadow-lg'
                        : 'bg-white text-love-charcoal hover:bg-love-blush'
                        }`}
                >
                    <History className="w-5 h-5" />
                    Call History ({callHistory.length})
                </button>
            </div>

            {/* Call History */}
            {activeTab === 'history' && (
                <div className="space-y-3">
                    {callHistory.length === 0 ? (
                        <div className="text-center py-12 glass-card">
                            <Clock className="w-16 h-16 text-love-charcoal/30 mx-auto mb-4" />
                            <p className="text-love-charcoal/60">No call history yet</p>
                            <p className="text-sm text-love-charcoal/50 mt-2">Start your first call to see it here!</p>
                        </div>
                    ) : (
                        callHistory.map((call, index) => {
                            const otherParticipant = call.participants.find(p => p.username !== session?.user?.name);
                            const wasInitiator = call.initiator.username === session?.user?.name;

                            return (
                                <motion.div
                                    key={call._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card p-5 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-love-rose/20 rounded-full flex items-center justify-center">
                                            <Video className="w-6 h-6 text-love-rose" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-love-charcoal">{otherParticipant?.alias}</p>
                                            <p className="text-sm text-love-charcoal/60">
                                                {wasInitiator ? 'Outgoing' : 'Incoming'} • {call.callType === 'video' ? '📹 Video' : '🎙️ Audio'}
                                            </p>
                                            <p className="text-xs text-love-charcoal/50">
                                                {new Date(call.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {call.duration > 0 && (
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-love-charcoal">
                                                    {formatDuration(call.duration)}
                                                </p>
                                                <p className="text-xs text-love-charcoal/50">Duration</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Info Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 text-center">
                    <Video className="w-10 h-10 text-love-rose mx-auto mb-3" />
                    <h4 className="font-bold text-love-charcoal mb-2">HD Video Quality</h4>
                    <p className="text-sm text-love-charcoal/70">Crystal clear video calls with anyone</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <Phone className="w-10 h-10 text-love-crimson mx-auto mb-3" />
                    <h4 className="font-bold text-love-charcoal mb-2">Instant Connection</h4>
                    <p className="text-sm text-love-charcoal/70">No downloads, call right from browser</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <User className="w-10 h-10 text-love-gold mx-auto mb-3" />
                    <h4 className="font-bold text-love-charcoal mb-2">Private & Secure</h4>
                    <p className="text-sm text-love-charcoal/70">Your calls are private and encrypted</p>
                </div>
            </div>
        </div>
    );
}
