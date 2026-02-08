import { API_BASE_URL } from '@/config/env';
import { GameSession, GameType, GameMode } from './gameTypes';

const API_URL = `${API_BASE_URL}/api/games`;

export const createGame = async (
    type: GameType,
    mode: GameMode,
    creator: string,
    roomCode?: string
): Promise<GameSession> => {
    const res = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, mode, creator, roomCode })
    });
    return res.json();
};

export const joinGame = async (gameId: string, username: string): Promise<GameSession> => {
    const res = await fetch(`${API_URL}/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });
    return res.json();
};

export const getGameById = async (gameId: string): Promise<GameSession> => {
    const res = await fetch(`${API_URL}/${gameId}`);
    return res.json();
};

export const updatePlayerScore = async (gameId: string, username: string, points: number): Promise<GameSession> => {
    const res = await fetch(`${API_URL}/${gameId}/player`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, scoreDelta: points })
    });
    return res.json();
};

export const submitAnswer = async (gameId: string, username: string, answer: any): Promise<GameSession> => {
    const res = await fetch(`${API_URL}/${gameId}/player`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, answer })
    });
    return res.json();
};


export const setPlayerReady = async (gameId: string, username: string, ready: boolean): Promise<GameSession> => {
    const res = await fetch(`${API_URL}/${gameId}/player`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ready })
    });
    return res.json();
};

export const updateGameData = async (gameId: string, data: any): Promise<GameSession> => {
    const res = await fetch(`${API_URL}/${gameId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameData: data })
    });
    return res.json();
};

export const endGame = async (gameId: string): Promise<GameSession> => {
    const res = await fetch(`${API_URL}/${gameId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
    });
    return res.json();
};

export const leaveGame = async (gameId: string, username: string): Promise<void> => {
    // Note: Backend might not have specific leave endpoint yet, or we assume client just navigates away.
    // Ideally we remove player from list.
    // For now, let's just do nothing or call update if we want to track it.
    // Or we can add a 'removePlayer' logic to backend.
    // Let's stub it for now until backend supports it.
    console.log(`User ${username} leaving game ${gameId}`);
};

export const cleanupOldGames = async (): Promise<void> => {
    // Backend handles cleanup automatically or via cron.
    // No-op for frontend.
};
