'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, RefreshCw } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { useSession } from 'next-auth/react';

const EMJOIS = ['🍫', '🍬', '🍭', '🍪', '🍩', '🧁'];

export default function ChocolateMatchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);
    const [moves, setMoves] = useState(0);

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

                // Setup cards
                const d = [...EMJOIS, ...EMJOIS].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
                setCards(d);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    const handleFlip = (id: number) => {
        if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;

        const newCards = [...cards];
        newCards[id].flipped = true;
        setCards(newCards);

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            if (newCards[newFlipped[0]].emoji === newCards[newFlipped[1]].emoji) {
                // Match!
                setTimeout(async () => {
                    const matchedCards = [...cards];
                    matchedCards[newFlipped[0]].matched = true;
                    matchedCards[newFlipped[1]].matched = true;
                    setCards(matchedCards);
                    setFlipped([]);
                    setMatches(m => m + 1);
                    if (gameId) {
                        await GameManager.updatePlayerScore(gameId, username, 20);
                        if (matches + 1 === EMJOIS.length) await GameManager.endGame(gameId);
                    }
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[newFlipped[0]].flipped = false;
                    resetCards[newFlipped[1]].flipped = false;
                    setCards(resetCards);
                    setFlipped([]);
                }, 1000);
            }
        }
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🍫</div>
                    <h2 className="text-3xl font-bold">Sweet Victory!</h2>
                    <p className="text-5xl font-bold text-love-gold">{game.players?.[0]?.score || 0}</p>
                    <p>Moves: {moves}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/chocolate-match')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
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
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl font-bold"><Trophy className="w-5 h-5 inline text-love-gold mr-2" />{game.players?.[0]?.score || 0}</div>
                        <div className="bg-love-rose px-4 py-2 rounded-xl text-white font-bold"><RefreshCw className="w-5 h-5 inline mr-2" />{moves}</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <motion.div key={card.id} initial={{ rotateY: 0 }} animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleFlip(card.id)}
                            className="aspect-square perspective-1000 cursor-pointer relative">
                            <div className={`w-full h-full absolute rounded-xl shadow-lg backface-hidden flex items-center justify-center text-4xl bg-gradient-to-br from-love-crimson to-love-rose`}
                                style={{ transform: 'rotateY(0deg)', backfaceVisibility: 'hidden' }}>
                                ❓
                            </div>
                            <div className={`w-full h-full absolute rounded-xl shadow-lg backface-hidden flex items-center justify-center text-5xl bg-white border-4 ${card.matched ? 'border-green-400' : 'border-love-rose'}`}
                                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                                {card.emoji}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
