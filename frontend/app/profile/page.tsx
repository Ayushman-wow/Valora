'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, Heart, Link as LinkIcon, Save, LogOut, Sparkles, Copy, Check, Calendar, Trash2, Database, AlertTriangle } from 'lucide-react';
import JSConfetti from 'js-confetti';

import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [alias, setAlias] = useState('');
    const [username, setUsername] = useState('');
    const [mood, setMood] = useState('Romantic');
    const [partnerUsername, setPartnerUsername] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/me`, {
                headers: { 'x-user-email': session?.user?.email || '' }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setAlias(data.alias || '');
                setUsername(data.username || '');
                setMood(data.mood || 'Romantic');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': session?.user?.email || ''
                },
                body: JSON.stringify({ alias, mood, username })
            });
            const data = await res.json();

            if (res.ok) {
                setProfile(data);
                setUsername(data.username); // Update in case backend sanitized it
                alert('Profile updated! ✨');
            } else {
                alert(data.msg || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const copyUsername = () => {
        navigator.clipboard.writeText(username);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const linkPartner = async () => {
        if (!partnerUsername) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/link-partner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': session?.user?.email || ''
                },
                body: JSON.stringify({ partnerUsername })
            });
            const data = await res.json();
            if (res.ok) {
                fetchProfile();
                const jsConfetti = new JSConfetti();
                jsConfetti.addConfetti({ emojis: ['💑', '🔗', '❤️'] });
                setPartnerUsername('');
            } else {
                alert(data.msg);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const unlinkPartner = async () => {
        if (!confirm('Are you sure you want to break the link? 💔')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/unlink-partner`, {
                method: 'POST',
                headers: {
                    'x-user-email': session?.user?.email || ''
                }
            });
            if (res.ok) {
                fetchProfile();
                alert('Unlinked.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (status === 'loading' || loading) return <div className="p-10 text-center">Loading Profile...</div>;
    if (!session) return <div className="p-10 text-center">Please log in first.</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-playfair font-bold text-love-charcoal mb-8 flex items-center gap-3">
                <User className="w-8 h-8 text-love-crimson" /> My Profile
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Settings */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8"
                >
                    <h2 className="text-xl font-bold mb-6 text-love-crimson">Personal Details</h2>
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-love-charcoal mb-2">Display Name (Alias)</label>
                            <input
                                type="text"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-love-charcoal mb-2">Username (Unique ID)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={copyUsername}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-love-charcoal/50 hover:text-love-crimson transition-colors"
                                    title="Copy Username"
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-love-charcoal/50 mt-1">Share this with your partner to link accounts.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-love-charcoal mb-2">Current Mood</label>
                            <div className="flex flex-wrap gap-2">
                                {['Romantic', 'Playful', 'Sad', 'Excited', 'Cozy'].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMood(m)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${mood === m
                                            ? 'bg-love-rose border-love-rose text-white shadow-lg scale-105'
                                            : 'bg-white border-love-blush text-love-charcoal hover:border-love-rose hover:bg-love-blush'
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-20">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-[#FF2171] text-white rounded-xl font-bold hover:bg-[#9D174D] transition-all flex items-center justify-center gap-2 border-2 border-white/20 shadow-lg"
                                style={{ backgroundColor: '#FF2171', color: 'white' }}
                            >
                                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> <span className="text-white font-bold">Save Changes</span></>}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Couple Mode */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 border-2 border-love-rose/20 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Heart className="w-32 h-32 text-love-crimson" />
                    </div>

                    <h2 className="text-xl font-bold mb-6 text-love-crimson flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Couple Mode
                    </h2>

                    {profile?.partnerId ? (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-love-champagne rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <Heart className="w-10 h-10 text-love-crimson animate-pulse" fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-love-charcoal">Linked with</h3>
                                <p className="text-xl text-love-rose font-playfair">{profile.partnerId.alias}</p>
                                <p className="text-sm font-mono text-love-charcoal/60">@{profile.partnerId.username}</p>
                            </div>
                            <div className="p-4 bg-white/40 rounded-xl text-sm italic text-love-charcoal/80">
                                "Love is composed of a single soul inhabiting two bodies."
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => router.push('/couple')}
                                    className="px-6 py-2 bg-gradient-to-r from-[#FF5090] to-[#E02E6E] text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 border-2 border-white/20"
                                >
                                    <Sparkles className="w-4 h-4" /> Our Shared Space
                                </button>
                                <button
                                    onClick={() => router.push('/timeline')}
                                    className="px-6 py-2 bg-white text-love-crimson border-2 border-love-blush rounded-full text-sm font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" /> Timeline
                                </button>
                                <button
                                    onClick={unlinkPartner}
                                    className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-full text-sm font-bold border border-red-200"
                                >
                                    Unlink
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-love-charcoal/80">
                                Link with your partner to unlock special features like private messaging, mutual proposals, and shared memories.
                            </p>

                            <div>
                                <label className="block text-sm font-bold text-love-charcoal mb-2">Partner's Username</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={partnerUsername}
                                        onChange={(e) => setPartnerUsername(e.target.value)}
                                        placeholder="partner_username"
                                        className="flex-1 px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50"
                                    />
                                    <button
                                        onClick={linkPartner}
                                        className="px-6 py-3 bg-[#FF5090] text-white rounded-xl hover:bg-[#E02E6E] transition-colors font-bold flex items-center gap-2 whitespace-nowrap shadow-md border-2 border-white/20"
                                        style={{ backgroundColor: '#FF5090', color: 'white' }}
                                    >
                                        <LinkIcon className="w-4 h-4" /> Link
                                    </button>
                                </div>
                                <p className="text-xs text-love-charcoal/50 mt-2">
                                    Ask your partner for their unique username!
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Database Maintenance Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12 glass-card p-8 border-2 border-red-100"
            >
                <h2 className="text-xl font-bold mb-6 text-red-600 flex items-center gap-2">
                    <Database className="w-6 h-6" /> Database & Storage Management
                </h2>
                <p className="text-sm text-love-charcoal/70 mb-6 flex items-start gap-2 bg-red-50 p-4 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    Our database has a 512MB limit. To keep the app running smoothly, please occasionally clear old history or messages that are no longer needed.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Clear Messages */}
                    <button
                        onClick={async () => {
                            if (!confirm('This will wipe the ENTIRE Love Wall for everyone. Are you sure?')) return;
                            const res = await fetch(`${API_BASE_URL}/api/messages/clear-all`, { method: 'DELETE' });
                            if (res.ok) alert('Love Wall swept clean! 🧹');
                        }}
                        className="p-4 rounded-2xl border-2 border-love-blush hover:border-love-crimson hover:bg-love-blush/20 transition-all text-left"
                    >
                        <Trash2 className="w-6 h-6 text-love-crimson mb-2" />
                        <h3 className="font-bold text-sm text-love-charcoal">Sweep Love Wall</h3>
                        <p className="text-xs text-love-charcoal/50">Wipe all confessions</p>
                    </button>

                    {/* Clear Games */}
                    <button
                        onClick={async () => {
                            if (!confirm('Clear all completed game sessions?')) return;
                            const res = await fetch(`${API_BASE_URL}/api/games/clear-completed`, { method: 'DELETE' });
                            if (res.ok) alert('Game history optimized!');
                        }}
                        className="p-4 rounded-2xl border-2 border-love-blush hover:border-love-crimson hover:bg-love-blush/20 transition-all text-left"
                    >
                        <Sparkles className="w-6 h-6 text-love-crimson mb-2" />
                        <h3 className="font-bold text-sm text-love-charcoal">Optimize Games</h3>
                        <p className="text-xs text-love-charcoal/50">Delete finished games</p>
                    </button>

                    {/* Clear Interactions */}
                    <button
                        onClick={async () => {
                            if (!confirm('Clear your personal interaction history?')) return;
                            const res = await fetch(`${API_BASE_URL}/api/interactions/clear-history`, {
                                method: 'DELETE',
                                headers: { 'x-user-email': session?.user?.email || '' }
                            });
                            if (res.ok) alert('Interactions history cleared!');
                        }}
                        className="p-4 rounded-2xl border-2 border-love-blush hover:border-love-crimson hover:bg-love-blush/20 transition-all text-left"
                    >
                        <Heart className="w-6 h-6 text-love-crimson mb-2" />
                        <h3 className="font-bold text-sm text-love-charcoal">Clear Interactions</h3>
                        <p className="text-xs text-love-charcoal/50">Wipe your hug/poke logs</p>
                    </button>

                    {/* Clear Call History */}
                    <button
                        onClick={async () => {
                            if (!confirm('Clear your call logs?')) return;
                            const res = await fetch(`${API_BASE_URL}/api/calls/history/clear`, {
                                method: 'DELETE',
                                headers: { 'x-user-email': session?.user?.email || '' }
                            });
                            if (res.ok) alert('Call history cleared!');
                        }}
                        className="p-4 rounded-2xl border-2 border-love-blush hover:border-love-crimson hover:bg-love-blush/20 transition-all text-left"
                    >
                        <Database className="w-6 h-6 text-love-crimson mb-2" />
                        <h3 className="font-bold text-sm text-love-charcoal">Wipe Call Logs</h3>
                        <p className="text-xs text-love-charcoal/50">Remove call history</p>
                    </button>

                    {/* Clear Rooms */}
                    <button
                        onClick={async () => {
                            if (!confirm('Cleanup expired chat rooms and their messages?')) return;
                            const res = await fetch(`${API_BASE_URL}/api/rooms/maintenance/cleanup`, { method: 'DELETE' });
                            if (res.ok) {
                                const data = await res.json();
                                alert(`Cleanup done! Deleted ${data.messagesDeleted} messages.`);
                            }
                        }}
                        className="p-4 rounded-2xl border-2 border-love-blush hover:border-love-crimson hover:bg-love-blush/20 transition-all text-left"
                    >
                        <Trash2 className="w-6 h-6 text-love-crimson mb-2" />
                        <h3 className="font-bold text-sm text-love-charcoal">Sweep Chat Rooms</h3>
                        <p className="text-xs text-love-charcoal/50">Clear old room data</p>
                    </button>

                    {/* Clear Activities */}
                    <button
                        onClick={async () => {
                            if (!confirm('Clear your daily ritual actions (Rose Day, etc.)?')) return;
                            const res = await fetch(`${API_BASE_URL}/api/interactions/activity`, {
                                method: 'DELETE',
                                headers: { 'x-user-email': session?.user?.email || '' }
                            });
                            if (res.ok) alert('Daily actions cleared!');
                        }}
                        className="p-4 rounded-2xl border-2 border-love-blush hover:border-love-crimson hover:bg-love-blush/20 transition-all text-left"
                    >
                        <Sparkles className="w-6 h-6 text-love-crimson mb-2" />
                        <h3 className="font-bold text-sm text-love-charcoal">Clear My Actions</h3>
                        <p className="text-xs text-love-charcoal/50">Wipe ritual logs</p>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

