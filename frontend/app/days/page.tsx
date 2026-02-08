'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Flower2, Mail, Gift, Heart, User, Lock, Smile, Star,
    ArrowRight, Sparkles
} from 'lucide-react';

const DAYS_RITUALS = [
    {
        id: 'rose',
        name: 'Rose Day',
        date: 'Feb 7',
        icon: <Flower2 className="w-8 h-8 text-red-500" />,
        action: 'Enter Rose Garden',
        desc: 'Plant token roses and send them to loved ones.',
        color: 'bg-red-50 border-red-200',
        gradient: 'from-red-500 to-rose-600'
    },
    {
        id: 'propose',
        name: 'Propose Day',
        date: 'Feb 8',
        icon: <Mail className="w-8 h-8 text-amber-500" />,
        action: 'Open Envelope Room',
        desc: 'Write secret letters and seal them for later.',
        color: 'bg-amber-50 border-amber-200',
        gradient: 'from-amber-500 to-orange-600'
    },
    {
        id: 'chocolate',
        name: 'Chocolate Day',
        date: 'Feb 9',
        icon: <Gift className="w-8 h-8 text-brown-500" />,
        action: 'Curate Sweet Box',
        desc: 'Assemble a custom box of virtual chocolates.',
        color: 'bg-orange-50 border-orange-200',
        gradient: 'from-yellow-700 to-orange-800' // Brownish
    },
    {
        id: 'teddy',
        name: 'Teddy Day',
        date: 'Feb 10',
        icon: <User className="w-8 h-8 text-pink-400" />, // Teddy often represented by User/Toy
        action: 'Design Cuddle Buddy',
        desc: 'Customize a teddy bear with unique styles.',
        color: 'bg-pink-50 border-pink-200',
        gradient: 'from-pink-400 to-rose-400'
    },
    {
        id: 'promise',
        name: 'Promise Day',
        date: 'Feb 11',
        icon: <Lock className="w-8 h-8 text-indigo-500" />,
        action: 'Visit Promise Vault',
        desc: 'Lock your promises and secure your bond.',
        color: 'bg-indigo-50 border-indigo-200',
        gradient: 'from-indigo-500 to-purple-600'
    },
    {
        id: 'hug',
        name: 'Hug Day',
        date: 'Feb 12',
        icon: <Smile className="w-8 h-8 text-orange-400" />,
        action: 'Send Warm Hug',
        desc: 'Choose a hug type and send warmth.',
        color: 'bg-orange-50 border-orange-200',
        gradient: 'from-orange-400 to-red-400'
    },
    {
        id: 'kiss',
        name: 'Kiss Day',
        date: 'Feb 13',
        icon: <Sparkles className="w-8 h-8 text-rose-500" />,
        action: 'Share Reaction',
        desc: 'Send fun, filmy, or shy kiss reactions.',
        color: 'bg-rose-50 border-rose-200',
        gradient: 'from-rose-500 to-pink-600'
    },
    {
        id: 'valentine',
        name: 'Valentine\'s Day',
        date: 'Feb 14',
        icon: <Heart className="w-8 h-8 text-red-600 fill-current" />,
        action: 'Walk Memory Hall',
        desc: 'Relive your week\'s beautiful moments.',
        color: 'bg-red-50 border-red-200',
        gradient: 'from-red-600 to-pink-600'
    }
];

export default function DaysPage() {
    return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-12">

            {/* Intro */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl md:text-6xl font-playfair font-black text-love-charcoal tracking-tight">
                    The Week of Love
                </h1>
                <p className="text-xl text-love-charcoal/70 max-w-2xl mx-auto font-outfit font-light">
                    Every day is a new chapter. Enter a unique digital room to create memories.
                </p>
            </motion.div>

            {/* Rituals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {DAYS_RITUALS.map((day, idx) => (
                    <Link href={`/days/${day.id}`} key={day.id} className="group">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className={`h-full p-6 rounded-3xl border-2 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between bg-white/90 backdrop-blur-md ${day.color} hover:border-love-rose/50 group-hover:scale-[1.02]`}
                        >
                            {/* Hover Gradient Background - Made stronger */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${day.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform group-hover:shadow-md">
                                        {day.icon}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-love-charcoal/50 group-hover:text-white/90 transition-colors bg-white/50 group-hover:bg-white/20 px-2 py-1 rounded-lg">
                                        {day.date}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-playfair font-bold text-love-charcoal mb-2 group-hover:text-white transition-colors">
                                    {day.name}
                                </h2>
                                <p className="text-sm text-love-charcoal/70 mb-6 group-hover:text-white/90 transition-colors font-medium leading-relaxed">
                                    {day.desc}
                                </p>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-love-charcoal group-hover:text-love-crimson transition-all mt-auto p-3 rounded-xl group-hover:bg-white group-hover:shadow-lg w-fit">
                                <span className="uppercase tracking-wider">{day.action}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

        </div>
    );
}
