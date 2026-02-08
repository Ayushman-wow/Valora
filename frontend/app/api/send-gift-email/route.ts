import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/env';

/**
 * Next.js App Router API Route for sending gift emails
 * This proxies the request to the backend server
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${API_BASE_URL}/api/gifts/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({
            error: 'Failed to send email',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
