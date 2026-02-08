'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gift, X, Check, Cookie } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as MemoryStorage from '@/lib/memoryStorage';
import confetti from 'canvas-confetti';

interface ChocolateBox {
    id: string;
    slots: (string | null)[]; // 9 slots, storing flavor IDs
    wrapperColor: string;
    recipient: string;
    timestamp: number;
}

const CHOCO_FLAVORS = [
    { id: 'dark', name: 'Dark Truffle', color: '#3E2723', emoji: '🍫' },
    { id: 'milk', name: 'Milk Caramel', color: '#795548', emoji: '🍬' },
    { id: 'white', name: 'White Vanilla', color: '#D7CCC8', emoji: '⚪' },
    { id: 'ruby', name: 'Ruby Berry', color: '#E91E63', emoji: '🍓' },
    { id: 'gold', name: 'Gold Hazelnut', color: '#FFD700', emoji: '🥜' },
];

export default function ChocolateDayPage() {
    const router = useRouter();
    const [boxes, setBoxes] = useState<ChocolateBox[]>([]);
    const [creating, setCreating] = useState(false);

    // Creation State
    const [currentSlots, setCurrentSlots] = useState<(string | null)[]>(Array(9).fill(null));
    const [selectedWrapper, setSelectedWrapper] = useState('bg-red-500');
    const [recipient, setRecipient] = useState('');

    const { data: session } = useSession();
    // Helper
    const getUserEmail = () => session?.user?.email || localStorage.getItem('heartsync_username') ? `${localStorage.getItem('heartsync_username')!.replace(/\s+/g, '')}@guest.com` : '';


    useEffect(() => {
        const loadMemories = async () => {
            const email = getUserEmail();
            if (email) {
                const memories = await MemoryStorage.getMemoriesByDay('chocolate', email);
                setBoxes(memories.map(m => m.content as ChocolateBox));
            }
        };
        loadMemories();
    }, [session]);

    const handleSlotClick = (index: number) => {
        // Cycle through flavors or clear
        const current = currentSlots[index];
        if (!current) {
            setCurrentSlots(prev => {
                const newSlots = [...prev];
                newSlots[index] = CHOCO_FLAVORS[0].id;
                return newSlots;
            });
        } else {
            const currentIdx = CHOCO_FLAVORS.findIndex(f => f.id === current);
            if (currentIdx < CHOCO_FLAVORS.length - 1) {
                setCurrentSlots(prev => {
                    const newSlots = [...prev];
                    newSlots[index] = CHOCO_FLAVORS[currentIdx + 1].id;
                    return newSlots;
                });
            } else {
                setCurrentSlots(prev => {
                    const newSlots = [...prev];
                    newSlots[index] = null; // Clear
                    return newSlots;
                });
            }
        }
    };

    const saveBox = async () => {
        if (!recipient.trim()) return;

        const newBox: ChocolateBox = {
            id: Date.now().toString(),
            slots: currentSlots,
            wrapperColor: selectedWrapper,
            recipient,
            timestamp: Date.now()
        };

        const email = getUserEmail();
        if (email) {
            await MemoryStorage.saveMemory('chocolate', 'given', newBox, recipient, email);
            setBoxes([...boxes, newBox]);
        }
        setCreating(false);
        setCurrentSlots(Array(9).fill(null));
        setRecipient('');

        confetti({
            colors: ['#5D4037', '#D7CCC8', '#FFD700']
        });
    };

    return (
        <div className="min-h-screen bg-[#3E2723] font-outfit relative overflow-hidden flex flex-col text-[#D7CCC8]">

            {/* Header */}
            <header className="p-6 flex items-center justify-between z-20">
                <button onClick={() => router.push('/days')} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all">
                    <ArrowLeft className="w-5 h-5 text-[#D7CCC8]" />
                </button>
                <h1 className="text-2xl font-playfair font-bold tracking-widest text-[#D7CCC8]">The Chocolate Box</h1>
                <div className="w-10" />
            </header>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 relative z-10 flex flex-col items-center justify-center">

                {!creating ? (
                    <>
                        {boxes.length === 0 ? (
                            <div className="text-center opacity-70">
                                <Cookie className="w-24 h-24 mx-auto mb-4 text-[#8D6E63]" />
                                <h2 className="text-xl font-bold">No sweets yet.</h2>
                                <p className="text-sm">Curate a box of chocolates for someone.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full">
                                {boxes.map(box => (
                                    <motion.div
                                        key={box.id}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`aspect-square relative rounded-xl shadow-2xl p-4 flex items-center justify-center cursor-pointer overflow-hidden ${box.wrapperColor}`}
                                    >
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="relative z-10 text-center text-white">
                                            <Gift className="w-12 h-12 mx-auto mb-2" />
                                            <p className="font-playfair font-bold text-lg">For {box.recipient}</p>
                                            <p className="text-xs opacity-80">{box.slots.filter(Boolean).length} Chocolates</p>
                                        </div>
                                        {/* Ribbon */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-white/30 z-0" />
                                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-4 bg-white/30 z-0" />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setCreating(true)}
                            className="mt-12 px-8 py-4 bg-[#D7CCC8] text-[#3E2723] rounded-full font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Gift className="w-5 h-5" /> Curate New Box
                        </button>
                    </>
                ) : (
                    // Creation Mode
                    <div className="bg-[#4E342E] p-8 rounded-3xl shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-playfair font-bold">Assemble Box</h2>
                            <button onClick={() => setCreating(false)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Box Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-8 bg-[#3E2723] p-4 rounded-xl shadow-inner border border-[#5D4037]">
                            {currentSlots.map((slot, i) => {
                                const flavor = CHOCO_FLAVORS.find(f => f.id === slot);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSlotClick(i)}
                                        className="aspect-square bg-[#4E342E] rounded-full shadow-sm hover:bg-[#5D4037] flex items-center justify-center transition-all relative group"
                                    >
                                        {flavor ? (
                                            <span className="text-2xl drop-shadow-md">{flavor.emoji}</span>
                                        ) : (
                                            <span className="text-[#5D4037] text-2xl">+</span>
                                        )}
                                        {flavor && (
                                            <span className="absolute -bottom-8 bg-black/80 text-[10px] px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                                                {flavor.name}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">Wrapper Color</label>
                                <div className="flex gap-2 mt-2">
                                    {['bg-red-500', 'bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-600'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedWrapper(color)}
                                            className={`w-8 h-8 rounded-full ${color} ${selectedWrapper === color ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">For Whom?</label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={e => setRecipient(e.target.value)}
                                    placeholder="Recipient Name"
                                    className="w-full mt-1 bg-[#3E2723] border border-[#5D4037] rounded-xl px-4 py-3 outline-none focus:border-[#D7CCC8] text-[#D7CCC8] placeholder-[#D7CCC8]/30"
                                />
                            </div>

                            <button
                                onClick={saveBox}
                                disabled={!recipient.trim() || currentSlots.every(s => s === null)}
                                className="w-full py-4 bg-[#D7CCC8] text-[#3E2723] rounded-xl font-bold shadow-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" /> Wrap & Send
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-center text-[#8D6E63] text-xs pb-4 opacity-50">
                Tap slots to change flavors. Tap multiple times to cycle.
            </p>

        </div>
    );
}
