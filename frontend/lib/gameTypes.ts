// Mini Games Engine - Core Types & Infrastructure
// localStorage-based game system

export type GameType =
    // Rose Day
    | 'guess-rose' | 'rose-toss'
    // Propose Day
    | 'guess-confession' | 'yes-no-meter' | 'fake-proposal' | 'who-proposed'
    // Chocolate Day
    | 'chocolate-match' | 'chocolate-catch' | 'chocolate-mood'
    // Teddy Day
    | 'dress-teddy' | 'teddy-mood'
    // Promise Day
    | 'promise-builder' | 'truth-lock' | 'promise-silly' | 'promise-dare'
    // Hug Day
    | 'hug-meter' | 'hug-chain' | 'hug-sim' | 'hug-battle'
    // Kiss Day
    | 'emoji-kiss' | 'compatibility-blitz'
    // Valentine's Day
    | 'valentine-trivia' | 'love-wheel' | 'memory-quiz' | 'couple-chaos' | 'meme-builder' | 'memory-remix'
    // Bonus
    | 'movie-emoji' | 'song-guess' | 'never-have-i' | 'most-likely' | 'fast-tap' | 'truth-dare'
    // Couples Only
    | 'partner-quiz' | 'couple-sync';

export type GameMode = 'solo' | 'multiplayer' | 'room';

export type GameStatus = 'waiting' | 'active' | 'completed';

export interface Player {
    username: string;
    score: number;
    ready: boolean;
    avatar?: string;
    answers?: any[];
}

export interface GameSession {
    _id: string;
    id: string; // Alias for _id if needed, or remove. Let's keep for compatibility but usually MongoDB uses _id.
    type: GameType;
    mode: GameMode;
    status: GameStatus;
    roomCode?: string;
    players: Player[];
    currentRound: number;
    totalRounds: number;
    timeLimit: number; // seconds
    startTime?: string;
    endTime?: string;
    winner?: string;
    gameData: any; // Game-specific data
    createdAt: string;
}

export interface GameConfig {
    id: GameType;
    name: string;
    description: string;
    icon: string;
    day: string; // Which Valentine day
    minPlayers: number;
    maxPlayers: number;
    duration: number; // seconds
    rounds: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
}

