'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Heart, Sparkles, Copy, RefreshCw, Send } from 'lucide-react';
import JSConfetti from 'js-confetti';

export default function LoveLetterPage() {
    const [formData, setFormData] = useState({
        name: '',
        tone: 'romantic',
        occasion: 'valentine',
        relationshipLength: 'years',
        memory: ''
    });
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [loading, setLoading] = useState(false);

    const generateLetter = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setGeneratedLetter('');

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Advanced Templating System
        const templates: Record<string, string[]> = {
            romantic: [
                `My Dearest ${formData.name},\n\nFrom the moment we met, my life changed forever. ${formData.relationshipLength === 'new' ? "Even though it's only been a short while," : "Over all these years,"} you've become my anchor and my sky.\n\n${formData.memory ? `I still smile when I think about ${formData.memory}. That moment is etched in my heart.` : ''}\n\nI promise to love you more with every passing sunrise.\n\nForever yours,`,
                `To my soulmate ${formData.name},\n\nYou are the poetry I never knew how to write. ${formData.occasion === 'anniversary' ? "Happy Anniversary, my love." : "Just wanted to remind you how special you are."}\n\nThank you for being you.\n\nWith endless love,`
            ],
            funny: [
                `Hey ${formData.name},\n\nI love you more than I love sleeping in, and you know how much I love sleep. ${formData.relationshipLength === 'years' ? "How have you put up with me for this long?!" : "I think we're stuck with each other now."}\n\n${formData.memory ? `Remember ${formData.memory}? Yeah, I'm still laughing about that.` : ''}\n\nYou're my favorite weirdo.\n\nCheers,`,
                `Yo ${formData.name},\n\nRoses are red, violets are blue, I'm terrible at poems but I'm great at loving you. (Please laugh).\n\nLet's order pizza and do nothing together forever.\n\nLove,`
            ],
            spicy: [
                `To my irresistible ${formData.name},\n\nJust thinking about you makes my heart race. ${formData.occasion === 'valentine' ? "You're the hottest Valentine I could ask for." : "You've got this magnetic pull I can't resist."}\n\n${formData.memory ? `I can't stop thinking about ${formData.memory}...` : ''}\n\nCan't wait to see you later.\n\nYours hungrily,`,
                `Hey beautiful/handsome,\n\nYou. Me. Tonight. I have a few ideas involving... well, let's just say I'm looking forward to it.\n\nOnly for you,`
            ],
            poetic: [
                `My Beloved ${formData.name},\n\nIn the vast garden of existence, you are the rarest bloom. ${formData.relationshipLength === 'forever' ? "Our souls have known each other for lifetimes." : "You have brought color to my monochrome world."}\n\n${formData.memory ? `Like the memory of ${formData.memory}, your essence lingers sweetly in my mind.` : ''}\n\nI am eternally grateful for your light.\n\nYours eternally,`
            ]
        };

        const options = templates[formData.tone] || templates['romantic'];
        const randomLetter = options[Math.floor(Math.random() * options.length)];

        setGeneratedLetter(randomLetter);
        setLoading(false);
        const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti({ emojis: ['📜', '✍️', '❤️', '🔥'] });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLetter);
        alert('Letter copied to clipboard! 💌');
    };

    return (
        <div className="max-w-4xl mx-auto py-2 px-2 h-full flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4 flex-shrink-0"
            >
                <div className="inline-block p-2 rounded-full bg-love-rose/10 mb-2">
                    <PenTool className="w-6 h-6 text-love-crimson" />
                </div>
                <h1 className="text-2xl md:text-3xl font-playfair font-bold text-love-charcoal mb-1">
                    AI Love Letter Writer 2.0
                </h1>
                <p className="text-love-charcoal/70 text-sm">
                    Now smarter, spicier, and more personal.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4 flex-grow overflow-hidden">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-4 h-full flex flex-col justify-center overflow-y-auto custom-scrollbar"
                >
                    <form onSubmit={generateLetter} className="space-y-3">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-love-charcoal mb-1">Who is this for?</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. My Crush, Partner's Name"
                                className="w-full px-4 py-2 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50 text-sm"
                            />
                        </div>

                        {/* Tone */}
                        <div>
                            <label className="block text-xs font-bold text-love-charcoal mb-1">Vibe/Tone</label>
                            <div className="grid grid-cols-4 gap-1">
                                {['romantic', 'funny', 'poetic', 'spicy'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tone: t })}
                                        className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all ${formData.tone === t
                                            ? 'bg-love-crimson text-white shadow-md'
                                            : 'bg-white/50 text-love-charcoal hover:bg-love-blush'
                                            }`}
                                    >
                                        {t === 'spicy' ? '🔥 Spicy' : t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Occasion */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-bold text-love-charcoal mb-1">Occasion</label>
                                <select
                                    value={formData.occasion}
                                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                                    className="w-full px-2 py-2 rounded-xl border border-love-blush outline-none bg-white/50 text-sm"
                                >
                                    <option value="valentine">Valentine's Day</option>
                                    <option value="anniversary">Anniversary</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="apology">Apology</option>
                                    <option value="just_because">Just Because</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-love-charcoal mb-1">How long?</label>
                                <select
                                    value={formData.relationshipLength}
                                    onChange={(e) => setFormData({ ...formData, relationshipLength: e.target.value })}
                                    className="w-full px-2 py-2 rounded-xl border border-love-blush outline-none bg-white/50 text-sm"
                                >
                                    <option value="new">New Love</option>
                                    <option value="months">Few Months</option>
                                    <option value="years">Years</option>
                                    <option value="forever">Feels like forever</option>
                                </select>
                            </div>
                        </div>

                        {/* Memory */}
                        <div>
                            <label className="block text-xs font-bold text-love-charcoal mb-1">Special Memory (Optional)</label>
                            <textarea
                                value={formData.memory}
                                onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
                                placeholder="e.g. Our trip to Paris, or when we burnt the toast..."
                                className="w-full px-4 py-2 h-16 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50 text-sm resize-none"
                            />
                        </div>

                        <div className="relative z-20 pt-2">
                            <button
                                type="submit"
                                disabled={loading || !formData.name}
                                className="w-full py-3 bg-[#FF5090] text-white rounded-xl font-bold shadow-lg hover:bg-[#E02E6E] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border-2 border-white/20 hover:-translate-y-1"
                                style={{ backgroundColor: '#FF5090', color: 'white' }}
                            >
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 fill-current" />
                                )}
                                <span className="text-white font-bold">{loading ? 'AI is thinking...' : 'Generate Magic'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Result Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-love-rose/5 rounded-3xl transform rotate-3" />
                    <div className="glass-card p-4 h-full flex flex-col relative bg-white/70">
                        <div className="flex-1 font-playfair text-lg leading-relaxed text-love-charcoal italic p-6 border-l-4 border-love-rose/20 bg-love-champagne/10 rounded-r-lg overflow-y-auto">
                            {generatedLetter ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="whitespace-pre-line"
                                >
                                    {generatedLetter}
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-love-charcoal/40 text-center gap-4">
                                    <Heart className="w-16 h-16 opacity-20 animate-pulse-slow" />
                                    <p className="font-outfit not-italic">Fill the details to craft your love note...</p>
                                </div>
                            )}
                        </div>

                        {generatedLetter && (
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 py-3 bg-love-charcoal text-white rounded-lg font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                                >
                                    <Copy className="w-4 h-4" /> Copy
                                </button>
                                <button
                                    onClick={() => setGeneratedLetter('')}
                                    className="px-4 py-3 bg-white border border-love-blush text-love-crimson rounded-lg hover:bg-love-blush transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
