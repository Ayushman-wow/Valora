'use client';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Heart, Command } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md glass-card p-8 text-center"
            >
                <div className="mb-6 flexjustify-center">
                    <Heart className="w-16 h-16 text-love-crimson mx-auto animate-pulse-slow" fill="currentColor" />
                </div>

                <h1 className="text-3xl font-playfair font-bold text-love-crimson mb-2">Welcome to Valora</h1>
                <p className="text-love-charcoal/70 mb-8">
                    Sign in to share moments, confess secrets, and connect with loved ones.
                </p>

                <button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md mb-4 group"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white/80 text-gray-500">Or continue as guest</span>
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); signIn('credentials', { username: (e.target as any).username.value, callbackUrl: '/' }); }} className="space-y-4">
                    <input
                        name="username"
                        type="text"
                        placeholder="Enter your name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-love-blush focus:ring-2 focus:ring-love-rose outline-none bg-white/50 text-center"
                    />
                    <button
                        type="submit"
                        className="w-full py-3 bg-[#FF5090] text-white rounded-xl font-bold hover:bg-[#E02E6E] transition-all shadow-lg shadow-love-crimson/20"
                        style={{ backgroundColor: '#FF5090', color: 'white' }}
                    >
                        Enter as Guest
                    </button>
                </form>

                <p className="mt-6 text-xs text-love-charcoal/50">
                    By continuing, you agree to spread love and positivity. ❤️
                </p>
            </motion.div>
        </div>
    );
}
