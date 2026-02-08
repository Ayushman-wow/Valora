'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, RefreshCw, Handshake } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { PROMISE_WORDS, shuffleArray } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';

export default function PromiseBuilderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [words, setWords] = useState<string[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [round, setRound] = useState(0);

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
                // Setup words
                const w = shuffleArray(PROMISE_WORDS.flat()).slice(0, 12);
                setWords(w);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, round, session]);

    const handleSelect = (word: string) => {
        if (selected.includes(word)) {
            setSelected(selected.filter(w => w !== word));
        } else {
            if (selected.length < 5) setSelected([...selected, word]);
        }
    };

    const submit = async () => {
        if (!gameId || selected.length < 3) return;
        const promise = selected.join(' ');
        await GameManager.submitAnswer(gameId, username, { promise });
        await GameManager.updatePlayerScore(gameId, username, 15);
        if (round + 1 >= 3) {
            await GameManager.endGame(gameId);
        } else {
            setRound(r => r + 1);
            setSelected([]);
            setWords(shuffleArray(PROMISE_WORDS.flat()).slice(0, 12));
        }
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🤝</div>
                    <h2 className="text-3xl font-bold">Promises Made!</h2>
                    <p className="text-5xl font-bold text-love-gold">{game.players?.[0]?.score || 0}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/promise-builder')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
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
                    <div className="bg-white px-4 py-2 rounded-xl font-bold text-love-crimson">Round {round + 1}/3</div>
                </div>

                <div className="glass-card p-8 text-center min-h-[300px] flex flex-col justify-between">
                    <div>
                        <Handshake className="w-16 h-16 text-love-rose mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-4">Build a Promise!</h2>
                        <div className="bg-white/50 p-6 rounded-xl min-h-[80px] mb-8 text-xl font-medium text-love-charcoal">
                            {selected.length > 0 ? selected.join(' ') : "Select words below..."}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {words.map((w, i) => (
                            <button key={i} onClick={() => handleSelect(w)}
                                className={`p-3 rounded-xl font-bold transition ${selected.includes(w) ? 'bg-love-crimson text-white scale-95' : 'bg-white hover:bg-love-blush'}`}>
                                {w}
                            </button>
                        ))}
                    </div>

                    <button onClick={submit} disabled={selected.length < 3}
                        className="w-full py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold text-xl disabled:opacity-50">
                        Submit Promise! 💌
                    </button>
                </div>
            </div>
        </div>
    );
}
