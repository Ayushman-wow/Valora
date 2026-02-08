'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Heart } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { COMPATIBILITY_QUESTIONS } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';

export default function CompatibilityBlitzPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                if (!g.gameData?.questions || !Array.isArray(g.gameData.questions) || g.gameData.questions.length === 0) await GameManager.updateGameData(gameId, { questions: COMPATIBILITY_QUESTIONS });
                setGame(g || { gameData: { questions: COMPATIBILITY_QUESTIONS }, players: [] });
                if (g?.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    const handleAnswer = async (ans: string) => {
        if (!gameId) return;
        setAnswers([...answers, ans]);
        await GameManager.submitAnswer(gameId, username, { answer: ans });
        await GameManager.updatePlayerScore(gameId, username, 10);
        if (currentQ + 1 >= COMPATIBILITY_QUESTIONS.length) {
            setTimeout(async () => await GameManager.endGame(gameId), 500);
        } else {
            setTimeout(() => setCurrentQ(c => c + 1), 500);
        }
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;
    if (game.status === 'completed') {
        const score = Math.floor(Math.random() * 30) + 70; // Random compatibility 70-100%
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">💕</div>
                    <h2 className="text-3xl font-bold">Compatibility Score</h2>
                    <p className="text-7xl font-bold text-love-gold">{score}%</p>
                    <p className="text-xl">Great match!</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/compatibility-blitz')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const q = COMPATIBILITY_QUESTIONS[currentQ];
    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="bg-white px-4 py-2 rounded-xl font-bold">{currentQ + 1}/{COMPATIBILITY_QUESTIONS.length}</div>
                </div>
                <motion.div key={currentQ} className="glass-card p-12 text-center">
                    <Heart className="w-20 h-20 text-love-rose mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-12">{q.question}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {q.options.map((o: string, i: number) => (
                            <button key={i} onClick={() => handleAnswer(o)}
                                className="p-6 rounded-2xl font-bold text-xl bg-white hover:bg-love-crimson hover:text-white transition">
                                {o}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
