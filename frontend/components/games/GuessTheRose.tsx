'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy } from 'lucide-react';

interface Question {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

const roseQuestions: Question[] = [
    {
        question: "What does a RED rose symbolize?",
        options: ["Friendship", "Love & Passion", "Purity", "Gratitude"],
        correct: 1,
        explanation: "Red roses are the ultimate symbol of love, passion, and romance!"
    },
    {
        question: "What does a YELLOW rose represent?",
        options: ["Jealousy", "Sadness", "Friendship & Joy", "Mystery"],
        correct: 2,
        explanation: "Yellow roses symbolize friendship, joy, and caring - perfect for friends!"
    },
    {
        question: "What does a WHITE rose mean?",
        options: ["Purity & Innocence", "Anger", "Excitement", "Wealth"],
        correct: 0,
        explanation: "White roses represent purity, innocence, and new beginnings!"
    },
    {
        question: "What does a PINK rose signify?",
        options: ["Hatred", "Grace & Admiration", "Fear", "Confusion"],
        correct: 1,
        explanation: "Pink roses convey grace, elegance, and sweet admiration!"
    },
    {
        question: "What does an ORANGE rose symbolize?",
        options: ["Sorrow", "Enthusiasm & Desire", "Loneliness", "Peace"],
        correct: 1,
        explanation: "Orange roses represent enthusiasm, passion, and intense desire!"
    }
];

interface GuessTheRoseProps {
    onComplete: (score: number) => void;
}

export default function GuessTheRose({ onComplete }: GuessTheRoseProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    const question = roseQuestions[currentQuestion];

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(index);
        setShowExplanation(true);

        if (index === question.correct) {
            setScore(score + 20);
        }

        setTimeout(() => {
            if (currentQuestion < roseQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowExplanation(false);
            } else {
                setGameComplete(true);
                onComplete(score + (index === question.correct ? 20 : 0));
            }
        }, 2500);
    };

    if (gameComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 text-center"
            >
                <Trophy className="w-20 h-20 text-love-gold mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-love-crimson mb-2">Game Complete!</h3>
                <p className="text-6xl font-bold text-love-gold mb-4">{score} Points</p>
                <p className="text-love-charcoal/70 mb-6">
                    You've mastered the language of roses! 🌹
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div
                        className="bg-gradient-to-r from-love-rose to-love-crimson h-4 rounded-full transition-all duration-1000"
                        style={{ width: `${(score / 100) * 100}%` }}
                    />
                </div>
                <p className="text-sm text-love-charcoal/60">
                    {score === 100 ? "Perfect score! You're a rose expert! 🏆" :
                        score >= 60 ? "Great job! You know your roses well! 🌹" :
                            "Keep learning about roses! 💐"}
                </p>
            </motion.div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-love-charcoal/60 mb-2">
                    <span>Question {currentQuestion + 1} of {roseQuestions.length}</span>
                    <span>Score: {score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-love-rose h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / roseQuestions.length) * 100}%` }}
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
                    className="glass-card p-8"
                >
                    <h3 className="text-2xl font-bold text-love-charcoal mb-6 text-center">
                        {question.question}
                    </h3>

                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === question.correct;
                            const showResult = selectedAnswer !== null;

                            return (
                                <motion.button
                                    key={index}
                                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                                    onClick={() => handleAnswer(index)}
                                    disabled={selectedAnswer !== null}
                                    className={`
                                        w-full p-4 rounded-xl font-medium text-left transition-all flex items-center justify-between
                                        ${!showResult ? 'bg-white hover:bg-love-blush border-2 border-love-blush' : ''}
                                        ${showResult && isCorrect ? 'bg-green-100 border-2 border-green-500 text-green-800' : ''}
                                        ${showResult && isSelected && !isCorrect ? 'bg-red-100 border-2 border-red-500 text-red-800' : ''}
                                        ${showResult && !isSelected && !isCorrect ? 'bg-gray-100 border-2 border-gray-300 text-gray-500' : ''}
                                        disabled:cursor-not-allowed
                                    `}
                                >
                                    <span>{option}</span>
                                    {showResult && isCorrect && <Check className="w-6 h-6 text-green-600" />}
                                    {showResult && isSelected && !isCorrect && <X className="w-6 h-6 text-red-600" />}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    <AnimatePresence>
                        {showExplanation && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 p-4 bg-love-rose/10 border-2 border-love-rose/30 rounded-xl"
                            >
                                <p className="text-love-charcoal font-medium">
                                    {question.explanation}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
