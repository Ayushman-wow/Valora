'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Check, AlertCircle } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

interface LocationPermissionProps {
    onPermissionGranted?: () => void;
    title?: string;
    description?: string;
}

export default function LocationPermission({
    onPermissionGranted,
    title = "Enable Location",
    description = "We need your location to find nearby places and enhance your experience."
}: LocationPermissionProps) {
    const { location, city, hasPermission, isLoading, error, requestLocation, clearLocation } = useLocation();

    const handleRequest = async () => {
        await requestLocation();
        if (onPermissionGranted && !error) {
            onPermissionGranted();
        }
    };

    if (hasPermission && location) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 border-2 border-green-400/30 bg-green-50/50"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-love-charcoal">Location Enabled</p>
                            <p className="text-sm text-love-charcoal/60">{city || 'Unknown City'}</p>
                        </div>
                    </div>
                    <button
                        onClick={clearLocation}
                        className="text-love-charcoal/50 hover:text-red-500 transition-colors"
                        title="Clear location"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-2 border-love-rose/20"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-love-rose/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-love-rose" />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-love-charcoal mb-2">{title}</h3>
                    <p className="text-sm text-love-charcoal/70 max-w-md">
                        {description}
                    </p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleRequest}
                    disabled={isLoading}
                    className="px-6 py-3 bg-love-crimson text-white rounded-xl font-bold hover:bg-love-rose transition-all shadow-lg shadow-love-crimson/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Getting Location...
                        </>
                    ) : (
                        <>
                            <MapPin className="w-5 h-5" />
                            Enable Location
                        </>
                    )}
                </button>

                <p className="text-xs text-love-charcoal/50">
                    🔒 Your location is stored only on your device and used privately.
                </p>
            </div>
        </motion.div>
    );
}
