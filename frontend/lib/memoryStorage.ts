import { API_BASE_URL } from '@/config/env';

export interface Memory {
    _id?: string;
    day: string;
    type: string;
    content: any;
    recipient?: string;
    createdAt?: string;
}

const API_URL = `${API_BASE_URL}/api/interactions/activity`;

export const saveMemory = async (day: string, type: 'given' | 'received', content: any, recipient?: string, email?: string): Promise<Memory | null> => {
    if (!email) return null; // Guest or unauth? We need email for backend.

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': email
            },
            body: JSON.stringify({ day, type, content, recipient })
        });

        if (!res.ok) throw new Error('Failed to save activity');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
};

export const getMemories = async (email?: string): Promise<Memory[]> => {
    if (!email) return [];

    try {
        const res = await fetch(API_URL, {
            headers: { 'x-user-email': email }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
};

export const getMemoriesByDay = async (day: string, email?: string): Promise<Memory[]> => {
    const memories = await getMemories(email);
    return memories.filter(m => m.day === day);
};

export const clearMemories = async (email?: string): Promise<void> => {
    if (!email) return;
    try {
        await fetch(API_URL, {
            method: 'DELETE',
            headers: { 'x-user-email': email }
        });
    } catch (err) {
        console.error(err);
    }
};
