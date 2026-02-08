const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

// Nearby places search (using Overpass API - free alternative to Google Places)
router.post('/nearby', async (req, res) => {
    try {
        const { lat, lng, type, radius = 2000 } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // Cache key
        const cacheKey = `nearby_${lat}_${lng}_${type}_${radius}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Map our types to Overpass query tags
        const typeMap = {
            'flower_shop': 'shop=florist',
            'chocolate': 'shop=chocolate|shop=confectionery|shop=bakery',
            'gift_shop': 'shop=gift|shop=toys',
            'cafe': 'amenity=cafe',
            'restaurant': 'amenity=restaurant',
            'cinema': 'amenity=cinema',
            'ice_cream': 'amenity=ice_cream|shop=ice_cream',
            'park': 'leisure=park'
        };

        const osmType = typeMap[type] || 'shop';

        // Overpass API query
        const query = `
            [out:json][timeout:25];
            (
                node["${osmType.split('=')[0]}"="${osmType.split('=')[1]}"](around:${radius},${lat},${lng});
                way["${osmType.split('=')[0]}"="${osmType.split('=')[1]}"](around:${radius},${lat},${lng});
            );
            out center;
        `;

        const overpassResponse = await axios.post(
            'https://overpass-api.de/api/interpreter',
            query,
            {
                headers: { 'Content-Type': 'text/plain' },
                timeout: 10000
            }
        );

        const places = overpassResponse.data.elements.map(element => ({
            id: element.id,
            name: element.tags?.name || 'Unnamed',
            type: element.tags?.shop || element.tags?.amenity || type,
            lat: element.lat || element.center?.lat,
            lng: element.lon || element.center?.lon,
            address: formatAddress(element.tags),
            phone: element.tags?.phone || element.tags?.['contact:phone'],
            website: element.tags?.website || element.tags?.['contact:website'],
            openingHours: element.tags?.opening_hours,
            distance: calculateDistance(lat, lng, element.lat || element.center?.lat, element.lon || element.center?.lon)
        })).sort((a, b) => a.distance - b.distance).slice(0, 10);

        const result = { places, count: places.length };
        cache.set(cacheKey, result);

        res.json(result);
    } catch (error) {
        console.error('Nearby places error:', error.message);
        res.status(500).json({ error: 'Failed to fetch nearby places', details: error.message });
    }
});

// Get directions URL
router.post('/directions', async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng, mode = 'driving' } = req.body;

        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=${mode}`;

        res.json({ url: directionsUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate directions' });
    }
});

// Helper: Format address from OSM tags
function formatAddress(tags) {
    if (!tags) return 'Address not available';
    const parts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city'],
        tags['addr:postcode']
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
}

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 1000); // Return in meters
}

module.exports = router;
