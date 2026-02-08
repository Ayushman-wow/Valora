'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Brain, ArrowLeft, CheckCircle, XCircle, Star } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { GameSession } from '@/lib/gameTypes';
import { VALENTINE_TRIVIA, shuffleArray } from '@/lib/gameContent';

function ValentineTriviaContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';

    const [game, setGame] = useState<GameSession | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const getCurrentUsername = () => {
        return session?.user?.name || localStorage.getItem('heartsync_username') || 'Guest';
    };

    useEffect(() => {
        if (!gameId) {
            router.push(returnTo);
            return;
        }

        const fetchGame = async () => {
            try {
                const loadedGame = await GameManager.getGameById(gameId);
                if (!loadedGame) {
                    router.push(returnTo);
                    return;
                }

                // Initialize questions
                if (!loadedGame.gameData?.questions || !Array.isArray(loadedGame.gameData.questions) || loadedGame.gameData.questions.length === 0) {
                    const questions = shuffleArray([...VALENTINE_TRIVIA]);
                    // Note: updateGameData is local optimistic update or we wait?
                    // Let's assume we wait for server to confirm
                    const updated = await GameManager.updateGameData(gameId, { questions });
                    if (updated) {
                        if (!loadedGame.gameData) loadedGame.gameData = {};
                        loadedGame.gameData.questions = questions;
                    }
                }

                setGame(loadedGame);

                if (loadedGame.status === 'waiting') {
                    await GameManager.setPlayerReady(gameId, getCurrentUsername(), true);
                    // Refresh game state after setting ready
                    const refreshed = await GameManager.getGameById(gameId);
                    setGame(refreshed);
                }
            } catch (e) { console.error(e); }
        };
        fetchGame();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameId, router, session]);

    // Timer
    useEffect(() => {
        if (game?.status === 'active' && !showResult) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeout();
                        return 15;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [game?.status, showResult, currentQuestion]);

    const handleTimeout = () => {
        setShowResult(true);
        setIsCorrect(false);
        setStreak(0);
        setTimeout(() => nextQuestion(), 2500);
    };

    const handleAnswer = (answer: string) => {
        if (showResult || !game || !gameId) return;

        setSelectedAnswer(answer);
        const question = game.gameData.questions[currentQuestion];
        const correct = answer === question.answer;

        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            // More points for faster answers
            const timeBonus = Math.floor(timeLeft / 3);
            const streakBonus = Math.floor(streak / 2);
            const points = 10 + timeBonus + streakBonus;

            GameManager.updatePlayerScore(gameId, getCurrentUsername(), points);

            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > bestStreak) {
                setBestStreak(newStreak);
            }
        } else {
            setStreak(0);
        }

        // Submit answer async
        (async () => {
            if (gameId) {
                await GameManager.submitAnswer(gameId, getCurrentUsername(), {
                    question: currentQuestion,
                    answer,
                    correct,
                    timeLeft
                });
            }
        })();

        setTimeout(() => nextQuestion(), 2500);
    };

    const nextQuestion = () => {
        if (!game || !gameId) return;

        setShowResult(false);
        setSelectedAnswer(null);
        setTimeLeft(15);

        if (currentQuestion + 1 >= game.gameData.questions.length) {
            (async () => await GameManager.endGame(gameId))();
            return;
        }

        setCurrentQuestion(prev => prev + 1);
    };

    const handleExit = async () => {
        // if (gameId) {
        //    await GameManager.leaveGame(gameId, getCurrentUsername());
        // }
        router.push(returnTo);
    };

    if (!game) {
        return <div className="p-12 text-center">Loading game...</div>;
    }

    // Game completed
    if (game.status === 'completed') {
        const player = game.players?.find(p => p.username === getCurrentUsername());
        const totalQuestions = game.gameData.questions.length;
        const correctAnswers = player?.answers?.filter((a: any) => a.correct).length || 0;
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 max-w-lg w-full space-y-6"
                >
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <Trophy className="w-16 h-16 text-white" />
                    </div>

                    <div className="text-center">
                        <h2 className="text-4xl font-playfair font-bold text-love-charcoal mb-2">
                            Quiz Complete! 🎉
                        </h2>
                        <p className="text-5xl font-bold text-love-gold mb-4">
                            {player?.score || 0} Points
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-700">{correctAnswers}</p>
                            <p className="text-xs text-green-600">Correct</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
                            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-red-700">{totalQuestions - correctAnswers}</p>
                            <p className="text-xs text-red-600">Wrong</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                            <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-700">{accuracy}%</p>
                            <p className="text-xs text-blue-600">Accuracy</p>
                        </div>
                    </div>

                    {bestStreak > 2 && (
                        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 text-center">
                            <p className="text-lg font-bold text-orange-700">
                                🔥 Best Streak: {bestStreak}
                            </p>
                        </div>
                    )}

                    <div className="bg-white/50 rounded-xl p-4 text-center">
                        <p className="font-bold text-love-charcoal mb-2">Performance Rating:</p>
                        {accuracy >= 90 && (
                            <p className="text-2xl">🏆 Love Expert!</p>
                        )}
                        {accuracy >= 70 && accuracy < 90 && (
                            <p className="text-2xl">⭐ Romance Scholar!</p>
                        )}
                        {accuracy >= 50 && accuracy < 70 && (
                            <p className="text-2xl">💕 Sweet Learner!</p>
                        )}
                        {accuracy < 50 && (
                            <p className="text-2xl">💪 Keep Learning!</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/games/valentine-trivia')}
                            className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={handleExit}
                            className="flex-1 py-3 bg-white text-love-charcoal rounded-xl font-bold hover:bg-love-blush transition-all"
                        >
                            Exit
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const question = game.gameData.questions?.[currentQuestion];
    if (!question) return null;

    const player = game.players?.find(p => p.username === getCurrentUsername());

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={handleExit}
                        className="p-3 bg-white rounded-xl hover:bg-love-blush transition-all shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-love-charcoal" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-lg">
                            <Trophy className="w-5 h-5 text-love-gold" />
                            <span className="font-bold text-love-charcoal">{player?.score || 0}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-love-crimson'
                            }`}>
                            <Clock className="w-5 h-5 text-white" />
                            <span className="font-bold text-white">{timeLeft}s</span>
                        </div>
                        {streak > 0 && (
                            <div className="flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-xl shadow-lg">
                                <span className="font-bold text-white">🔥 {streak}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-love-charcoal">
                            Question {currentQuestion + 1} of {game.gameData.questions.length}
                        </span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestion + 1) / game.gameData.questions.length) * 100}%` }}
                            className="h-full bg-gradient-to-r from-love-crimson to-love-rose"
                        />
                    </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="glass-card p-8 mb-6"
                    >
                        <div className="text-center mb-8">
                            <Brain className="w-16 h-16 text-love-crimson mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-love-charcoal mb-4">
                                {question.question}
                            </h2>
                        </div>

                        {/* Answer Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((option: string, index: number) => {
                                const isSelected = selectedAnswer === option;
                                const isRightAnswer = showResult && option === question.answer;
                                const isWrongAnswer = showResult && isSelected && option !== question.answer;

                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: showResult ? 1 : 1.02 }}
                                        whileTap={{ scale: showResult ? 1 : 0.98 }}
                                        onClick={() => handleAnswer(option)}
                                        disabled={showResult}
                                        className={`p-4 rounded-xl font-bold transition-all flex items-center justify-between text-left border ${isRightAnswer
                                            ? 'bg-green-100 text-green-700 border-green-500 shadow-md'
                                            : isWrongAnswer
                                                ? 'bg-red-100 text-red-700 border-red-500 shadow-md'
                                                : isSelected
                                                    ? 'bg-love-crimson text-white border-love-crimson shadow-lg'
                                                    : 'bg-white/90 text-love-charcoal border-love-rose/20 hover:border-love-rose hover:bg-white hover:shadow-md'
                                            }`}
                                    >
                                        <span>{option}</span>
                                        {isRightAnswer && <CheckCircle className="w-6 h-6" />}
                                        {isWrongAnswer && <XCircle className="w-6 h-6" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Result Feedback */}
                <AnimatePresence>
                    {showResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`text-center p-6 rounded-xl shadow-lg ${isCorrect ? 'bg-gradient-to-r from-green-100 to-green-200' : 'bg-gradient-to-r from-red-100 to-red-200'
                                }`}
                        >
                            <p className={`text-3xl font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
                            </p>
                            {isCorrect && (
                                <p className="text-green-600 text-lg">
                                    +{10 + Math.floor(timeLeft / 3) + Math.floor(streak / 2)} points
                                </p>
                            )}
                            {!isCorrect && (
                                <p className="text-red-600">
                                    Correct answer: <span className="font-bold">{question.answer}</span>
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function ValentineTriviaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Trivia...</div>}>
            <ValentineTriviaContent />
        </Suspense>
    );
}
