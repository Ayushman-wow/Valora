'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Trophy, ArrowRight, User, Check, X } from 'lucide-react';
import JSConfetti from 'js-confetti';

const QUESTIONS = [
    "What is my favorite food?",
    "Where was our first kiss?",
    "What is my dream vacation?",
    "What is my shoe size?",
    "What is my biggest fear?",
    "What is my coffee order?",
    "What annoy me the most?",
    "What is my favorite movie?",
    "Who said 'I love you' first?",
    "What is my hidden talent?"
];

export default function PartnerQuizPage() {
    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [turn, setTurn] = useState<'asker' | 'answerer'>('asker');

    const handleCorrect = () => {
        setScore(score + 1);
        handleNext();
        const confetti = new JSConfetti();
        confetti.addConfetti({ emojis: ['💖', '✅', '💑'] });
    };

    const handleNext = () => {
        if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowAnswer(false);
            setTurn('asker');
        } else {
            setStarted(false); // End game
            // Show score screen logic could reside here
        }
    };

    if (!started) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-12 space-y-6"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-love-rose to-love-crimson rounded-full flex items-center justify-center mx-auto shadow-xl">
                        <span className="text-5xl">💑</span>
                    </div>
                    <h1 className="text-4xl font-playfair font-black text-love-charcoal">
                        Partner Quiz
                    </h1>
                    <p className="text-xl text-love-charcoal/70">
                        How well do you really know your boo? <br />
                        Take turns asking correct questions!
                    </p>

                    {score > 0 && (
                        <div className="p-4 bg-green-100 rounded-xl border border-green-200">
                            <p className="text-2xl font-bold text-green-700">Last Score: {score}/{QUESTIONS.length}</p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setStarted(true);
                            setScore(0);
                            setCurrentQuestion(0);
                        }}
                        className="w-full py-4 bg-[#FF2171] text-white rounded-xl font-bold shadow-lg hover:bg-[#9D174D] hover:scale-105 transition-all text-xl border-2 border-white/20"
                    >
                        Start Quiz 💖
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 h-full flex flex-col justify-center">
            <div className="glass-card p-8 min-h-[400px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-love-blush">
                    <motion.div
                        className="h-full bg-love-crimson"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-center mb-8">
                    <span className="px-4 py-1 bg-love-rose/10 text-love-crimson rounded-full font-bold text-sm">
                        Question {currentQuestion + 1}/{QUESTIONS.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-love-gold" />
                        <span className="font-bold text-love-charcoal">{score}</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <h2 className="text-3xl font-playfair font-bold text-love-charcoal">
                            {QUESTIONS[currentQuestion]}
                        </h2>

                        {!showAnswer ? (
                            <div className="space-y-4 w-full">
                                <p className="text-love-charcoal/60 italic">
                                    Player 1: Ask this question to Player 2!
                                </p>
                                <button
                                    onClick={() => setShowAnswer(true)}
                                    className="w-full py-4 bg-white border-2 border-love-rose text-love-crimson rounded-xl font-bold hover:bg-love-rose hover:text-white transition-all text-lg"
                                >
                                    Reveal Answer Phase 🫣
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-4">
                                <p className="text-xl font-medium text-love-charcoal">
                                    Did they get it right?
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleCorrect}
                                        className="py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-6 h-6" /> Yes!
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <X className="w-6 h-6" /> No
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
