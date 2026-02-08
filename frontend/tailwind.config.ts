import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                outfit: ['var(--font-outfit)', 'sans-serif'],
                playfair: ['var(--font-playfair)', 'serif'],
                sans: ['var(--font-outfit)', 'sans-serif'],
            },
            colors: {
                'love-crimson': '#FF2171', // Vibrant, aesthetic Raspberry (Pops against pink)
                'love-rose': '#FF85A1',    // Soft, dreamy pink
                'love-blush': '#FFF0F3',   // Softest blush pink
                'love-gold': '#FFD700',    // Classic gold
                'love-champagne': '#FAE1DD', // Warm champagne
                'love-ivory': '#FFFFF0',   // Pure ivory
                'love-charcoal': '#4A4E69', // Softer, aesthetics navy-charcoal
                'love-accent': '#FFC2D1',  // Pastel pink accent
                'love-mist': '#F8F9FA',    // Airy white
                'love-dusk': '#9D174D',    // Deep, rich Berry (Classy, not muddy)
                'love-peach': '#FFCCD5',   // Soft peach
                'glass-bg': 'rgba(255, 255, 255, 0.4)', // Improved glass base
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'main-gradient': 'linear-gradient(135deg, #FFF0F3 0%, #FFCCD5 50%, #FFB3C1 100%)',
                'hero-gradient': 'linear-gradient(135deg, #FF99AC 0%, #FF5C8D 100%)',
                'sunset-love': 'linear-gradient(to right, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
                'mystic-love': 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
                'confession-card': 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
                'soft-glow': '0 0 25px rgba(255, 77, 109, 0.4)',
                'floating': '0 15px 50px -10px rgba(0,0,0,0.1)',
                'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
            },
            backdropBlur: {
                'xs': '2px',
                'md': '12px',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
                'spin-slow': 'spin 12s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                heartbeat: {
                    '0%': { transform: 'scale(1)' },
                    '14%': { transform: 'scale(1.15)' },
                    '28%': { transform: 'scale(1)' },
                    '42%': { transform: 'scale(1.15)' },
                    '70%': { transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