// All game configurations
export const GAME_CONFIGS: Record<GameType, GameConfig> = {
    // ROSE DAY
    'guess-rose': {
        id: 'guess-rose',
        name: 'Guess the Rose',
        description: 'Guess what each rose color means!',
        icon: '🌹',
        day: 'Rose Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 60,
        rounds: 5,
        difficulty: 'easy',
        tags: ['quick', 'knowledge', 'fun']
    },
    'rose-toss': {
        id: 'rose-toss',
        name: 'Rose Toss',
        description: 'Toss roses into baskets!',
        icon: '🎯',
        day: 'Rose Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 90,
        rounds: 1,
        difficulty: 'medium',
        tags: ['action', 'skill', 'competitive']
    },

    // PROPOSE DAY
    'guess-confession': {
        id: 'guess-confession',
        name: 'Guess the Confession',
        description: 'Decode anonymous confessions!',
        icon: '💌',
        day: 'Propose Day',
        minPlayers: 2,
        maxPlayers: 10,
        duration: 90,
        rounds: 5,
        difficulty: 'medium',
        tags: ['social', 'guessing', 'fun']
    },
    'yes-no-meter': {
        id: 'yes-no-meter',
        name: 'Yes/No Meter',
        description: 'Vote on fun proposals!',
        icon: '💍',
        day: 'Propose Day',
        minPlayers: 2,
        maxPlayers: 20,
        duration: 60,
        rounds: 5,
        difficulty: 'easy',
        tags: ['voting', 'social', 'quick']
    },
    'fake-proposal': {
        id: 'fake-proposal',
        name: 'Fake Proposal Generator',
        description: 'Create hilarious fake proposals!',
        icon: '🎭',
        day: 'Propose Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 120,
        rounds: 1,
        difficulty: 'easy',
        tags: ['creative', 'funny', 'generator']
    },
    'who-proposed': {
        id: 'who-proposed',
        name: 'Who Proposed Like This?',
        description: 'Tag the friend who would do this!',
        icon: '🤔',
        day: 'Propose Day',
        minPlayers: 2,
        maxPlayers: 20,
        duration: 90,
        rounds: 5,
        difficulty: 'easy',
        tags: ['social', 'tagging', 'funny']
    },

    // CHOCOLATE DAY
    'chocolate-match': {
        id: 'chocolate-match',
        name: 'Chocolate Match',
        description: 'Memory matching with chocolates!',
        icon: '🍫',
        day: 'Chocolate Day',
        minPlayers: 1,
        maxPlayers: 4,
        duration: 120,
        rounds: 1,
        difficulty: 'medium',
        tags: ['memory', 'puzzle', 'relaxing']
    },
    'chocolate-catch': {
        id: 'chocolate-catch',
        name: 'Chocolate Catch',
        description: 'Catch falling chocolates!',
        icon: '🎮',
        day: 'Chocolate Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 60,
        rounds: 1,
        difficulty: 'hard',
        tags: ['action', 'reflex', 'arcade']
    },
    'chocolate-mood': {
        id: 'chocolate-mood',
        name: 'Chocolate Mood Match',
        description: 'Match chocolates to emotions!',
        icon: '🍫',
        day: 'Chocolate Day',
        minPlayers: 1,
        maxPlayers: 1,
        duration: 120,
        rounds: 1,
        difficulty: 'easy',
        tags: ['puzzle', 'fun', 'mood']
    },

    // TEDDY DAY
    'dress-teddy': {
        id: 'dress-teddy',
        name: 'Dress the Teddy',
        description: 'Create the cutest teddy!',
        icon: '🧸',
        day: 'Teddy Day',
        minPlayers: 2,
        maxPlayers: 10,
        duration: 120,
        rounds: 1,
        difficulty: 'easy',
        tags: ['creative', 'voting', 'fun']
    },
    'teddy-mood': {
        id: 'teddy-mood',
        name: 'Teddy Mood Match',
        description: 'Guess the teddy\'s emotion!',
        icon: '😊',
        day: 'Teddy Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 60,
        rounds: 5,
        difficulty: 'easy',
        tags: ['guessing', 'quick', 'casual']
    },

    // PROMISE DAY
    'promise-builder': {
        id: 'promise-builder',
        name: 'Promise Builder',
        description: 'Build meaningful promises!',
        icon: '🤝',
        day: 'Promise Day',
        minPlayers: 2,
        maxPlayers: 10,
        duration: 90,
        rounds: 3,
        difficulty: 'medium',
        tags: ['creative', 'social', 'thoughtful']
    },
    'truth-lock': {
        id: 'truth-lock',
        name: 'Truth Lock',
        description: 'Will they keep their promise?',
        icon: '🔒',
        day: 'Promise Day',
        minPlayers: 2,
        maxPlayers: 10,
        duration: 90,
        rounds: 5,
        difficulty: 'medium',
        tags: ['guessing', 'social', 'interactive']
    },
    'promise-silly': {
        id: 'promise-silly',
        name: 'Silly Promise Generator',
        description: 'Create funny promises and vote!',
        icon: '🤞',
        day: 'Promise Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 300,
        rounds: 3,
        difficulty: 'easy',
        tags: ['funny', 'creative', 'social']
    },
    'promise-dare': {
        id: 'promise-dare',
        name: 'Promise or Dare',
        description: 'Make a promise or do a dare!',
        icon: '😈',
        day: 'Promise Day',
        minPlayers: 2,
        maxPlayers: 10,
        duration: 600,
        rounds: 5,
        difficulty: 'medium',
        tags: ['party', 'social', 'dare']
    },

    // HUG DAY
    'hug-meter': {
        id: 'hug-meter',
        name: 'Hug Meter',
        description: 'Fill the hug meter first!',
        icon: '🤗',
        day: 'Hug Day',
        minPlayers: 2,
        maxPlayers: 10,
        duration: 30,
        rounds: 1,
        difficulty: 'easy',
        tags: ['tapping', 'competitive', 'quick']
    },
    'hug-chain': {
        id: 'hug-chain',
        name: 'Hug Chain',
        description: 'Complete the hug chain!',
        icon: '⛓️',
        day: 'Hug Day',
        minPlayers: 3,
        maxPlayers: 20,
        duration: 60,
        rounds: 1,
        difficulty: 'easy',
        tags: ['social', 'cooperative', 'fun']
    },
    'hug-sim': {
        id: 'hug-sim',
        name: 'Hug Simulator',
        description: 'Send awkward or bear hugs!',
        icon: '🫂',
        day: 'Hug Day',
        minPlayers: 1,
        maxPlayers: 2,
        duration: 60,
        rounds: 1,
        difficulty: 'easy',
        tags: ['funny', 'simulation', 'reaction']
    },
    'hug-battle': {
        id: 'hug-battle',
        name: 'Hug Reaction Battle',
        description: 'Tap fast to fill the love meter!',
        icon: '⚡',
        day: 'Hug Day',
        minPlayers: 1,
        maxPlayers: 2,
        duration: 30,
        rounds: 3,
        difficulty: 'medium',
        tags: ['action', 'fast', 'competitive']
    },

    // KISS DAY
    'emoji-kiss': {
        id: 'emoji-kiss',
        name: 'Emoji Kiss Guess',
        description: 'Decode emoji combinations!',
        icon: '💋',
        day: 'Kiss Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 90,
        rounds: 7,
        difficulty: 'medium',
        tags: ['puzzle', 'emoji', 'pop-culture']
    },
    'compatibility-blitz': {
        id: 'compatibility-blitz',
        name: 'Compatibility Blitz',
        description: '5 quick compatibility questions!',
        icon: '💕',
        day: 'Kiss Day',
        minPlayers: 2,
        maxPlayers: 2,
        duration: 60,
        rounds: 5,
        difficulty: 'easy',
        tags: ['quiz', 'couple', 'quick']
    },

    // VALENTINE'S DAY
    'valentine-trivia': {
        id: 'valentine-trivia',
        name: 'Valentine Trivia',
        description: 'Test your love knowledge!',
        icon: '❤️',
        day: 'Valentine\'s Day',
        minPlayers: 1,
        maxPlayers: 20,
        duration: 120,
        rounds: 10,
        difficulty: 'medium',
        tags: ['trivia', 'competitive', 'knowledge']
    },
    'love-wheel': {
        id: 'love-wheel',
        name: 'Love Wheel',
        description: 'Spin for random fun actions!',
        icon: '🎡',
        day: 'Valentine\'s Day',
        minPlayers: 2,
        maxPlayers: 20,
        duration: 90,
        rounds: 1,
        difficulty: 'easy',
        tags: ['random', 'social', 'chaos']
    },
    'memory-quiz': {
        id: 'memory-quiz',
        name: 'Memory Quiz',
        description: 'Questions from your journey!',
        icon: '📸',
        day: 'Valentine\'s Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 120,
        rounds: 10,
        difficulty: 'medium',
        tags: ['personal', 'memories', 'special']
    },
    'couple-chaos': {
        id: 'couple-chaos',
        name: 'Couple Chaos Generator',
        description: 'Survive funny relationship scenarios!',
        icon: '🌪️',
        day: 'Valentine\'s Day',
        minPlayers: 1,
        maxPlayers: 2,
        duration: 180,
        rounds: 5,
        difficulty: 'easy',
        tags: ['funny', 'scenarios', 'bickering']
    },
    'meme-builder': {
        id: 'meme-builder',
        name: 'Valentine Meme Builder',
        description: 'Create hilarious love memes!',
        icon: '🖼️',
        day: 'Valentine\'s Day',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 300,
        rounds: 1,
        difficulty: 'easy',
        tags: ['creative', 'meme', 'funny']
    },
    'memory-remix': {
        id: 'memory-remix',
        name: 'Memory Remix',
        description: 'Caption funny moments together!',
        icon: '📸',
        day: 'Valentine\'s Day',
        minPlayers: 1,
        maxPlayers: 5,
        duration: 300,
        rounds: 3,
        difficulty: 'easy',
        tags: ['creative', 'photo', 'memory']
    },

    // BONUS
    'movie-emoji': {
        id: 'movie-emoji',
        name: 'Movie Emoji Guess',
        description: 'Guess movies from emojis!',
        icon: '🎬',
        day: 'Bonus',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 90,
        rounds: 10,
        difficulty: 'medium',
        tags: ['movies', 'emoji', 'pop-culture']
    },
    'song-guess': {
        id: 'song-guess',
        name: 'Song Guess',
        description: 'Guess the romantic song!',
        icon: '🎵',
        day: 'Bonus',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 90,
        rounds: 7,
        difficulty: 'medium',
        tags: ['music', 'guessing', 'fun']
    },
    'never-have-i': {
        id: 'never-have-i',
        name: 'Never Have I Ever',
        description: 'Valentine edition!',
        icon: '🙈',
        day: 'Bonus',
        minPlayers: 3,
        maxPlayers: 20,
        duration: 120,
        rounds: 10,
        difficulty: 'easy',
        tags: ['social', 'revealing', 'party']
    },
    'most-likely': {
        id: 'most-likely',
        name: 'Most Likely To',
        description: 'Who\'s most likely to...?',
        icon: '👑',
        day: 'Bonus',
        minPlayers: 3,
        maxPlayers: 20,
        duration: 90,
        rounds: 7,
        difficulty: 'easy',
        tags: ['voting', 'social', 'fun']
    },
    'fast-tap': {
        id: 'fast-tap',
        name: 'Fast Tap Hearts',
        description: 'Tap as fast as you can!',
        icon: '⚡',
        day: 'Bonus',
        minPlayers: 1,
        maxPlayers: 10,
        duration: 30,
        rounds: 1,
        difficulty: 'easy',
        tags: ['reflex', 'competitive', 'quick']
    },
    'truth-dare': {
        id: 'truth-dare',
        name: 'Truth or Dare',
        description: 'Safe mode edition!',
        icon: '🔮',
        day: 'Bonus',
        minPlayers: 2,
        maxPlayers: 20,
        duration: 120,
        rounds: 10,
        difficulty: 'medium',
        tags: ['social', 'interactive', 'party']
    },
    // COUPLES ONLY
    'partner-quiz': {
        id: 'partner-quiz',
        name: 'Partner Quiz',
        description: 'How well do you know your boo?',
        icon: '💑',
        day: 'Couples Only',
        minPlayers: 2,
        maxPlayers: 2,
        duration: 300,
        rounds: 10,
        difficulty: 'medium',
        tags: ['quiz', 'couple', 'intimate']
    },
    'couple-sync': {
        id: 'couple-sync',
        name: 'Love Sync',
        description: 'Test your compatibility!',
        icon: '🔗',
        day: 'Couples Only',
        minPlayers: 2,
        maxPlayers: 2,
        duration: 120,
        rounds: 5,
        difficulty: 'easy',
        tags: ['reflex', 'couple', 'sync']
    }
};

// Get games by day
export const getGamesByDay = (day: string): GameConfig[] => {
    return Object.values(GAME_CONFIGS).filter(game => game.day === day);
};

// Get all days
export const VALENTINE_DAYS = [
    'Rose Day',
    'Propose Day',
    'Chocolate Day',
    'Teddy Day',
    'Promise Day',
    'Hug Day',
    'Kiss Day',
    'Valentine\'s Day',
    'Bonus',
    'Couples Only'
];
