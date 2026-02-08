'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Globe, Navigation, Loader2, Star } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import { API_BASE_URL } from '@/config/env';

interface Place {
    id: number;
    name: string;
    type: string;
    lat: number;
    lng: number;
    address: string;
    phone?: string;
    website?: string;
    distance: number;
}

interface NearbyPlacesProps {
    type: string;
    title: string;
    icon?: React.ReactNode;
}

export default function NearbyPlaces({ type, title, icon }: NearbyPlacesProps) {
    const { location } = useLocation();
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (location) {
            fetchPlaces();
        }
    }, [location, type]);

    const fetchPlaces = async () => {
        if (!location) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/places/nearby`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lat: location.lat,
                    lng: location.lng,
                    type,
                    radius: 5000
                })
            });

            const data = await response.json();
            if (response.ok) {
                setPlaces(data.places || []);
            } else {
                setError(data.error || 'Failed to fetch places');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getDirections = (place: Place) => {
        if (!location) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${place.lat},${place.lng}`;
        window.open(url, '_blank');
    };

    const callPlace = (phone: string) => {
        window.open(`tel:${phone}`, '_self');
    };

    const visitWebsite = (website: string) => {
        window.open(website.startsWith('http') ? website : `https://${website}`, '_blank');
    };

    if (!location) {
        return null;
    }

    return (
        <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
                {icon}
                <h3 className="text-2xl font-bold text-love-charcoal">{title}</h3>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 text-love-rose animate-spin" />
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && places.length === 0 && (
                <div className="text-center py-12 text-love-charcoal/60">
                    No places found nearby. Try expanding your search radius!
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {places.map((place, index) => (
                    <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-5 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-love-charcoal">{place.name}</h4>
                                <p className="text-sm text-love-charcoal/60 capitalize">{place.type.replace('_', ' ')}</p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-love-rose/10 text-love-rose rounded-full">
                                {place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km`}
                            </span>
                        </div>

                        <p className="text-sm text-love-charcoal/70 mb-4 flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {place.address}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => getDirections(place)}
                                className="flex-1 min-w-[120px] px-3 py-2 bg-love-crimson text-white rounded-lg text-sm hover:bg-love-rose transition-colors flex items-center justify-center gap-2"
                            >
                                <Navigation className="w-4 h-4" />
                                Directions
                            </button>

                            {place.phone && (
                                <button
                                    onClick={() => callPlace(place.phone!)}
                                    className="px-3 py-2 bg-white border border-love-blush text-love-charcoal rounded-lg text-sm hover:bg-love-blush transition-colors flex items-center gap-2"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call
                                </button>
                            )}

                            {place.website && (
                                <button
                                    onClick={() => visitWebsite(place.website!)}
                                    className="px-3 py-2 bg-white border border-love-blush text-love-charcoal rounded-lg text-sm hover:bg-love-blush transition-colors flex items-center gap-2"
                                >
                                    <Globe className="w-4 h-4" />
                                    Website
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
