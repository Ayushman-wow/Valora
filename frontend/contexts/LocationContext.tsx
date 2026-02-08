'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationContextType {
    location: { lat: number; lng: number } | null;
    city: string | null;
    hasPermission: boolean;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<void>;
    clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load saved location from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('userLocation');
        if (saved) {
            const data = JSON.parse(saved);
            setLocation(data.location);
            setCity(data.city);
            setHasPermission(true);
        }
    }, []);

    const requestLocation = async () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const loc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            setLocation(loc);
            setHasPermission(true);

            // Reverse geocode to get city name
            const cityName = await getCityName(loc.lat, loc.lng);
            setCity(cityName);

            // Save to localStorage
            localStorage.setItem('userLocation', JSON.stringify({
                location: loc,
                city: cityName,
                timestamp: new Date().toISOString()
            }));

        } catch (err: any) {
            if (err.code === 1) {
                setError('Location permission denied. Please enable location access.');
            } else if (err.code === 2) {
                setError('Position unavailable. Please check your connection.');
            } else if (err.code === 3) {
                setError('Request timeout. Please try again.');
            } else {
                setError('Failed to get location. Please try again.');
            }
            console.error('Location error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearLocation = () => {
        setLocation(null);
        setCity(null);
        setHasPermission(false);
        setError(null);
        localStorage.removeItem('userLocation');
    };

    return (
        <LocationContext.Provider value={{
            location,
            city,
            hasPermission,
            isLoading,
            error,
            requestLocation,
            clearLocation
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}

// Helper function to get city name from coordinates
async function getCityName(lat: number, lng: number): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'User-Agent': 'Valora Valentine App'
                }
            }
        );
        const data = await response.json();
        return data.address?.city || data.address?.town || data.address?.village || 'Unknown';
    } catch (error) {
        console.error('Failed to get city name:', error);
        return 'Unknown';
    }
}
