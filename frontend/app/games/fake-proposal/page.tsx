'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Copy, Share2, Heart, Sparkles, Wand2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PROPOSAL_SCENARIOS } from '@/lib/gameContent';
import confetti from 'canvas-confetti';

function FakeProposalContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/games';
    const [scenario, setScenario] = useState<{ text: string; blanks: string[] } | null>(null);
    const [filledText, setFilledText] = useState('');
    const [tone, setTone] = useState<string>('dramatic');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        generateProposal();
    }, []);

    const tones = [
        { id: 'dramatic', emoji: '🎭', label: 'Dramatic' },
        { id: 'shy', emoji: '😳', label: 'Shy' },
        { id: 'filmy', emoji: '🎬', label: 'Bollywood' },
        { id: 'robot', emoji: '🤖', label: 'Robot' },
    ];

    const generateProposal = () => {
        setGenerating(true);
        setTimeout(() => {
            const randomScenario = PROPOSAL_SCENARIOS[Math.floor(Math.random() * PROPOSAL_SCENARIOS.length)];
            const randomBlank = randomScenario.blanks[Math.floor(Math.random() * randomScenario.blanks.length)];

            let text = randomScenario.text.replace('____', randomBlank);

            // Tone modifiers
            if (tone === 'dramatic') text = `(Falls to knees, tears in eyes)\n"${text}"\n(Faints)`;
            if (tone === 'shy') text = `(Hides face, whispers)\n"Um... so... ${text}"\n(Runs away)`;
            if (tone === 'filmy') text = `(Slow motion wind blows)\n"Priya... (or whoever)... ${text}"\n(Background dancers appear)`;
            if (tone === 'robot') text = `BEEP BOOP.\nINITIATING PROPOSAL SEQUENCE.\n"${text.toUpperCase()}"\nEND TRANSMISSION.`;

            setScenario(randomScenario);
            setFilledText(text);
            setGenerating(false);
        }, 600);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(filledText);
        confetti({
            particleCount: 50,
            spread: 60,
            colors: ['#FF69B4', '#FFD700']
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 font-outfit">
            {/* Header */}
            <div className="max-w-md mx-auto flex items-center justify-between mb-8">
                <button onClick={() => router.push(returnTo)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎭</span>
                    <h1 className="text-xl font-bold text-gray-800">Fake Proposal</h1>
                </div>
                <div className="w-10" />
            </div>

            <div className="max-w-md mx-auto space-y-6">

                {/* Tone Selector */}
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <label className="text-sm font-bold text-gray-500 mb-3 block">CHOOSE YOUR VIBE</label>
                    <div className="grid grid-cols-4 gap-2">
                        {tones.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setTone(t.id); generateProposal(); }}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${tone === t.id
                                    ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-500'
                                    : 'hover:bg-gray-50 text-gray-500'
                                    }`}
                            >
                                <span className="text-2xl">{t.emoji}</span>
                                <span className="text-xs font-medium">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Result Card */}
                <div className="relative">
                    <motion.div
                        key={filledText}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-3xl shadow-xl text-center border-4 border-purple-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-400" />

                        {generating ? (
                            <div className="py-12 flex flex-col items-center gap-4 text-purple-400">
                                <Wand2 className="w-12 h-12 animate-spin" />
                                <p className="font-bold">Cooking up romance...</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">PROPOSAL #{Math.floor(Math.random() * 9999)}</p>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed whitespace-pre-wrap font-playfair">
                                    {filledText}
                                </p>
                                <div className="mt-8 flex justify-center gap-3">
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full font-bold text-gray-600 hover:bg-gray-200 transition"
                                    >
                                        <Copy className="w-4 h-4" /> Copy
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({ title: 'My Fake Proposal', text: filledText });
                                            } else {
                                                handleCopy();
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full font-bold text-purple-600 hover:bg-purple-200 transition"
                                    >
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={generateProposal}
                    disabled={generating}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <RefreshCw className={`w-6 h-6 ${generating ? 'animate-spin' : ''}`} />
                    GENERATE NEW
                </button>

            </div>
        </div>
    );
}

export default function FakeProposalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <FakeProposalContent />
        </Suspense>
    );
}
