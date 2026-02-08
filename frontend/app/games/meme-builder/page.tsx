'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MEME_TEMPLATES } from '@/lib/gameContent';

function MemeBuilderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/games';
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [topText, setTopText] = useState('WHEN YOU FORGET');
    const [bottomText, setBottomText] = useState('VALENTINE\'S DAY');

    const template = MEME_TEMPLATES.find(t => t.id === selectedTemplate) || MEME_TEMPLATES[0];

    const handleSave = () => {
        alert("Meme Saved to Gallery! (Simulated) 📸");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-inter text-gray-800 flex flex-col items-center">

            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-8">
                <button onClick={() => router.push(returnTo)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🖼️</span>
                    <h1 className="text-xl font-bold">Meme Builder</h1>
                </div>
                <div className="w-10" />
            </div>

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-start">

                {/* Editor Panel */}
                <div className="bg-white p-6 rounded-3xl shadow-xl space-y-6">
                    <div>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-pink-500" />
                            Choose Template
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {MEME_TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t.id)}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${selectedTemplate === t.id
                                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                                        : 'border-gray-200 hover:border-pink-200'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Top Text</label>
                            <input
                                type="text"
                                value={topText}
                                onChange={(e) => setTopText(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-pink-500 outline-none text-xl font-bold font-impact uppercase tracking-wide placeholder-gray-300"
                                placeholder="TOP TEXT"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bottom Text</label>
                            <input
                                type="text"
                                value={bottomText}
                                onChange={(e) => setBottomText(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-pink-500 outline-none text-xl font-bold font-impact uppercase tracking-wide placeholder-gray-300"
                                placeholder="BOTTOM TEXT"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" /> Save Meme
                    </button>
                </div>

                {/* Preview Panel */}
                <div className="bg-gray-200 p-8 rounded-3xl flex items-center justify-center min-h-[400px] shadow-inner">
                    <motion.div
                        key={selectedTemplate}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`
                            relative w-full aspect-square max-w-md shadow-2xl rounded-sm overflow-hidden flex flex-col justify-between p-4 text-center
                            ${template.color.replace('bg-', 'bg-')} 
                            ${template.id === 'classic' ? 'bg-white' : ''}
                            ${template.id === 'drake' ? 'bg-orange-100' : ''}
                            ${template.id === 'distracted' ? 'bg-blue-100' : ''}
                            ${template.id === 'brain' ? 'bg-purple-100' : ''} 
                            ${template.id === 'love' ? 'bg-pink-100' : ''}
                        `}
                        // Note: Tailwind dynamic classes might not work if not safe-listed, falling back to style if needed
                        style={{ backgroundColor: template.id === 'classic' ? 'white' : undefined }}
                    >
                        {/* Placeholder Image Representation */}
                        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                            <span className="text-9xl font-black text-black">IMAGE</span>
                        </div>

                        <h2 className="relative z-10 text-4xl md:text-5xl font-black text-white stroke-black font-impact uppercase leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '2px black' }}>
                            {topText || 'TOP TEXT'}
                        </h2>

                        <h2 className="relative z-10 text-4xl md:text-5xl font-black text-white stroke-black font-impact uppercase leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '2px black' }}>
                            {bottomText || 'BOTTOM TEXT'}
                        </h2>

                        {/* Watermark */}
                        <div className="absolute bottom-2 right-2 text-[10px] font-bold text-gray-400 opacity-50 uppercase">
                            HEARTSYNC MEME GEN
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

export default function MemeBuilderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <MemeBuilderContent />
        </Suspense>
    );
}
