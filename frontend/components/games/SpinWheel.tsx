'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SpinWheelProps {
    segments: string[];
    onResult: (result: string) => void;
    colors?: string[];
}

export default function SpinWheel({ segments, onResult, colors }: SpinWheelProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<string | null>(null);

    const defaultColors = [
        '#DC143C', '#FF1493', '#FF69B4', '#FFB6C1',
        '#FFC0CB', '#DB7093', '#C71585', '#FF6347'
    ];

    const segmentColors = colors || defaultColors;
    const segmentAngle = 360 / segments.length;

    const spin = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setResult(null);

        // Random rotations between 5-10 full spins + random segment
        const spins = 5 + Math.random() * 5;
        const randomAngle = Math.random() * 360;
        const totalRotation = spins * 360 + randomAngle;

        setRotation(rotation + totalRotation);

        // Determine result after animation
        setTimeout(() => {
            const finalAngle = (rotation + totalRotation) % 360;
            const segmentIndex = Math.floor((360 - finalAngle) / segmentAngle) % segments.length;
            const chosenSegment = segments[segmentIndex];

            setResult(chosenSegment);
            onResult(chosenSegment);
            setIsSpinning(false);
        }, 4000);
    };

    return (
        <div className="flex flex-col items-center gap-8">
            {/* Spin Wheel */}
            <div className="relative">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-love-crimson drop-shadow-lg" />
                </div>

                {/* Wheel */}
                <motion.div
                    className="relative w-80 h-80 rounded-full shadow-2xl overflow-hidden border-8 border-white"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 4, ease: "easeOut" }}
                >
                    {segments.map((segment, index) => {
                        const angle = index * segmentAngle;
                        const nextAngle = (index + 1) * segmentAngle;
                        const midAngle = (angle + nextAngle) / 2;

                        return (
                            <div
                                key={index}
                                className="absolute w-full h-full"
                                style={{
                                    transform: `rotate(${angle}deg)`,
                                    clipPath: `polygon(50% 50%, 100% 0%, 100% 100%)`
                                }}
                            >
                                <div
                                    className="w-full h-full flex items-center justify-end pr-12"
                                    style={{
                                        background: segmentColors[index % segmentColors.length],
                                        clipPath: `polygon(50% 50%, 100% 0%, 100% ${100 * (segmentAngle / 360)}%)`
                                    }}
                                >
                                    <span
                                        className="text-white font-bold text-sm rotate-[-45deg] whitespace-nowrap"
                                        style={{
                                            transform: `rotate(${segmentAngle / 2}deg)`
                                        }}
                                    >
                                        {segment}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-love-gold to-yellow-600 rounded-full shadow-xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                </motion.div>
            </div>

            {/* Spin Button */}
            <button
                onClick={spin}
                disabled={isSpinning}
                className="px-8 py-4 bg-love-crimson text-white rounded-full font-bold text-lg hover:bg-love-rose disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-love-crimson/30 hover:scale-105 active:scale-95"
            >
                {isSpinning ? 'Spinning...' : 'SPIN!'}
            </button>

            {/* Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="glass-card p-6 text-center border-2 border-love-gold/30"
                    >
                        <p className="text-sm text-love-charcoal/60 mb-2">You got:</p>
                        <p className="text-2xl font-bold text-love-crimson">{result}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
