'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Share2, Shuffle, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PROPOSAL_STYLES } from '@/lib/gameContent';

export default function WhoProposedPage() {
    const router = useRouter();
    const [style, setStyle] = useState(PROPOSAL_STYLES[0]);
    const [friendName, setFriendName] = useState('');
    const [voted, setVoted] = useState(false);

    const nextStyle = () => {
        const random = PROPOSAL_STYLES[Math.floor(Math.random() * PROPOSAL_STYLES.length)];
        setStyle(random);
        setVoted(false);
        setFriendName('');
    };

    const handleVote = () => {
        if (!friendName.trim()) return;
        setVoted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 font-outfit">

            {/* Header */}
            <div className="max-w-md mx-auto flex items-center justify-between mb-8">
                <button onClick={() => router.push('/games')} className="p-2 bg-white rounded-full shadow-sm">
                    <ArrowLeft className="w-6 h-6 text-indigo-600" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤔</span>
                    <h1 className="text-xl font-bold text-gray-800">Who Proposed?</h1>
                </div>
                <div className="w-10" />
            </div>

            <div className="max-w-md mx-auto space-y-6">

                {/* Question Card */}
                <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-indigo-200 rounded-3xl transform rotate-3" />
                    <motion.div
                        key={style.title}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-3xl shadow-xl relative text-center border-4 border-indigo-100"
                    >
                        <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            PROPOSAL STYLE #{Math.floor(Math.random() * 100)}
                        </span>

                        <h2 className="text-3xl font-black text-gray-800 mt-6 mb-2 leading-tight">
                            {style.title}
                        </h2>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed">
                            "{style.desc}"
                        </p>

                        <div className="my-8 w-16 h-1 bg-gray-100 mx-auto rounded-full" />

                        {!voted ? (
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-gray-400 uppercase">
                                    WHICH FRIEND WOULD DO THIS?
                                </p>
                                <input
                                    type="text"
                                    value={friendName}
                                    onChange={(e) => setFriendName(e.target.value)}
                                    placeholder="Type friend's name..."
                                    className="w-full text-center text-xl font-bold border-b-2 border-indigo-200 focus:border-indigo-500 outline-none p-2 bg-transparent placeholder-gray-300"
                                />
                                <button
                                    onClick={handleVote}
                                    disabled={!friendName.trim()}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                                >
                                    TAG THEM 🏷️
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100"
                            >
                                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm font-bold">IT'S TOTALLY</p>
                                <h3 className="text-3xl font-black text-indigo-600 my-2">
                                    {friendName}
                                </h3>
                                <p className="text-xs text-gray-400">
                                    (100% of votes agree)
                                </p>

                                <div className="mt-4 flex gap-2">
                                    <button className="flex-1 py-2 bg-white rounded-lg text-sm font-bold shadow-sm text-gray-600 hover:bg-gray-50">
                                        📸 Screenshot
                                    </button>
                                    <button className="flex-1 py-2 bg-indigo-100 rounded-lg text-sm font-bold shadow-sm text-indigo-600 hover:bg-indigo-200">
                                        <Share2 className="w-4 h-4 inline mr-1" /> Share
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                    <button
                        onClick={nextStyle}
                        className="flex-1 py-4 bg-white rounded-2xl font-bold text-gray-600 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <Shuffle className="w-5 h-5" />
                        Next Scenario
                    </button>
                </div>

            </div>
        </div>
    );
}
