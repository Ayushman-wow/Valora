'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function FloatingHearts() {
    const [hearts, setHearts] = useState<{ id: number; x: number; delay: number; scale: number }[]>([]);

    useEffect(() => {
        // Generate random hearts only on client side to avoid hydration mismatch
        const newHearts = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // Random percentage
            delay: Math.random() * 20, // Random delay
            scale: Math.random() * 0.5 + 0.5, // Random size
        }));
        setHearts(newHearts);
    }, []);

    return (
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="absolute bottom-[-50px] text-love-rose/20 text-4xl"
                    style={{ left: `${heart.x}%` }}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{
                        y: '-110vh',
                        opacity: [0, 0.4, 0],
                        rotate: [0, 45, -45, 0],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        delay: heart.delay,
                        ease: "linear"
                    }}
                >
                    ❤️
                </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-tr from-love-blush/40 via-transparent to-love-champagne/30" />
        </div>
    );
}
