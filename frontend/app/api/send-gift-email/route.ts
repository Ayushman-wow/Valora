import type { NextApiRequest, NextApiResponse } from 'next';
import { API_BASE_URL } from '@/config/env';

/**
 * Next.js API Route for sending gift emails
 * This proxies the request to the backend server
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/gifts/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        if (response.ok) {
            res.status(200).json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('API route error:', error);
        res.status(500).json({
            error: 'Failed to send email',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
