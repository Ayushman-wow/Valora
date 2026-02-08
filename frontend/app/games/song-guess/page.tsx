'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, ArrowLeft, Music, Mic } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { shuffleArray } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';

const SONGS = [
    { lyric: "Cause all of me loves all of you...", answer: "All of Me - John Legend", options: ["All of Me - John Legend", "Perfect - Ed Sheeran", "Stay - Rihanna", "Hello - Adele"] },
    { lyric: "I will always love you...", answer: "I Will Always Love You - Whitney Houston", options: ["My Heart Will Go On - Celine Dion", "I Will Always Love You - Whitney Houston", "Halo - Beyoncé", "Crazy in Love - Beyoncé"] },
    { lyric: "Take my hand, take my whole life too...", answer: "Can't Help Falling in Love - Elvis", options: ["Unchained Melody - Righteous Brothers", "Can't Help Falling in Love - Elvis", "My Girl - The Temptations", "Stand by Me - Ben E. King"] },
    { lyric: "Baby, you're a firework...", answer: "Firework - Katy Perry", options: ["Roar - Katy Perry", "Firework - Katy Perry", "Teenage Dream - Katy Perry", "Dark Horse - Katy Perry"] },
    { lyric: "You belong with me...", answer: "You Belong With Me - Taylor Swift", options: ["Love Story - Taylor Swift", "You Belong With Me - Taylor Swift", "Shake It Off - Taylor Swift", "Blank Space - Taylor Swift"] }
];

function SongGuessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                if (!g.gameData?.questions || !Array.isArray(g.gameData.questions) || g.gameData.questions.length === 0) {
                    const q = shuffleArray([...SONGS]);
                    await GameManager.updateGameData(gameId, { questions: q });
                    if (!g.gameData) g.gameData = {};
                    g.gameData.questions = q; // Client side optimistic update or refetch
                }
                setGame(g);
                if (g?.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    useEffect(() => {
        if (game?.status === 'active' && !showResult) {
            const t = setInterval(() => setTimeLeft(p => p <= 1 ? (handleTimeout(), 15) : p - 1), 1000);
            return () => clearInterval(t);
        }
    }, [game, showResult, currentQ]);

    const handleTimeout = () => { setShowResult(true); setTimeout(next, 2000); };

    const handleAnswer = async (ans: string) => {
        if (showResult || !game || !gameId) return;
        setSelected(ans);
        const correct = ans === game.gameData.questions[currentQ].answer;
        setShowResult(true);
        if (correct) await GameManager.updatePlayerScore(gameId, username, 15);
        setTimeout(next, 2000);
    };

    const next = async () => {
        if (!game || !gameId) return;
        setShowResult(false); setSelected(null); setTimeLeft(15);
        if (currentQ + 1 >= game.gameData.questions.length) { await GameManager.endGame(gameId); return; }
        setCurrentQ(c => c + 1);
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🎵</div>
                    <h2 className="text-3xl font-bold">Song Master!</h2>
                    <p className="text-5xl font-bold text-love-gold">{game.players?.[0]?.score || 0}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/song-guess')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const q = game.gameData.questions?.[currentQ];
    if (!q) return null;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl font-bold"><Trophy className="w-5 h-5 inline text-love-gold mr-2" />{game.players?.[0]?.score || 0}</div>
                        <div className="bg-love-crimson px-4 py-2 rounded-xl text-white font-bold"><Clock className="w-5 h-5 inline mr-2" />{timeLeft}s</div>
                    </div>
                </div>

                <motion.div key={currentQ} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
                    <Music className="w-16 h-16 text-love-rose mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Guess the Song!</h2>
                    <div className="bg-love-blush/30 p-6 rounded-xl mb-8 italic text-xl font-serif">
                        "{q.lyric}"
                    </div>

                    <div className="grid gap-3">
                        {q.options.map((opt: string, i: number) => {
                            const isSel = selected === opt;
                            const isRight = showResult && opt === q.answer;
                            const isWrong = showResult && isSel && opt !== q.answer;
                            return (
                                <button key={i} onClick={() => handleAnswer(opt)} disabled={showResult}
                                    className={`p-4 rounded-xl font-bold transition flex items-center justify-between ${isRight ? 'bg-green-100 text-green-700 border-2 border-green-500' :
                                        isWrong ? 'bg-red-100 text-red-700' :
                                            isSel ? 'bg-love-crimson text-white' : 'bg-white hover:bg-love-blush'
                                        }`}>
                                    <span>{opt}</span>
                                    {isRight && <Mic className="w-5 h-5" />}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function SongGuessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SongGuessContent />
        </Suspense>
    );
}
