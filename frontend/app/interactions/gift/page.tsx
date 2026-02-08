'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Send, Gift, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import JSConfetti from 'js-confetti';
import GiftShareModal from '@/components/GiftShareModal';
import { GiftData } from '@/lib/shareGift';

const GIFTS = [
    { id: 'rose', name: 'Virtual Rose', emoji: '🌹', desc: 'A symbol of love' },
    { id: 'chocolate', name: 'Box of Chocolates', emoji: '🍫', desc: 'Sweet treats for you' },
    { id: 'letter', name: 'Love Note', emoji: '💌', desc: 'From my heart to yours' },
    { id: 'ring', name: 'Promise Ring', emoji: '💍', desc: 'A promise of forever' },
    { id: 'bear', name: 'Teddy Bear', emoji: '🧸', desc: 'To hug when I\'m not there' },
    { id: 'coffee', name: 'Coffee Date', emoji: '☕', desc: 'Let\'s meet for coffee?' },
    { id: 'pizza', name: 'Pizza Night', emoji: '🍕', desc: 'Pizza and movies on me!' },
    { id: 'star', name: 'A Star', emoji: '⭐', desc: 'Because you shine brightest' },
];

export default function GiftShopPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [selectedGift, setSelectedGift] = useState<string | null>(null);
    const [recipientName, setRecipientName] = useState('');
    const [note, setNote] = useState('');
    const [step, setStep] = useState<'select' | 'compose' | 'share'>('select');
    const [showShareModal, setShowShareModal] = useState(false);

    const handleNext = () => {
        if (step === 'select' && selectedGift) setStep('compose');
        else if (step === 'compose' && recipientName) handleShare();
    };

    const handleShare = () => {
        const gift = GIFTS.find(g => g.id === selectedGift);
        if (!gift) return;

        setShowShareModal(true);
        triggerConfetti();
    };

    const triggerConfetti = () => {
        const confetti = new JSConfetti();
        confetti.addConfetti({
            emojis: ['🎁', '💕', '🌹', '✨'],
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button
                onClick={() => step === 'select' ? router.back() : setStep(prev => prev === 'share' ? 'compose' : 'select')}
                className="mb-6 flex items-center gap-2 text-love-charcoal/60 hover:text-love-charcoal transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-playfair font-bold text-love-charcoal mb-4">
                    🎁 Gift Shop
                </h1>
                <p className="text-love-charcoal/70">
                    Send a meaningful digital gift to brighten someone's day.
                </p>
            </motion.div>

            {step === 'select' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {GIFTS.map((gift) => (
                        <motion.button
                            key={gift.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedGift(gift.id)}
                            className={`p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-3 ${selectedGift === gift.id
                                ? 'bg-love-rose/10 border-love-rose shadow-lg'
                                : 'bg-white border-love-blush hover:border-love-rose/50 confirm-selection'
                                }`}
                        >
                            <span className="text-5xl">{gift.emoji}</span>
                            <div>
                                <h3 className="font-bold text-love-charcoal">{gift.name}</h3>
                                <p className="text-xs text-love-charcoal/60">{gift.desc}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {step === 'compose' && (
                <div className="max-w-md mx-auto glass-card p-8">
                    <div className="text-center mb-6">
                        <span className="text-6xl mb-4 block">
                            {GIFTS.find(g => g.id === selectedGift)?.emoji}
                        </span>
                        <h3 className="font-bold text-xl text-love-charcoal">
                            Sending {GIFTS.find(g => g.id === selectedGift)?.name}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-love-charcoal mb-1">To (Name)</label>
                            <input
                                type="text"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50"
                                placeholder="e.g., Alex"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-love-charcoal mb-1">Personal Note</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50 h-32 resize-none"
                                placeholder="Write something sweet..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 'share' && (
                <div className="max-w-md mx-auto text-center space-y-6">
                    <div className="glass-card p-8 bg-white border-2 border-love-gold/20">
                        <h3 className="font-playfair font-bold text-2xl text-love-charcoal mb-2">Ready to Send!</h3>
                        <p className="text-love-charcoal/60 mb-6">Choose how you want to deliver your gift.</p>

                        <button
                            onClick={handleShare}
                            className="w-full py-4 bg-gradient-to-r from-love-rose to-love-crimson text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-3"
                        >
                            <Send className="w-5 h-5" />
                            Share Your Gift
                        </button>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            <GiftShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                gift={{
                    giftName: GIFTS.find(g => g.id === selectedGift)?.name || '',
                    giftEmoji: GIFTS.find(g => g.id === selectedGift)?.emoji || '🎁',
                    message: note,
                    senderName: session?.user?.name || 'Someone special',
                    recipientName: recipientName,
                    giftUrl: typeof window !== 'undefined' ? window.location.origin + '/interactions/gift' : ''
                }}
            />

            {step !== 'share' && (
                <div className="mt-8 text-center">
                    <button
                        onClick={handleNext}
                        disabled={step === 'select' ? !selectedGift : !recipientName}
                        className="px-12 py-3 bg-[#FF5090] text-white rounded-xl font-bold shadow-lg hover:bg-[#E02E6E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next Step
                    </button>
                </div>
            )}
        </div>
    );
}
