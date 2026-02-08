'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Clock, Trophy, Play, Star } from 'lucide-react';
import { GAME_CONFIGS, GameType, VALENTINE_DAYS, getGamesByDay } from '@/lib/gameTypes';
import * as GameManager from '@/lib/gameManager';


function GamesPageContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/days';

    const [selectedDay, setSelectedDay] = useState('Rose Day');
    const [username, setUsername] = useState('');
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const [tempUsername, setTempUsername] = useState('');

    const getCurrentUsername = () => {
        return session?.user?.name || username || 'Guest';
    };

    useEffect(() => {
        // Get username
        if (!session?.user?.name && !username) {
            const saved = localStorage.getItem('heartsync_username');
            if (saved) {
                setUsername(saved);
            } else {
                setShowUsernamePrompt(true);
            }
        }

    }, [session, username]);

    const handleStartGame = async (gameType: GameType) => {
        try {
            const game = await GameManager.createGame(gameType, 'solo', getCurrentUsername());
            router.push(`/games/${gameType}?gameId=${game._id}&returnTo=${encodeURIComponent(returnTo)}`);
        } catch (err) {
            console.error('Failed to start game:', err);
        }
    };

    const dayGames = getGamesByDay(selectedDay);

    // Username prompt
    if (showUsernamePrompt) {

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-love-rose to-love-crimson rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <span className="text-4xl">🎮</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-playfair font-bold text-love-charcoal mb-2">
                            Ready to Play?
                        </h2>
                        <p className="text-love-charcoal/70">
                            Enter your name to start gaming!
                        </p>
                    </div>
                    <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && tempUsername.trim()) {
                                setUsername(tempUsername);
                                localStorage.setItem('heartsync_username', tempUsername);
                                setShowUsernamePrompt(false);
                            }
                        }}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 rounded-xl border-2 border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50 text-center"
                        maxLength={20}
                        autoFocus
                    />
                    <button
                        onClick={() => {
                            if (tempUsername.trim()) {
                                setUsername(tempUsername);
                                localStorage.setItem('heartsync_username', tempUsername);
                                setShowUsernamePrompt(false);
                            }
                        }}
                        disabled={!tempUsername.trim()}
                        className="w-full py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        Let's Play! 🎮
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-2 px-2">
            {/* Header */}
            {/* Header */}
            <div className="text-center mb-1">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block"
                >
                    <h1 className="text-3xl font-playfair font-bold text-love-charcoal mb-0">
                        Valentine Mini Games 🎮
                    </h1>
                    <p className="text-sm text-love-charcoal/70 max-w-2xl mx-auto">
                        24 fun games for every day of Valentine's Week! Play solo, with friends, or in rooms!
                    </p>
                </motion.div>
            </div>

            {/* Day Selector */}
            <div className="mb-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide py-1 px-1">
                    {VALENTINE_DAYS.map(day => {
                        const dayGamesCount = getGamesByDay(day).length;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                style={{
                                    backgroundColor: selectedDay === day ? '#FF5090' : 'white',
                                    color: selectedDay === day ? 'white' : '#4A4E69',
                                    borderColor: selectedDay === day ? '#FF5090' : '#FFF0F3'
                                }}
                                className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all shadow-sm border-2 text-sm ${selectedDay === day
                                    ? 'shadow-lg scale-105'
                                    : 'hover:border-[#FF5090] hover:text-[#FF5090]'
                                    }`}
                            >
                                {day} ({dayGamesCount})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dayGames.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden"
                    >
                        {/* Game Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-love-rose to-love-crimson rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-4xl">{game.icon}</span>
                        </div>

                        {/* Game Info */}
                        <h3 className="text-2xl font-playfair font-black text-love-charcoal mb-2 tracking-tight">{game.name}</h3>
                        <p className="text-love-charcoal/70 mb-4">{game.description}</p>

                        {/* Game Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center p-2 bg-white/50 rounded-lg">
                                <Users className="w-4 h-4 mx-auto text-love-rose mb-1" />
                                <p className="text-xs font-medium">{game.minPlayers}-{game.maxPlayers}</p>
                            </div>
                            <div className="text-center p-2 bg-white/50 rounded-lg">
                                <Clock className="w-4 h-4 mx-auto text-love-crimson mb-1" />
                                <p className="text-xs font-medium">{game.duration}s</p>
                            </div>
                            <div className="text-center p-2 bg-white/50 rounded-lg">
                                <Trophy className="w-4 h-4 mx-auto text-love-gold mb-1" />
                                <p className="text-xs font-medium capitalize">{game.difficulty}</p>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {game.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white border border-love-blush text-love-charcoal/80 text-xs font-bold rounded-full shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Play Button */}
                        <div className="mt-auto relative z-20">
                            <button
                                onClick={() => handleStartGame(game.id)}
                                className="w-full py-4 bg-[#FF5090] text-white rounded-xl font-bold shadow-lg hover:bg-[#E02E6E] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-white/20 z-20 opacity-100"
                                style={{ backgroundColor: '#FF5090', color: 'white' }}
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span className="text-white font-bold text-lg">Play Now</span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Stats Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 glass-card p-8 text-center"
            >
                <div className="flex items-center justify-center gap-8">
                    <div>
                        <Star className="w-8 h-8 text-love-gold mx-auto mb-2" />
                        <p className="text-3xl font-bold text-love-charcoal">24</p>
                        <p className="text-sm text-love-charcoal/70">Total Games</p>
                    </div>
                    <div className="w-px h-16 bg-love-blush"></div>
                    <div>
                        <Gamepad2 className="w-8 h-8 text-love-rose mx-auto mb-2" />
                        <p className="text-3xl font-bold text-love-charcoal">8</p>
                        <p className="text-sm text-love-charcoal/70">Days of Fun</p>
                    </div>
                    <div className="w-px h-16 bg-love-blush"></div>
                    <div>
                        <Users className="w-8 h-8 text-love-crimson mx-auto mb-2" />
                        <p className="text-3xl font-bold text-love-charcoal">1-20</p>
                        <p className="text-sm text-love-charcoal/70">Players</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function GamesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Games...</div>}>
            <GamesPageContent />
        </Suspense>
    );
}

