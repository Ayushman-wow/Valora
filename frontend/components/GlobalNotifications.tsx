'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Heart, Trophy, Sparkles } from 'lucide-react';
import { SOCKET_URL } from '@/config/env';

export default function GlobalNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('new_confession', (confession) => {
            addNotification({
                id: Date.now(),
                type: 'confession',
                message: `New confession whispered...`,
                icon: <Heart className="text-love-rose fill-love-rose" />
            });
        });

        socket.on('new_high_score', (entry) => {
            addNotification({
                id: Date.now(),
                type: 'game',
                message: `${entry.username} scored ${entry.score} in ${entry.gameType}!`,
                icon: <Trophy className="text-love-gold" />
            });
        });

        return () => { socket.disconnect(); };
    }, []);

    const addNotification = (notif: any) => {
        setNotifications(prev => [...prev.slice(-2), notif]); // Keep only last 3
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
        }, 5000);
    };

    return (
        <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {notifications.map(n => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="glass-card px-6 py-4 flex items-center gap-4 border-love-rose/20 shadow-2xl bg-white/90 backdrop-blur-md min-w-[280px]"
                    >
                        <div className="p-2 bg-love-blush/30 rounded-full">
                            {n.icon}
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-love-charcoal/40">
                                {n.type === 'confession' ? 'Love Wall Update' : 'Hall of Fame'}
                            </p>
                            <p className="text-sm font-bold text-love-charcoal leading-tight">
                                {n.message}
                            </p>
                        </div>
                        <Sparkles className="w-4 h-4 text-love-gold/30 ml-auto" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
