'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageCircle, Instagram, Copy, Check, Share2 } from 'lucide-react';
import {
    shareViaWhatsApp,
    shareViaInstagram,
    shareViaEmail,
    sendGiftEmail,
    shareViaWebShare,
    GiftData
} from '@/lib/shareGift';

interface GiftShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    gift: GiftData;
}

export default function GiftShareModal({ isOpen, onClose, gift }: GiftShareModalProps) {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleWhatsAppShare = () => {
        shareViaWhatsApp(gift);
    };

    const handleInstagramShare = async () => {
        const result = await shareViaInstagram(gift);
        if (result.success && result.method === 'clipboard') {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        }
    };

    const handleEmailShare = () => {
        if (recipientEmail) {
            handleSendEmail();
        } else {
            shareViaEmail(gift);
        }
    };

    const handleSendEmail = async () => {
        if (!recipientEmail) return;

        setEmailSending(true);
        try {
            await sendGiftEmail(gift, recipientEmail);
            setEmailSent(true);
            setTimeout(() => {
                setEmailSent(false);
                setRecipientEmail('');
            }, 3000);
        } catch (error) {
            console.error('Email error:', error);
        } finally {
            setEmailSending(false);
        }
    };

    const handleWebShare = async () => {
        await shareViaWebShare(gift);
    };

    const handleCopyLink = async () => {
        try {
            const shareText = `${gift.giftEmoji} Gift from ${gift.senderName}: ${gift.giftName}\n\n"${gift.message}"\n\n${gift.giftUrl || window.location.href}`;
            await navigator.clipboard.writeText(shareText);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-love-rose to-love-crimson p-6 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="text-center">
                                <div className="text-6xl mb-2">{gift.giftEmoji}</div>
                                <h2 className="text-2xl font-bold">Share Your Gift</h2>
                                <p className="text-white/80 text-sm mt-1">{gift.giftName}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Quick Share Buttons */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={handleWhatsAppShare}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">WhatsApp</span>
                                </button>

                                <button
                                    onClick={handleInstagramShare}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Instagram className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">Instagram</span>
                                </button>

                                <button
                                    onClick={handleWebShare}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Share2 className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">More</span>
                                </button>
                            </div>

                            {/* Email Section */}
                            <div className="border-t pt-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Send via Email
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        placeholder="recipient@email.com"
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-love-rose outline-none"
                                    />
                                    <button
                                        onClick={handleEmailShare}
                                        disabled={emailSending || !recipientEmail}
                                        className="px-6 py-3 bg-love-crimson text-white rounded-xl font-bold hover:bg-love-rose disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                                    >
                                        {emailSending ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : emailSent ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Mail className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {emailSent && (
                                    <p className="text-green-600 text-sm mt-2 font-medium">
                                        ✓ Email sent successfully!
                                    </p>
                                )}
                            </div>

                            {/* Copy Link */}
                            <button
                                onClick={handleCopyLink}
                                className="w-full py-3 border-2 border-gray-200 rounded-xl font-bold hover:border-love-rose hover:bg-love-blush/20 transition flex items-center justify-center gap-2"
                            >
                                {copySuccess ? (
                                    <>
                                        <Check className="w-5 h-5 text-green-600" />
                                        <span className="text-green-600">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        <span>Copy Gift Message</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
