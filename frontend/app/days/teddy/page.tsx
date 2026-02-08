'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, Check, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as MemoryStorage from '@/lib/memoryStorage';

interface Teddy {
    id: string;
    config: { body: string; bow: string; accessory: string };
    name: string;
    recipient: string;
    timestamp: number;
}

const BODY_COLORS = ['#8D6E63', '#D7CCC8', '#FFCDD2', '#BBDEFB', '#FFF9C4'];
const BOW_COLORS = ['#E91E63', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'];
const ACCESSORIES = ['heart', 'flower', 'star', 'none'];

export default function TeddyDayPage() {
    const router = useRouter();
    const [teddies, setTeddies] = useState<Teddy[]>([]);
    const [creating, setCreating] = useState(false);

    // Config State
    const [bodyColor, setBodyColor] = useState(BODY_COLORS[0]);
    const [bowColor, setBowColor] = useState(BOW_COLORS[0]);
    const [accessory, setAccessory] = useState('heart');
    const [teddyName, setTeddyName] = useState('');
    const [recipient, setRecipient] = useState('');

    const { data: session } = useSession();
    const getUserEmail = () => session?.user?.email || localStorage.getItem('heartsync_username') ? `${localStorage.getItem('heartsync_username')!.replace(/\s+/g, '')}@guest.com` : '';

    useEffect(() => {
        const loadMemories = async () => {
            const email = getUserEmail();
            if (email) {
                const memories = await MemoryStorage.getMemoriesByDay('teddy', email);
                setTeddies(memories.map(m => m.content as Teddy));
            }
        };
        loadMemories();
    }, [session]);

    const saveTeddy = async () => {
        if (!recipient.trim() || !teddyName.trim()) return;

        const newTeddy: Teddy = {
            id: Date.now().toString(),
            config: { body: bodyColor, bow: bowColor, accessory },
            name: teddyName,
            recipient,
            timestamp: Date.now()
        };

        const email = getUserEmail();
        if (email) {
            await MemoryStorage.saveMemory('teddy', 'given', newTeddy, recipient, email);
            setTeddies([...teddies, newTeddy]);
        }
        setCreating(false);
        setTeddyName('');
        setRecipient('');
    };

    // Simple SVG Teddy Component
    const TeddyBear = ({ body, bow, acc, scale = 1 }: { body: string, bow: string, acc: string, scale?: number }) => (
        <svg width={200 * scale} height={200 * scale} viewBox="0 0 200 200" className="drop-shadow-lg transition-all duration-300">
            {/* Ears */}
            <circle cx="50" cy="50" r="25" fill={body} />
            <circle cx="150" cy="50" r="25" fill={body} />
            <circle cx="50" cy="50" r="15" fill="rgba(0,0,0,0.1)" />
            <circle cx="150" cy="50" r="15" fill="rgba(0,0,0,0.1)" />

            {/* Head */}
            <circle cx="100" cy="80" r="60" fill={body} />

            {/* Body */}
            <ellipse cx="100" cy="150" rx="50" ry="45" fill={body} />

            {/* Eyes */}
            <circle cx="80" cy="70" r="5" fill="#333" />
            <circle cx="120" cy="70" r="5" fill="#333" />

            {/* Nose/Mouth Area */}
            <ellipse cx="100" cy="90" rx="15" ry="12" fill="#fff" opacity="0.6" />
            <circle cx="100" cy="88" r="4" fill="#333" />
            <path d="M100 92 L100 98 M95 98 Q100 102 105 98" stroke="#333" strokeWidth="2" fill="none" />

            {/* Arms */}
            <ellipse cx="45" cy="130" rx="15" ry="35" fill={body} transform="rotate(20 45 130)" />
            <ellipse cx="155" cy="130" rx="15" ry="35" fill={body} transform="rotate(-20 155 130)" />

            {/* Feet */}
            <circle cx="70" cy="180" r="18" fill={body} />
            <circle cx="70" cy="180" r="12" fill="rgba(255,255,255,0.4)" />
            <circle cx="130" cy="180" r="18" fill={body} />
            <circle cx="130" cy="180" r="12" fill="rgba(255,255,255,0.4)" />

            {/* Bow Tie */}
            <path d="M100 120 L80 110 L80 130 Z M100 120 L120 110 L120 130 Z" fill={bow} />
            <circle cx="100" cy="120" r="5" fill={bow} stroke="rgba(0,0,0,0.1)" />

            {/* Accessory */}
            {acc === 'heart' && <path d="M130 130 C130 120 120 120 120 130 C120 140 130 150 130 150 C130 150 140 140 140 130 C140 120 130 120 130 130" fill="#E91E63" transform="translate(10, 0)" />}
            {acc === 'star' && <path d="M135 125 L138 135 L148 135 L140 140 L143 150 L135 145 L127 150 L130 140 L122 135 L132 135 Z" fill="#FFC107" transform="translate(10, 0)" />}
            {acc === 'flower' && (
                <g transform="translate(135, 135) scale(0.5)">
                    <circle r="10" fill="#FFEB3B" />
                    <circle r="15" fill="none" stroke="#4CAF50" strokeWidth="3" strokeDasharray="5,5" />
                </g>
            )}
        </svg>
    );

    return (
        <div className="min-h-screen bg-pink-50 font-outfit relative overflow-hidden flex flex-col items-center">

            {/* Header */}
            <header className="p-6 w-full flex items-center justify-between z-20">
                <button onClick={() => router.push('/days')} className="p-3 bg-white hover:bg-pink-100 rounded-full shadow-sm text-pink-900 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-playfair font-bold text-pink-900 tracking-wide">Teddy Workshop 🧸</h1>
                <div className="w-10" />
            </header>

            {/* Content Area */}
            <div className="flex-1 w-full max-w-4xl p-6 relative z-10 flex flex-col items-center">

                {!creating ? (
                    <>
                        {teddies.length === 0 ? (
                            <div className="text-center mt-20 opacity-60">
                                <span className="text-6xl block mb-4">🧸</span>
                                <h2 className="text-xl font-bold text-pink-800">No teddies made yet.</h2>
                                <p className="text-sm text-pink-700">Design a custom teddy for someone.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
                                {teddies.map(teddy => (
                                    <motion.div
                                        key={teddy.id}
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="bg-white/60 backdrop-blur rounded-2xl p-4 flex flex-col items-center shadow-lg border-2 border-pink-100"
                                    >
                                        <TeddyBear
                                            body={teddy.config.body}
                                            bow={teddy.config.bow}
                                            acc={teddy.config.accessory}
                                            scale={0.8}
                                        />
                                        <div className="text-center mt-2">
                                            <p className="font-playfair font-bold text-lg text-pink-900">{teddy.name}</p>
                                            <p className="text-xs text-pink-600 uppercase tracking-widest font-bold">For {teddy.recipient}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="fixed bottom-8 left-0 w-full flex justify-center z-30">
                            <button
                                onClick={() => setCreating(true)}
                                className="px-8 py-4 bg-pink-500 text-white rounded-full font-bold shadow-xl hover:bg-pink-600 hover:scale-105 transition-all text-lg flex items-center gap-2"
                            >
                                <UserPlus className="w-6 h-6" /> Create New Teddy
                            </button>
                        </div>
                    </>
                ) : (
                    // Creator UI
                    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg mb-20 flex flex-col items-center border border-pink-100">
                        {/* Preview */}
                        <div className="mb-8 p-6 bg-pink-50 rounded-full shadow-inner">
                            <TeddyBear body={bodyColor} bow={bowColor} acc={accessory} scale={1.2} />
                        </div>

                        {/* Controls */}
                        <div className="w-full space-y-6">

                            {/* Color Pickers */}
                            <div className="space-y-4 bg-pink-50/50 p-4 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-pink-900/60 uppercase">Fur Color</label>
                                    <div className="flex gap-2">
                                        {BODY_COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setBodyColor(c)}
                                                className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${bodyColor === c ? 'scale-125 ring-2 ring-pink-400' : ''}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-pink-900/60 uppercase">Bow Tie</label>
                                    <div className="flex gap-2">
                                        {BOW_COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setBowColor(c)}
                                                className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${bowColor === c ? 'scale-125 ring-2 ring-pink-400' : ''}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-pink-900/60 uppercase">Accessory</label>
                                    <div className="flex gap-2">
                                        {ACCESSORIES.map(a => (
                                            <button
                                                key={a}
                                                onClick={() => setAccessory(a)}
                                                className={`px-2 py-1 text-xs rounded-lg transition-all ${accessory === a ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 border border-pink-200'}`}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-pink-900/60 uppercase ml-1">Teddy Name</label>
                                    <input
                                        type="text"
                                        value={teddyName}
                                        onChange={e => setTeddyName(e.target.value)}
                                        placeholder="e.g. Mr. Fluff"
                                        className="w-full px-4 py-3 rounded-xl bg-pink-50 border-none outline-none focus:ring-2 focus:ring-pink-300 text-pink-900 placeholder-pink-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-pink-900/60 uppercase ml-1">For Whom?</label>
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={e => setRecipient(e.target.value)}
                                        placeholder="Name"
                                        className="w-full px-4 py-3 rounded-xl bg-pink-50 border-none outline-none focus:ring-2 focus:ring-pink-300 text-pink-900 placeholder-pink-300"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setCreating(false)}
                                    className="px-6 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveTeddy}
                                    disabled={!teddyName.trim() || !recipient.trim()}
                                    className="flex-1 py-4 bg-pink-500 text-white rounded-xl font-bold shadow-lg hover:bg-pink-600 disabled:opacity-50 transition-all"
                                >
                                    Finish & Give 🎁
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
