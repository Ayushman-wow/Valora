'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Shirt, Crown, Glasses } from 'lucide-react';


const ACCESSORIES = {
    hats: ['🎩', '👑', '🧢', '🎀', '🎓'],
    glasses: ['🕶️', '👓', '🧐', '😎', '🥸'],
    outfits: ['👕', '👔', '👗', '👘', '🦺'],
    extras: ['🧣', '🎒', '👜', '🌂', '🎈']
};

function DressTeddyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/games';
    const [teddy, setTeddy] = useState({ hat: '', glass: '', outfit: '', extra: '' });

    // Screenshot function (Mock for now to avoid dependency issues)
    const saveTeddy = () => {
        // In a real app, use html2canvas here
        alert("Teddy saved to your heart! ❤️ (This would download the meaningful image in production)");
    };

    return (
        <div className="min-h-screen py-8 px-4 flex flex-col items-center">
            <div className="w-full max-w-2xl flex justify-between mb-8">
                <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                <div className="bg-white px-4 py-2 rounded-xl font-bold">Dress Your Teddy</div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start w-full max-w-4xl">
                {/* Teddy Preview */}
                <div id="teddy-canvas" className="bg-white p-12 rounded-3xl shadow-xl relative aspect-square w-full max-w-md mx-auto flex items-center justify-center overflow-hidden">
                    <div className="text-[150px] relative">
                        🧸
                        {teddy.hat && <div className="absolute -top-10 left-0 w-full text-center text-[80px]">{teddy.hat}</div>}
                        {teddy.glass && <div className="absolute top-8 left-0 w-full text-center text-[60px] opacity-90">{teddy.glass}</div>}
                        {teddy.outfit && <div className="absolute top-20 left-0 w-full text-center text-[80px] opacity-80">{teddy.outfit}</div>}
                        {teddy.extra && <div className="absolute bottom-0 right-0 text-[60px]">{teddy.extra}</div>}
                    </div>
                </div>

                {/* Controls */}
                <div className="glass-card p-6 w-full space-y-6">
                    <div>
                        <h3 className="font-bold flex items-center gap-2 mb-3"><Crown className="w-5 h-5" /> Hats</h3>
                        <div className="flex gap-2 flex-wrap">
                            {ACCESSORIES.hats.map(i => (
                                <button key={i} onClick={() => setTeddy(t => ({ ...t, hat: i }))}
                                    className={`text-2xl p-3 rounded-xl border-2 ${teddy.hat === i ? 'border-love-crimson bg-love-blush' : 'border-transparent hover:bg-white'}`}>
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold flex items-center gap-2 mb-3"><Glasses className="w-5 h-5" /> Glasses</h3>
                        <div className="flex gap-2 flex-wrap">
                            {ACCESSORIES.glasses.map(i => (
                                <button key={i} onClick={() => setTeddy(t => ({ ...t, glass: i }))}
                                    className={`text-2xl p-3 rounded-xl border-2 ${teddy.glass === i ? 'border-love-crimson bg-love-blush' : 'border-transparent hover:bg-white'}`}>
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold flex items-center gap-2 mb-3"><Shirt className="w-5 h-5" /> Outfits</h3>
                        <div className="flex gap-2 flex-wrap">
                            {ACCESSORIES.outfits.map(i => (
                                <button key={i} onClick={() => setTeddy(t => ({ ...t, outfit: i }))}
                                    className={`text-2xl p-3 rounded-xl border-2 ${teddy.outfit === i ? 'border-love-crimson bg-love-blush' : 'border-transparent hover:bg-white'}`}>
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button onClick={saveTeddy} className="flex-1 py-3 bg-love-crimson text-white rounded-xl font-bold hover:shadow-lg transition">
                            Save Teddy 📸
                        </button>
                        <button onClick={() => setTeddy({ hat: '', glass: '', outfit: '', extra: '' })} className="px-4 py-3 bg-white rounded-xl font-bold hover:bg-gray-50">
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DressTeddyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <DressTeddyContent />
        </Suspense>
    );
}
