'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Brain } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { useSession } from 'next-auth/react';

const MEMORY_QUESTIONS = [
    "Where did we first meet?",
    "What was our first movie?",
    "What's my favorite food?",
    "When is my birthday?",
    "What's our special song?"
];

function MemoryQuizContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [answer, setAnswer] = useState('');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                setGame(g);
                if (g?.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, router, session]);

    const submit = async () => {
        if (!answer.trim() || !gameId) return;

        const newScore = score + 10;
        setScore(newScore);

        await GameManager.submitAnswer(gameId, username, {
            question: MEMORY_QUESTIONS[currentQ],
            answer: answer
        });
        await GameManager.updatePlayerScore(gameId, username, 10);

        setAnswer('');

        if (currentQ + 1 >= MEMORY_QUESTIONS.length) {
            setCompleted(true);
            await GameManager.endGame(gameId);
        } else {
            setCurrentQ(q => q + 1);
        }
    };

    if (completed || game?.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-8 text-center space-y-6 max-w-md w-full">
                    <div className="text-8xl">💭</div>
                    <h2 className="text-3xl font-bold">Memory Lane!</h2>
                    <p className="text-xl">You've answered all questions!</p>
                    <p className="text-5xl font-bold text-love-gold">{score}</p>
                    <div className="flex gap-3">
                        <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="bg-white px-4 py-2 rounded-xl font-bold text-love-crimson">
                        <Trophy className="w-5 h-5 inline mr-2" /> {score}
                    </div>
                </div>

                <motion.div key={currentQ} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-card p-12 text-center">
                    <Brain className="w-16 h-16 text-love-rose mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">Question {currentQ + 1} of {MEMORY_QUESTIONS.length}</h2>
                    <p className="text-2xl mb-8 font-serif italic text-love-charcoal">"{MEMORY_QUESTIONS[currentQ]}"</p>

                    <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full p-4 rounded-xl border-2 border-love-blush mb-8 focus:ring-2 focus:ring-love-rose outline-none text-xl text-center"
                        onKeyPress={(e) => e.key === 'Enter' && submit()} />

                    <button onClick={submit} disabled={!answer.trim()}
                        className="w-full py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold text-xl disabled:opacity-50 hover:shadow-lg transition">
                        Submit Answer ✍️
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

export default function MemoryQuizPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <MemoryQuizContent />
        </Suspense>
    );
}
