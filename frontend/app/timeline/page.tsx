'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Heart, Plus, Trash2, Camera, Star, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';

interface TimelineEvent {
    _id: string;
    title: string;
    description: string;
    date: string;
    type: 'milestone' | 'date' | 'memory' | 'future';
    createdBy: string;
}

export default function TimelinePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // New Event State
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'memory'
    });

    useEffect(() => {
        if (status === 'authenticated') {
            fetchTimeline();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status]);

    const fetchTimeline = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/timeline`, {
                headers: { 'x-user-email': session?.user?.email || '' }
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.date) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/timeline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': session?.user?.email || ''
                },
                body: JSON.stringify(newEvent)
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewEvent({ title: '', description: '', date: new Date().toISOString().split('T')[0], type: 'memory' });
                fetchTimeline();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Remove this memory?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/timeline/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-email': session?.user?.email || '' }
            });

            if (res.ok) {
                fetchTimeline();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'milestone': return <Star className="w-5 h-5 text-yellow-500" />;
            case 'date': return <Heart className="w-5 h-5 text-love-crimson" />;
            case 'future': return <Calendar className="w-5 h-5 text-blue-500" />;
            default: return <Camera className="w-5 h-5 text-purple-500" />;
        }
    };

    if (loading) return <div className="p-12 text-center">Loading your story...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-love-charcoal/60 hover:text-love-charcoal transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <div className="text-center mb-12">
                <h1 className="text-4xl font-playfair font-bold text-love-charcoal mb-4">
                    Our Love Story 📖
                </h1>
                <p className="text-love-charcoal/70">
                    A timeline of our special moments, dates, and dreams.
                </p>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-love-rose/30 -translate-x-1/2" />

                <div className="space-y-8">
                    {/* Add Button */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative z-10 flex justify-center mb-8"
                    >
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-love-rose text-love-charcoal rounded-full shadow-lg hover:bg-love-rose hover:text-white transition-all font-bold"
                        >
                            <Plus className="w-5 h-5" /> Add Memory
                        </button>
                    </motion.div>

                    {events.length === 0 ? (
                        <div className="text-center py-12 glass-card relative z-10">
                            <p className="text-love-charcoal/60">No memories yet. Start writing your story!</p>
                        </div>
                    ) : (
                        events.map((event, index) => (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                    }`}
                            >
                                {/* Date Bubble */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-4 border-love-rose rounded-full z-10" />

                                {/* Content */}
                                <div className="w-full md:w-[calc(50%-2rem)] ml-12 md:ml-0">
                                    <div className="glass-card p-6 relative group hover:shadow-xl transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(event.type)}
                                                <span className="text-xs font-bold uppercase tracking-wider text-love-charcoal/50">
                                                    {event.type}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEvent(event._id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-love-charcoal mb-2">{event.title}</h3>
                                        <p className="text-love-charcoal/70 mb-3 whitespace-pre-line">{event.description}</p>

                                        <div className="text-right">
                                            <span className="text-sm font-medium text-love-rose bg-love-rose/10 px-3 py-1 rounded-full">
                                                {new Date(event.date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Spacer for alternate side */}
                                <div className="hidden md:block w-[calc(50%-2rem)]" />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-love-charcoal">Add New Memory</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-love-charcoal mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-love-rose"
                                        placeholder="First Date, Anniversary..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-love-charcoal mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-love-rose"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-love-charcoal mb-1">Type</label>
                                    <div className="flex gap-2">
                                        {['memory', 'milestone', 'date', 'future'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setNewEvent({ ...newEvent, type: t as any })}
                                                className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${newEvent.type === t
                                                    ? 'bg-love-rose text-white border-love-rose'
                                                    : 'bg-white text-gray-500 border-gray-200'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-love-charcoal mb-1">Description</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-love-rose h-24 resize-none"
                                        placeholder="What happened? Write a note..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddEvent}
                                        disabled={!newEvent.title}
                                        className="flex-1 py-3 bg-love-crimson text-white font-bold rounded-xl hover:bg-love-rose"
                                    >
                                        Save Memory
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
