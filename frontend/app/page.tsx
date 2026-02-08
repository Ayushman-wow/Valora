'use client';
import { motion } from 'framer-motion';
import { Heart, Stars, Gift, Lock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import JSConfetti from 'js-confetti';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const jsConfetti = new JSConfetti();
    // Subtle confetti on load
    jsConfetti.addConfetti({
      emojis: ['❤️', '🌹', '🍫', '🧸'],
      emojiSize: 30,
      confettiNumber: 20,
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] gap-6 text-center pt-4">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl space-y-6 relative"
      >
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-love-crimson/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-love-rose/10 rounded-full blur-3xl animate-pulse-slow" />

        <h1 className="text-4xl md:text-6xl font-bold font-playfair text-transparent bg-clip-text bg-gradient-to-r from-love-crimson to-love-rose drop-shadow-sm">
          Colour of Love
        </h1>
        <p className="text-xl md:text-2xl text-love-charcoal/80 font-light max-w-2xl mx-auto">
          Experience Valentine's Week like never before.
          <span className="font-medium text-love-rose ml-2">Valora</span> brings secrets, surprises, and smiles together.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href="/confess">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-love-crimson to-love-dusk text-white rounded-full font-bold shadow-lg shadow-love-crimson/30 hover:shadow-xl hover:shadow-love-crimson/50 transition-all border-2 border-transparent hover:border-white/20"
            >
              Start Confessing 💘
            </motion.button>
          </Link>
          <Link href="/days">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-love-crimson border-2 border-love-crimson/20 rounded-full font-bold shadow-sm hover:border-love-crimson hover:bg-love-blush/50 transition-all"
            >
              Explore Days 📅
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mt-12 max-w-6xl">
        <FeatureCard
          icon={<Lock className="w-6 h-6 text-love-rose" />}
          title="Anonymous"
          desc="Safe space for your secrets & stories."
          delay={0.1}
          href="/confess"
        />
        <FeatureCard
          icon={<Calendar className="w-6 h-6 text-love-crimson" />}
          title="Daily Rituals"
          desc="Unlock magic every day of the week."
          delay={0.2}
          href="/days"
        />
        <FeatureCard
          icon={<Stars className="w-6 h-6 text-love-gold" />}
          title="AI Assistant"
          desc="Generate love letters & get dating tips."
          delay={0.3}
          href="/ai"
        />
        <FeatureCard
          icon={<Heart className="w-6 h-6 text-red-500" />}
          title="CoupleSync"
          desc="Link accounts for a shared experience."
          delay={0.4}
          href="/couple"
        />
        <FeatureCard
          icon={<Gift className="w-6 h-6 text-purple-500" />}
          title="Gift Hall"
          desc="Find curated tokens of affection."
          delay={0.5}
          href="/gift-shop"
        />
      </div>

    </div>
  );
}

function FeatureCard({ icon, title, desc, delay, href }: { icon: React.ReactNode, title: string, desc: string, delay: number, href: string }) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="p-6 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl shadow-glass flex flex-col items-center gap-2 hover:border-love-rose/30 transition-all cursor-pointer h-full"
      >
        <div className="p-4 bg-white/60 rounded-full shadow-sm">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-love-charcoal font-playfair">{title}</h3>
        <p className="text-[10px] text-love-charcoal/70 uppercase tracking-widest font-black">{desc}</p>
      </motion.div>
    </Link>
  )
}
