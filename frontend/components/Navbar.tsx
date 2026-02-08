'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, User, Gift, MessageCircle, Calendar, Users, Sparkles, Video, Gamepad2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
    { name: 'Days', href: '/days', icon: Calendar },
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Interactions', href: '/interactions', icon: Sparkles },
    { name: 'Calls', href: '/calls', icon: Video },
    { name: 'Confess', href: '/confess', icon: MessageCircle },
    { name: 'Writer', href: '/love-letter', icon: Heart },
    { name: 'Room', href: '/room', icon: Users },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-love-blush bg-white/90 backdrop-blur-xl shadow-sm">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse group">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Heart className="w-8 h-8 text-love-crimson fill-current" />
                    </motion.div>
                    <span className="self-center text-3xl font-black whitespace-nowrap text-love-crimson font-playfair tracking-tight group-hover:text-love-rose transition-colors">
                        Valora
                    </span>
                </Link>

                <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="hidden md:flex items-center gap-2 group hover:text-love-rose transition-colors">
                                <div className="w-8 h-8 rounded-full bg-love-crimson/10 flex items-center justify-center text-love-crimson">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-love-charcoal group-hover:text-love-rose">
                                    {session.user?.name?.split(' ')[0]}
                                </span>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="text-white bg-[#FF5090] hover:bg-[#E02E6E] focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-full text-sm px-5 py-2.5 text-center transition-all shadow-md whitespace-nowrap"
                                style={{ backgroundColor: '#FF5090', color: 'white' }}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <button
                                type="button"
                                className="text-white bg-[#FF5090] hover:bg-[#E02E6E] focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-full text-sm px-5 py-2.5 text-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
                                style={{ backgroundColor: '#FF5090', color: 'white' }}
                            >
                                Get Started
                            </button>
                        </Link>
                    )}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-love-crimson rounded-lg md:hidden hover:bg-love-blush focus:outline-none focus:ring-2 focus:ring-love-rose"
                    >
                        <span className="sr-only">Open main menu</span>
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                <div className={clsx("items-center justify-between w-full md:flex md:w-auto md:order-1", isOpen ? "block" : "hidden")}>
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-love-blush rounded-lg bg-love-ivory/80 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <li key={item.name}>
                                    <Link href={item.href} className={clsx(
                                        "block py-2 px-3 rounded md:p-0 transition-all flex items-center gap-1 font-playfair tracking-wide text-lg",
                                        isActive ? "text-love-crimson font-bold drop-shadow-sm" : "text-love-charcoal hover:text-love-rose hover:-translate-y-0.5"
                                    )}>
                                        <item.icon className="w-4 h-4 mb-0.5" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
