'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Check, X, Clock, TrendingUp, User, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SendInteraction from '@/components/interactions/SendInteraction';
import JSConfetti from 'js-confetti';
import { API_BASE_URL } from '@/config/env';

interface Interaction {
    _id: string;
    from: { username: string; alias: string; avatar?: string; mood?: string };
    to: { username: string; alias: string };
    type: string;
    message?: string;
    status: string;
    createdAt: string;
}

const interactionEmojis: Record<string, string> = {
    'hand-hold': '🤝',
    'head-pat': '🫶',
    'forehead-kiss': '💗',
    'hug': '🤗',
    'poke': '😄',
    'rose': '🌹',
    'chocolate': '🍫',
    'letter': '💌'
};

const interactionLabels: Record<string, string> = {
    'hand-hold': 'Virtual Hand Hold',
    'head-pat': 'Head Pat',
    'forehead-kiss': 'Forehead Kiss',
    'hug': 'Warm Hug',
    'poke': 'Playful Poke',
    'rose': 'Virtual Rose',
    'chocolate': 'Sweet Chocolate',
    'letter': 'Love Letter'
};

export default function InteractionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [pendingInteractions, setPendingInteractions] = useState<Interaction[]>([]);
    const [history, setHistory] = useState<Interaction[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSendModal, setShowSendModal] = useState(false);
    const [searchUsername, setSearchUsername] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchData();
        }
    }, [status, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, historyRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/interactions/pending`, {
                    headers: { 'x-user-email': session?.user?.email || '' }
                }),
                fetch(`${API_BASE_URL}/api/interactions/history`, {
                    headers: { 'x-user-email': session?.user?.email || '' }
                }),
                fetch(`${API_BASE_URL}/api/interactions/stats`, {
                    headers: { 'x-user-email': session?.user?.email || '' }
                })
            ]);

            if (pendingRes.ok) {
                const data = await pendingRes.json();
                setPendingInteractions(data.interactions || []);
            }

            if (historyRes.ok) {
                const data = await historyRes.json();
                setHistory(data.interactions || []);
            }

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch interactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (interactionId: string, response: 'accept' | 'decline') => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/interactions/${interactionId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': session?.user?.email || ''
                },
                body: JSON.stringify({ response })
            });

            if (res.ok) {
                if (response === 'accept') {
                    const confetti = new JSConfetti();
                    confetti.addConfetti({
                        emojis: ['💕', '🎉', '✨', '💖'],
                        emojiSize: 50,
                        confettiNumber: 40
                    });
                }
                fetchData();
            }
        } catch (err) {
            console.error('Failed to respond:', err);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-love-rose border-t-transparent rounded-full animate-spin" />
        </div>;
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
                    💕 Virtual Interactions
                </h1>
                <p className="text-lg text-love-charcoal/70 max-w-2xl mx-auto">
                    Send cute virtual interactions to friends, crushes, or your special someone!
                </p>
            </motion.div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4 text-center"
                    >
                        <Send className="w-6 h-6 text-love-rose mx-auto mb-2" />
                        <p className="text-2xl font-bold text-love-charcoal">{stats.sent}</p>
                        <p className="text-sm text-love-charcoal/60">Sent</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-4 text-center"
                    >
                        <Heart className="w-6 h-6 text-love-crimson mx-auto mb-2" />
                        <p className="text-2xl font-bold text-love-charcoal">{stats.received}</p>
                        <p className="text-sm text-love-charcoal/60">Received</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-4 text-center"
                    >
                        <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-love-charcoal">{stats.accepted}</p>
                        <p className="text-sm text-love-charcoal/60">Accepted</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-4 text-center"
                    >
                        <Clock className="w-6 h-6 text-love-gold mx-auto mb-2" />
                        <p className="text-2xl font-bold text-love-charcoal">Unlimited</p>
                        <p className="text-sm text-love-charcoal/60">Daily Limit</p>
                    </motion.div>
                </div>
            )}

            {/* Send Interaction */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Regular Interaction */}
                <div className="glass-card p-6">
                    <h3 className="font-bold text-lg text-love-charcoal mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-love-rose" />
                        Send an Interaction
                    </h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            placeholder="Enter username (e.g., john123)"
                            className="flex-1 px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50"
                        />
                        <div className="relative z-20">
                            <button
                                onClick={() => searchUsername && setShowSendModal(true)}
                                disabled={!searchUsername}
                                className="h-full px-6 bg-[#FF5090] text-white rounded-xl font-bold shadow-lg hover:bg-[#E02E6E] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 border-2 border-white/20"
                                style={{ backgroundColor: '#FF5090', color: 'white' }}
                            >
                                <Send className="w-5 h-5 fill-current" />
                                <span className="hidden md:inline text-white font-bold">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Digital Gift (New) */}
                <div className="glass-card p-6 border-2 border-love-gold/20 bg-gradient-to-br from-white/60 to-love-champagne/20">
                    <h3 className="font-bold text-lg text-love-charcoal mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎁</span>
                        Send Digital Gift
                    </h3>
                    <p className="text-sm text-love-charcoal/70 mb-4">
                        Send a gift via Email or Instagram DM!
                    </p>
                    <button
                        onClick={() => router.push('/interactions/gift')}
                        className="w-full py-3 bg-gradient-to-r from-love-gold to-yellow-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <Heart className="w-5 h-5 fill-current" />
                        Open Gift Shop
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border shadow-sm ${activeTab === 'pending'
                        ? 'bg-love-crimson text-white border-love-crimson shadow-love-crimson/20'
                        : 'bg-white/80 backdrop-blur text-love-charcoal border-love-rose/20 hover:bg-white hover:border-love-rose/50'
                        }`}
                >
                    Pending ({pendingInteractions.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border shadow-sm ${activeTab === 'history'
                        ? 'bg-love-crimson text-white border-love-crimson shadow-love-crimson/20'
                        : 'bg-white/80 backdrop-blur text-love-charcoal border-love-rose/20 hover:bg-white hover:border-love-rose/50'
                        }`}
                >
                    History ({history.length})
                </button>
            </div>

            {/* Pending Interactions */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {pendingInteractions.length === 0 ? (
                        <div className="text-center py-12 glass-card">
                            <Clock className="w-16 h-16 text-love-charcoal/30 mx-auto mb-4" />
                            <p className="text-love-charcoal/60">No pending interactions</p>
                        </div>
                    ) : (
                        pendingInteractions.map((interaction, index) => (
                            <motion.div
                                key={interaction._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-5xl">{interactionEmojis[interaction.type]}</span>
                                        <div className="flex-1">
                                            <p className="font-bold text-love-charcoal">
                                                {interaction.from.alias}
                                            </p>
                                            <p className="text-sm text-love-charcoal/60">
                                                sent you a {interactionLabels[interaction.type]}
                                            </p>
                                            {interaction.message && (
                                                <p className="mt-2 text-sm italic text-love-charcoal/70 p-3 bg-white/50 rounded-lg">
                                                    "{interaction.message}"
                                                </p>
                                            )}
                                            <p className="text-xs text-love-charcoal/50 mt-2">
                                                {new Date(interaction.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRespond(interaction._id, 'accept')}
                                            className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all flex items-center gap-2"
                                        >
                                            <Check className="w-5 h-5" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRespond(interaction._id, 'decline')}
                                            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2"
                                        >
                                            <X className="w-5 h-5" />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* History */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center py-12 glass-card">
                            <Heart className="w-16 h-16 text-love-charcoal/30 mx-auto mb-4" />
                            <p className="text-love-charcoal/60">No interaction history yet</p>
                        </div>
                    ) : (
                        history.map((interaction, index) => (
                            <motion.div
                                key={interaction._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-4 flex items-center gap-4"
                            >
                                <span className="text-3xl">{interactionEmojis[interaction.type]}</span>
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-bold">{interaction.from.alias}</span>
                                        {' → '}
                                        <span className="font-bold">{interaction.to.alias}</span>
                                    </p>
                                    <p className="text-xs text-love-charcoal/60">
                                        {interactionLabels[interaction.type]} •{' '}
                                        {new Date(interaction.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`
                                    px-3 py-1 rounded-full text-xs font-bold
                                    ${interaction.status === 'accepted' ? 'bg-green-100 text-green-700' : ''}
                                    ${interaction.status === 'declined' ? 'bg-red-100 text-red-700' : ''}
                                    ${interaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                                `}>
                                    {interaction.status}
                                </span>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Send Modal */}
            <AnimatePresence>
                {showSendModal && (
                    <SendInteraction
                        toUsername={searchUsername}
                        toAlias={searchUsername}
                        onClose={() => setShowSendModal(false)}
                        onSuccess={() => {
                            fetchData();
                            setSearchUsername('');
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
