'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, PenTool, Send, Trash2, Copy, Heart, Lightbulb, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/config/env';

export default function AIPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'letter' | 'cupid'>('letter');

    // Letter States
    const [recipient, setRecipient] = useState('');
    const [mood, setMood] = useState('Romantic');
    const [style, setStyle] = useState('Classic');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Cupid States
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'cupid', text: string }[]>([]);
    const [isThinking, setIsThinking] = useState(false);

    const generateLetter = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/ai/generate-letter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: recipient, mood, style, sender: session?.user?.name })
            });
            const data = await res.json();
            setGeneratedLetter(data.letter);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const sendToCupid = async () => {
        if (!chatInput.trim()) return;
        const userMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsThinking(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/ai/cupid-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setChatHistory(prev => [...prev, { role: 'cupid', text: data.reply }]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsThinking(false);
        }
    };

    const copyLetter = () => {
        navigator.clipboard.writeText(generatedLetter);
        alert('Letter copied to clipboard! 📋');
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 space-y-12 font-outfit">
            {/* Header */}
            <header className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex p-4 bg-love-crimson/10 rounded-full mb-2"
                >
                    <Sparkles className="w-10 h-10 text-love-crimson" />
                </motion.div>
                <h1 className="text-5xl font-playfair font-black text-love-charcoal tracking-tight">AI Love Assistant</h1>
                <p className="text-love-charcoal/50 text-xl max-w-2xl mx-auto">Enhance your expressions with the power of AI. From heart-crafted letters to relationship advice.</p>
            </header>

            {/* Tab Switcher */}
            <div className="flex justify-center">
                <div className="bg-love-blush/30 p-2 rounded-[2rem] flex gap-2 border border-white">
                    <button
                        onClick={() => setActiveTab('letter')}
                        className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'letter' ? 'bg-love-crimson text-white shadow-lg' : 'text-love-charcoal/60 hover:text-love-crimson'}`}
                    >
                        <PenTool className="w-4 h-4" /> Letter Assistant
                    </button>
                    <button
                        onClick={() => setActiveTab('cupid')}
                        className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'cupid' ? 'bg-love-crimson text-white shadow-lg' : 'text-love-charcoal/60 hover:text-love-crimson'}`}
                    >
                        <MessageCircle className="w-4 h-4" /> Cupid ChatBot
                    </button>
                </div>
            </div>

            <main>
                <AnimatePresence mode="wait">
                    {activeTab === 'letter' ? (
                        <motion.div
                            key="letter"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid md:grid-cols-2 gap-12"
                        >
                            {/* Controls */}
                            <div className="glass-card p-10 space-y-8 bg-white/70">
                                <h2 className="text-2xl font-bold text-love-crimson flex items-center gap-2">
                                    <Lightbulb className="w-6 h-6" /> Generator Settings
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-love-charcoal/40 uppercase tracking-widest ml-1">Recipient Name</label>
                                        <input
                                            type="text"
                                            value={recipient}
                                            onChange={e => setRecipient(e.target.value)}
                                            placeholder="e.g., My Darling, Bestie..."
                                            className="w-full px-6 py-4 bg-white/50 border-2 border-love-blush focus:border-love-rose rounded-2xl outline-none font-bold text-love-charcoal text-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-love-charcoal/40 uppercase tracking-widest ml-1">Expressive Mood</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Romantic', 'Playful', 'Soulful', 'Funny'].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setMood(m)}
                                                    className={`py-3 rounded-2xl font-bold border-2 transition-all ${mood === m ? 'bg-love-rose/10 border-love-rose text-love-rose shadow-sm' : 'bg-white border-transparent text-love-charcoal/40 border-love-blush/20'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={generateLetter}
                                    disabled={isGenerating}
                                    className="w-full py-5 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-[2rem] font-black text-xl shadow-xl hover:shadow-love-rose/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                                    {isGenerating ? 'Weaving Magic...' : 'Generate Letter'}
                                </button>
                            </div>

                            {/* Result */}
                            <div className="relative">
                                <AnimatePresence>
                                    {generatedLetter ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="glass-card p-12 bg-[#FFF9FB] border-dashed border-2 border-love-rose/30 shadow-2xl h-full min-h-[400px] flex flex-col"
                                        >
                                            <div className="flex-1 font-playfair text-xl leading-relaxed text-love-charcoal whitespace-pre-wrap italic">
                                                {generatedLetter}
                                            </div>
                                            <div className="flex gap-4 mt-8">
                                                <button onClick={copyLetter} className="flex-1 py-4 bg-white border-2 border-love-rose text-love-rose rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-love-rose hover:text-white transition-all">
                                                    <Copy className="w-5 h-5" /> Copy Letter
                                                </button>
                                                <button onClick={() => setGeneratedLetter('')} className="p-4 text-love-charcoal/30 hover:text-red-500 transition-colors">
                                                    <Trash2 />
                                                </button>
                                            </div>
                                            <div className="absolute top-0 right-0 p-8 rotate-12 opacity-5 pointer-events-none">
                                                <Heart className="w-48 h-48 fill-love-rose" />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full border-4 border-dashed border-love-blush/30 rounded-[3rem] flex items-center justify-center p-12 text-center text-love-charcoal/20">
                                            <div className="space-y-4">
                                                <PenTool className="w-16 h-16 mx-auto opacity-10" />
                                                <p className="font-bold text-lg">Your generated letter will appear here.</p>
                                            </div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="cupid"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] shadow-glass overflow-hidden h-[600px] flex flex-col"
                        >
                            {/* Chat History */}
                            <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
                                {chatHistory.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                        <MessageCircle className="w-20 h-20" />
                                        <p className="font-black text-2xl uppercase tracking-widest">Ask Cupid Anything</p>
                                        <p className="text-sm max-w-xs font-medium">Get advice on dating, relationship milestones, or how to say 'I love you'.</p>
                                    </div>
                                )}
                                {chatHistory.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] px-6 py-4 rounded-3xl font-medium shadow-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-love-crimson text-white rounded-br-none'
                                            : 'bg-white text-love-charcoal rounded-bl-none border border-love-blush/30'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}
                                {isThinking && (
                                    <div className="flex justify-start">
                                        <div className="px-6 py-4 bg-white/50 rounded-3xl rounded-bl-none border border-love-blush/30 animate-pulse text-xs font-black text-love-charcoal/40 uppercase tracking-widest">
                                            Cupid is thinking...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-8 bg-white/60 border-t border-white">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendToCupid()}
                                        placeholder="Type your question to Cupid..."
                                        className="w-full pl-8 pr-16 py-6 bg-white border-2 border-love-blush focus:border-love-rose rounded-full outline-none font-bold text-love-charcoal shadow-inner transition-all"
                                    />
                                    <button
                                        onClick={sendToCupid}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-love-crimson text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
