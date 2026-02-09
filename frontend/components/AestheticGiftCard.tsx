import { GiftData } from '@/lib/shareGift';
import { Heart, Sparkles } from 'lucide-react';
import React, { forwardRef } from 'react';

interface AestheticGiftCardProps {
    gift: GiftData;
}

const AestheticGiftCard = forwardRef<HTMLDivElement, AestheticGiftCardProps>(({ gift }, ref) => {
    return (
        <div
            ref={ref}
            className="w-[400px] h-[600px] bg-gradient-to-br from-[#ff9a9e] via-[#fad0c4] to-[#ffd1ff] relative overflow-hidden flex items-center justify-center p-8 text-[#2B2D42]"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
                <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-white mix-blend-overlay rounded-full blur-3xl" />
                <div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-[#ffc3a0] mix-blend-overlay rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 transform" />
            </div>

            {/* Main Card */}
            <div className="relative w-full h-full bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/60 shadow-2xl flex flex-col items-center justify-between p-8 text-center overflow-hidden z-10">

                {/* Header */}
                <div className="w-full flex flex-col items-center gap-2 mt-2">
                    <span className="uppercase tracking-[0.2em] text-[#d6336c] text-[10px] font-bold flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-white/40">
                        <Sparkles size={12} /> Special Delivery <Sparkles size={12} />
                    </span>
                    <h1
                        className="text-4xl font-bold mt-2 text-[#862e9c]"
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                        A Gift for You
                    </h1>
                </div>

                {/* Gift Content */}
                <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#ff9a9e] to-[#fbc2eb] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 scale-110" />
                        <div className="relative text-[120px] filter drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500 hover:rotate-6 cursor-default select-none">
                            {gift.giftEmoji}
                        </div>
                    </div>

                    <h2
                        className="text-3xl font-bold text-[#5f3dc4]"
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                        {gift.giftName}
                    </h2>

                    <div className="bg-white/50 p-6 rounded-2xl w-full border border-white/60 shadow-inner relative mt-4">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                            Message
                        </div>
                        <p
                            className="text-gray-800 italic font-medium leading-relaxed text-lg"
                            style={{ fontFamily: 'var(--font-playfair), serif' }}
                        >
                            "{gift.message}"
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full mt-auto space-y-5 pt-4">
                    <div className="flex justify-between items-center w-full text-sm text-[#862e9c] bg-white/30 p-4 rounded-xl border border-white/40">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] opacity-60 uppercase tracking-wider font-bold">From</span>
                            <span className="font-bold text-lg leading-none">{gift.senderName}</span>
                        </div>
                        <Heart className="text-[#f06595] fill-[#f06595] w-8 h-8 animate-pulse drop-shadow-lg" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] opacity-60 uppercase tracking-wider font-bold">To</span>
                            <span className="font-bold text-lg leading-none">{gift.recipientName || 'You'}</span>
                        </div>
                    </div>

                    <div className="w-full flex justify-between items-center text-[10px] text-gray-500 font-medium opacity-70 px-2 pb-2">
                        <span>Sent via <strong>Valora</strong></span>
                        <span>heartsync.app</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

AestheticGiftCard.displayName = 'AestheticGiftCard';

export default AestheticGiftCard;
