'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Hand, Sparkles, Cookie, Mail, Send, X } from 'lucide-react';
import JSConfetti from 'js-confetti';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/config/env';

interface SendInteractionProps {
    toUsername: string;
    toAlias: string;
    onClose?: () => void;
    onSuccess?: () => void;
}

const interactionTypes = [
    { id: 'hand-hold', label: 'Hand Hold', emoji: '🤝', color: '#FF69B4', icon: Hand },
    { id: 'head-pat', label: 'Head Pat', emoji: '🫶', color: '#FFB6C1', icon: Sparkles },
    { id: 'forehead-kiss', label: 'Forehead Kiss', emoji: '💗', color: '#FF1493', icon: Heart },
    { id: 'hug', label: 'Virtual Hug', emoji: '🤗', color: '#FFC0CB', icon: Heart },
    { id: 'poke', label: 'Playful Poke', emoji: '😄', color: '#FFDAB9', icon: Sparkles },
    { id: 'rose', label: 'Send Rose', emoji: '🌹', color: '#DC143C', icon: Heart },
    { id: 'chocolate', label: 'Send Chocolate', emoji: '🍫', color: '#8B4513', icon: Cookie },
    { id: 'letter', label: 'Love Letter', emoji: '💌', color: '#FF6EB4', icon: Mail }
];

export default function SendInteraction({ toUsername, toAlias, onClose, onSuccess }: SendInteractionProps) {
    const { data: session } = useSession();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        if (!selectedType) return;

        setSending(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/interactions/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': session?.user?.email || ''
                },
                body: JSON.stringify({
                    toUsername,
                    type: selectedType,
                    message
                })
            });

            const data = await response.json();

            if (response.ok) {
                const confetti = new JSConfetti();
                confetti.addConfetti({
                    emojis: [interactionTypes.find(t => t.id === selectedType)?.emoji || '💕'],
                    emojiSize: 60,
                    confettiNumber: 30
                });

                if (onSuccess) onSuccess();
                setTimeout(() => {
                    if (onClose) onClose();
                }, 1500);
            } else {
                setError(data.msg || 'Failed to send interaction');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const selectedInteraction = interactionTypes.find(t => t.id === selectedType);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-love-charcoal">Send Interaction</h2>
                        <p className="text-love-charcoal/60">To: <span className="font-medium">{toAlias}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-love-charcoal/50 hover:text-love-crimson transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Interaction Types */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-love-charcoal mb-3">
                        Choose an interaction:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {interactionTypes.map((type) => (
                            <motion.button
                                key={type.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedType(type.id)}
                                className={`
                                    p-4 rounded-xl transition-all flex flex-col items-center gap-2 text-center
                                    ${selectedType === type.id
                                        ? 'bg-love-crimson text-white shadow-lg'
                                        : 'bg-white hover:bg-love-blush border-2 border-love-blush'
                                    }
                                `}
                            >
                                <span className="text-3xl">{type.emoji}</span>
                                <span className="text-xs font-medium">{type.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Message (Optional) */}
                {selectedType && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6"
                    >
                        <label className="block text-sm font-bold text-love-charcoal mb-2">
                            Add a sweet message (optional):
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={200}
                            placeholder="Say something nice... 💕"
                            className="w-full px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50 min-h-[100px] resize-none"
                        />
                        <p className="text-xs text-love-charcoal/50 mt-1">
                            {message.length}/200 characters
                        </p>
                    </motion.div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Preview */}
                {selectedType && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 bg-gradient-to-r from-love-rose/10 to-love-crimson/10 rounded-xl border-2 border-love-rose/20"
                    >
                        <p className="text-sm text-love-charcoal/70 mb-2">Preview:</p>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{selectedInteraction?.emoji}</span>
                            <div>
                                <p className="font-bold text-love-charcoal">
                                    {selectedInteraction?.label}
                                </p>
                                {message && (
                                    <p className="text-sm text-love-charcoal/70 italic">
                                        "{message}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!selectedType || sending}
                        className="flex-1 px-6 py-3 bg-love-crimson text-white rounded-xl font-bold hover:bg-love-rose disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-love-crimson/20 flex items-center justify-center gap-2"
                    >
                        {sending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send {selectedInteraction?.emoji}
                            </>
                        )}
                    </button>
                </div>

                {/* Info */}
                <p className="mt-4 text-xs text-center text-love-charcoal/50">
                    💡 The recipient can accept or decline this interaction
                </p>
            </motion.div>
        </motion.div>
    );
}
