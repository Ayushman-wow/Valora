'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageCircle, Instagram, Copy, Check, Share2, Image as ImageIcon, Download, Link as LinkIcon, Sparkles } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import {
    shareViaWhatsApp,
    shareViaInstagram,
    shareViaEmail,
    sendGiftEmail,
    shareViaWebShare,
    GiftData
} from '@/lib/shareGift';
import AestheticGiftCard from './AestheticGiftCard';

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
    const [shareMode, setShareMode] = useState<'link' | 'image'>('image');
    const cardRef = useRef<HTMLDivElement>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate image on mount or when switching to image mode
    useEffect(() => {
        if (isOpen && shareMode === 'image' && !generatedImage) {
            // Wait for render
            setTimeout(() => generateImage(), 500);
        }
    }, [isOpen, shareMode]);

    const generateImage = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1.0, pixelRatio: 2 });
            setGeneratedImage(dataUrl);
        } catch (err) {
            console.error('Failed to generate image', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadImage = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.download = `gift-from-${gift.senderName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = generatedImage;
        link.click();
    };

    const handleShareImage = async () => {
        if (!generatedImage) return;

        try {
            const blob = await (await fetch(generatedImage)).blob();
            const file = new File([blob], 'gift.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'A Gift for You!',
                    text: `Checking out this gift from ${gift.senderName}!`,
                });
            } else {
                // Fallback for desktop or unsupported browsers
                handleDownloadImage();
                alert('Image downloaded! Share it manually on your favorite app.');
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            handleDownloadImage();
        }
    };

    const handleWhatsAppShare = () => {
        shareViaWhatsApp(gift);
    };

    const handleInstagramShare = async () => {
        if (shareMode === 'image') {
            await handleShareImage(); // Try native share first for image
        } else {
            const result = await shareViaInstagram(gift);
            if (result.success && result.method === 'clipboard') {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 3000);
            }
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
            shareViaEmail(gift); // Fallback
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-love-rose to-love-crimson p-6 text-white relative flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold font-playfair flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                    Share Your Gift
                                </h2>
                                <p className="text-white/80 text-sm mt-1">Make their day special!</p>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex bg-black/20 p-1 rounded-xl mt-6 mx-auto max-w-xs">
                                <button
                                    onClick={() => setShareMode('image')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${shareMode === 'image' ? 'bg-white text-love-crimson shadow-lg scale-105' : 'text-white/70 hover:text-white'
                                        }`}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Card
                                </button>
                                <button
                                    onClick={() => setShareMode('link')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${shareMode === 'link' ? 'bg-white text-love-crimson shadow-lg scale-105' : 'text-white/70 hover:text-white'
                                        }`}
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    Link
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Image Generation Preview Area */}
                            {shareMode === 'image' && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-full aspect-[2/3] max-h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden">
                                        {/* Original DOM Element (Hidden but rendered for capture) */}
                                        <div className="absolute opacity-0 pointer-events-none transform scale-100 origin-top-left" style={{ top: '-9999px' }}>
                                            <div ref={cardRef}>
                                                <AestheticGiftCard gift={gift} />
                                            </div>
                                        </div>

                                        {/* Preview Image */}
                                        {generatedImage ? (
                                            <img
                                                src={generatedImage}
                                                alt="Gift Card Preview"
                                                className="w-full h-full object-contain shadow-lg rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400 gap-2">
                                                <div className="w-8 h-8 border-2 border-love-rose border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm font-medium">Creating magic...</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleDownloadImage}
                                        disabled={!generatedImage}
                                        className="text-sm text-love-rose font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4" /> Download Image
                                    </button>
                                </div>
                            )}

                            {/* Share Buttons */}
                            <div className="space-y-4">
                                <p className="text-center text-sm font-bold text-gray-500 uppercase tracking-wide">
                                    Share via
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={shareMode === 'image' ? handleShareImage : handleWhatsAppShare}
                                        disabled={shareMode === 'image' && !generatedImage}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group border border-green-100 hover:border-green-300 disabled:opacity-50"
                                    >
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md group-hover:shadow-lg">
                                            {shareMode === 'image' ? <Share2 className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-white" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">
                                            {shareMode === 'image' ? 'Share Image' : 'WhatsApp'}
                                        </span>
                                    </button>

                                    <button
                                        onClick={handleInstagramShare}
                                        disabled={shareMode === 'image' && !generatedImage}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors group border border-pink-100 hover:border-pink-300 disabled:opacity-50"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md group-hover:shadow-lg">
                                            <Instagram className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">
                                            {shareMode === 'image' ? 'Instagram' : 'Instagram'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Link Actions (Only in Link Mode) */}
                            {shareMode === 'link' && (
                                <div className="space-y-4 pt-4 border-t">
                                    {/* Email Section */}
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                            placeholder="recipient@email.com"
                                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-love-rose outline-none text-sm"
                                        />
                                        <button
                                            onClick={handleEmailShare}
                                            disabled={emailSending || !recipientEmail}
                                            className="px-4 py-3 bg-love-crimson text-white rounded-xl font-bold hover:bg-love-rose disabled:opacity-50 transition flex items-center gap-2"
                                        >
                                            {emailSending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Mail className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full py-3 border-2 border-gray-200 rounded-xl font-bold hover:border-love-rose hover:bg-love-blush/20 transition flex items-center justify-center gap-2 text-sm text-gray-600"
                                    >
                                        {copySuccess ? <><Check className="w-4 h-4 text-green-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                                    </button>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
