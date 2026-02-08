// Game Content & Data
// Questions, challenges, and content for all mini games

// ROSE DAY - Guess the Rose
export const ROSE_MEANINGS = [
    { color: '🌹 Red Rose', meaning: 'Love & Romance', options: ['Love & Romance', 'Friendship', 'Gratitude', 'Sympathy'] },
    { color: '🌸 Pink Rose', meaning: 'Admiration & Joy', options: ['Jealousy', 'Admiration & Joy', 'Passion', 'Peace'] },
    { color: '🤍 White Rose', meaning: 'Purity & Innocence', options: ['Anger', 'Purity & Innocence', 'Energy', 'Wealth'] },
    { color: '💛 Yellow Rose', meaning: 'Friendship & Care', options: ['Romance', 'Friendship & Care', 'Sadness', 'Mystery'] },
    { color: '🧡 Orange Rose', meaning: 'Enthusiasm & Desire', options: ['Calm', 'Enthusiasm & Desire', 'Sympathy', 'Trust'] },
    { color: '💜 Purple Rose', meaning: 'Enchantment & Mystery', options: ['Enchantment & Mystery', 'Anger', 'Joy', 'Friendship'] },
    { color: '🖤 Black Rose', meaning: 'Farewell & New Beginnings', options: ['Love', 'Hate', 'Farewell & New Beginnings', 'Hope'] },
    { color: '💙 Blue Rose', meaning: 'Mystery & Uniqueness', options: ['Sadness', 'Mystery & Uniqueness', 'Wealth', 'Passion'] }
];

// PROPOSE DAY - Guess the Confession
export const CONFESSIONS = [
    { hint: 'I think about you every day...', type: 'crush', options: ['friend', 'crush', 'random'] },
    { hint: 'You make me laugh so much!', type: 'friend', options: ['friend', 'crush', 'random'] },
    { hint: 'I love spending time with you...', type: 'crush', options: ['friend', 'crush', 'random'] },
    { hint: 'You\'re such a great person!', type: 'friend', options: ['friend', 'crush', 'random'] },
    { hint: 'My heart skips a beat when I see you...', type: 'crush', options: ['friend', 'crush', 'random'] },
    { hint: 'Thanks for always being there!', type: 'friend', options: ['friend', 'crush', 'random'] },
    { hint: 'I can\'t stop thinking about you...', type: 'crush', options: ['friend', 'crush', 'random'] },
    { hint: 'You\'re awesome!', type: 'random', options: ['friend', 'crush', 'random'] }
];

// PROPOSE DAY - Fake Proposal Scenarios (Bollywood Edition)
export const PROPOSAL_SCENARIOS = [
    { text: "Simran, ja jee le apni zindagi! But first, give me your ____.", blanks: ["Netflix password", "Gol Gappas", "Property papers", "Paneer Tikka"] },
    { text: "Rahul, naam toh suna hoga? But have you heard about my love for ____?", blanks: ["Biryani", "Discount sales", "Cricket", "Chai"] },
    { text: "Mere paas bangla hai, gaadi hai, bank balance hai. Tumhare paas kya hai? Mere paas ____ hai!", blanks: ["Mom's love", "Free Wi-Fi", "Extra sauce packets", "Swiggy coupon"] },
    { text: "Thappad se darr nahi lagta sahab, ____ se lagta hai.", blanks: ["Pyar", "Monday morning", "Empty fridge", "Arranged marriage"] },
    { text: "Pushpa, I hate tears... but I love ____. Will you marry me?", blanks: ["Vada Pav", "Free dhaniya", "IPL tickets", "Rain dance"] },
    { text: "Kitne aadmi the? Woh chodo, kitne ____ the tumhare dil mein?", blanks: ["Samosas", "ex-lovers", "hidden snacks", "Netflix accounts"] }
];

// PROPOSE DAY - Who Proposed Like This? (Desi Edition)
export const PROPOSAL_STYLES = [
    { title: "The Sangeet Surprise", desc: "Dances to 'Badtameez Dil' and falls off stage." },
    { title: "The Panic Attack", desc: "Faint kiya because ring was too expensive." },
    { title: "The Public Tamasha", desc: "Proposes at a crowded Railway Station with dhol." },
    { title: "The Mummy-Approved", desc: "Brings his mom along to propose to you." },
    { title: "The Chai Date", desc: "Writes 'Marry Me' on the Parle-G biscuit." },
    { title: "The Filmy Hero", desc: "Stands in rain for 4 hours singing Arijit songs." },
    { title: "The Arranged Meeting", desc: "Asks 'Beta, cooking aati hai?' as a proposal." },
    { title: "The Jugaad King", desc: "Uses a onion ring instead of diamond." }
];

// PROPOSE DAY - Yes/No Meter Questions
export const YES_NO_QUESTIONS = [
    'Would you go on a blind date?',
    'Do you believe in love at first sight?',
    'Would you confess your feelings first?',
    'Is Valentine\'s Day overrated?',
    'Would you celebrate Valentine\'s alone?',
    'Do you prefer chocolates over flowers?',
    'Would you write a love letter?',
    'Is online dating a good idea?',
    'Would you say "I love you" first?',
    'Do you believe in soulmates?'
];

// TEDDY DAY - Mood Expressions
export const TEDDY_MOODS = [
    { emoji: '😊', mood: 'Happy', options: ['Happy', 'Sad', 'Angry', 'Sleepy'] },
    { emoji: '😢', mood: 'Sad', options: ['Happy', 'Sad', 'Excited', 'Confused'] },
    { emoji: '😍', mood: 'In Love', options: ['In Love', 'Angry', 'Tired', 'Silly'] },
    { emoji: '😴', mood: 'Sleepy', options: ['Energetic', 'Sad', 'Sleepy', 'Angry'] },
    { emoji: '🤗', mood: 'Loving', options: ['Loving', 'Mean', 'Bored', 'Shy'] },
    { emoji: '😎', mood: 'Cool', options: ['Nervous', 'Cool', 'Sad', 'Angry'] },
    { emoji: '🥳', mood: 'Celebrating', options: ['Sad', 'Celebrating', 'Tired', 'Angry'] }
];

// PROMISE DAY - Promise Words
export const PROMISE_WORDS = [
    ['always', 'never', 'forever', 'daily', 'sometimes'],
    ['support', 'listen', 'help', 'care', 'protect'],
    ['honest', 'kind', 'loyal', 'true', 'faithful'],
    ['you', 'us', 'together', 'family', 'friends'],
    ['love', 'respect', 'trust', 'cherish', 'value']
];

// KISS DAY - Emoji Movie/Song Puzzles
export const EMOJI_PUZZLES = [
    { emojis: '👸🏰🎃', answer: 'Cinderella', options: ['Cinderella', 'Frozen', 'Beauty and the Beast', 'Tangled'] },
    { emojis: '🦁👑', answer: 'The Lion King', options: ['Jungle Book', 'The Lion King', 'Tarzan', 'Madagascar'] },
    { emojis: '❄️👸', answer: 'Frozen', options: ['Cinderella', 'Frozen', 'Brave', 'Moana'] },
    { emojis: '🌹🏰👸', answer: 'Beauty and the Beast', options: ['Sleeping Beauty', 'Beauty and the Beast', 'Cinderella', 'Tangled'] },
    { emojis: '💔🚢', answer: 'Titanic', options: ['Titanic', 'Pearl Harbor', 'The Notebook', 'Avatar'] },
    { emojis: '👻💕', answer: 'Ghost', options: ['Ghost', 'Casper', 'Twilight', 'Phantom'] },
    { emojis: '⏰💔', answer: 'About Time', options: ['Interstellar', 'About Time', 'Inception', 'Arrival'] },
    { emojis: '🌟💫', answer: 'La La Land', options: ['La La Land', 'Sing', 'Greatest Showman', 'Moulin Rouge'] }
];

// KISS DAY - Compatibility Questions
export const COMPATIBILITY_QUESTIONS = [
    { question: 'Favorite date type?', options: ['Movie Night', 'Dinner', 'Adventure', 'Stay Home'] },
    { question: 'Morning or Night?', options: ['Morning Person', 'Night Owl', 'Either', 'Neither'] },
    { question: 'Preferred gift?', options: ['Flowers', 'Chocolates', 'Experience', 'Handmade'] },
    { question: 'Love language?', options: ['Words', 'Touch', 'Gifts', 'Quality Time'] },
    { question: 'Ideal vacation?', options: ['Beach', 'Mountains', 'City', 'Staycation'] }
];

// VALENTINE'S DAY - Trivia Questions
export const VALENTINE_TRIVIA = [
    {
        question: 'What does X and O mean in XOXO?',
        answer: 'Hugs and Kisses',
        options: ['Hugs and Kisses', 'Love and Peace', 'Hearts and Roses', 'Day and Night']
    },
    {
        question: 'Which Roman god is Valentine\'s Day named after?',
        answer: 'St. Valentine',
        options: ['Cupid', 'Venus', 'St. Valentine', 'Mars']
    },
    {
        question: 'What year did candy hearts first appear?',
        answer: '1860s',
        options: ['1760s', '1860s', '1960s', '2000s']
    },
    {
        question: 'What flower is most associated with love?',
        answer: 'Rose',
        options: ['Tulip', 'Rose', 'Lily', 'Daisy']
    },
    {
        question: 'In which country is Valentine\'s Day banned?',
        answer: 'Saudi Arabia',
        options: ['India', 'China', 'Saudi Arabia', 'Japan']
    },
    {
        question: 'What is Cupid\'s weapon?',
        answer: 'Bow and Arrow',
        options: ['Sword', 'Bow and Arrow', 'Spear', 'Heart']
    },
    {
        question: 'How many roses are sold on Valentine\'s Day?',
        answer: '250 million',
        options: ['50 million', '100 million', '250 million', '500 million']
    },
    {
        question: 'What do yellow roses symbolize?',
        answer: 'Friendship',
        options: ['Romance', 'Friendship', 'Jealousy', 'Apology']
    },
    {
        question: 'Which country celebrates White Day on March 14?',
        answer: 'Japan',
        options: ['USA', 'France', 'Japan', 'Italy']
    },
    {
        question: 'What is the #1 Valentine\'s gift?',
        answer: 'Chocolates',
        options: ['Flowers', 'Chocolates', 'Jewelry', 'Cards']
    }
];

// Love Wheel Actions
export const LOVE_WHEEL_ACTIONS = [
    { action: 'Send 3 Hugs', emoji: '🤗', points: 10 },
    { action: 'Give Compliment', emoji: '💝', points: 15 },
    { action: 'Share Meme', emoji: '😂', points: 5 },
    { action: 'Send Hearts', emoji: '❤️', points: 10 },
    { action: 'Virtual High-Five', emoji: '✋', points: 5 },
    { action: 'Start Dance Party', emoji: '💃', points: 20 },
    { action: 'Drop Confetti', emoji: '🎉', points: 15 },
    { action: 'Send Love Note', emoji: '💌', points: 20 },
    { action: 'Challenge Duel', emoji: '⚔️', points: 25 },
    { action: 'Mystery Gift', emoji: '🎁', points: 30 }
];

// BONUS - Never Have I Ever (Valentine Edition)
export const NEVER_HAVE_I = [
    'Never have I ever... celebrated Valentine\'s Day alone',
    'Never have I ever... sent a secret valentine',
    'Never have I ever... written a love letter',
    'Never have I ever... had a Valentine\'s Day kiss',
    'Never have I ever... gone on a blind date',
    'Never have I ever... bought myself flowers',
    'Never have I ever... cried watching a romance movie',
    'Never have I ever... had a crush on a celebrity',
    'Never have I ever... forgotten Valentine\'s Day',
    'Never have I ever... regifted chocolates'
];

// BONUS - Most Likely To
export const MOST_LIKELY_TO = [
    'Who\'s most likely to... cry during a romantic movie?',
    'Who\'s most likely to... forget Valentine\'s Day?',
    'Who\'s most likely to... plan the perfect date?',
    'Who\'s most likely to... fall in love at first sight?',
    'Who\'s most likely to... send 100 texts in a day?',
    'Who\'s most likely to... write a love song?',
    'Who\'s most likely to... have a secret admirer?',
    'Who\'s most likely to... buy expensive gifts?',
    'Who\'s most likely to... confess feelings first?',
    'Who\'s most likely to... celebrate anniversaries big?'
];

// BONUS - Truth or Dare (Safe Mode)
export const TRUTH_OR_DARE = {
    truths: [
        'What\'s your ideal first date?',
        'Have you ever had a crush on someone here?',
        'What\'s your love language?',
        'Biggest romantic gesture you\'ve done?',
        'What\'s your favorite romantic movie?',
        'Would you rather give or receive gifts?',
        'What makes you fall for someone?',
        'Biggest dealbreaker in relationships?',
        'Favorite thing about Valentine\'s Day?',
        'Most romantic place you\'ve been?'
    ],
    dares: [
        'Send a heart emoji to everyone',
        'Give the person on your left a compliment',
        'Share your favorite love song',
        'Do a victory dance',
        'Send a virtual hug to someone',
        'Share a funny pickup line',
        'Make a heart shape with your hands',
        'Send a GIF that describes love',
        'Describe your dream date in emojis',
        'Give yourself a fun nickname'
    ]
};

// Helper function to get random items
export const getRandomItems = <T>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Helper to shuffle array
// CHOCOLATE DAY - Mood Match
export const CHOCOLATE_MOODS = [
    { type: 'Dark Chocolate', mood: 'Serious & Intense', emoji: '🍫' },
    { type: 'Milk Chocolate', mood: 'Sweet & Cheerful', emoji: '🍬' },
    { type: 'White Chocolate', mood: 'Playful & Pure', emoji: '🥛' },
    { type: 'Caramel Filled', mood: 'Gooey & Romantic', emoji: '🍮' },
    { type: 'Nutty Chocolate', mood: 'Crazy & Fun', emoji: '🥜' },
    { type: 'Mint Chocolate', mood: 'Cool & Refreshing', emoji: '🌿' }
];

// PROMISE DAY - Silly Promise Generator words (Desi Edition)
export const SILLY_PROMISES = {
    actions: ['share', 'cook', 'massage', 'tolerate', 'hide'],
    objects: ['your Tinda sabzi', 'spiders', 'the TV remote', 'your wet towel', 'last slice of pizza'],
    times: ['every Karwa Chauth', 'during IPL matches', 'when Mummy ji is watching', 'on salary day', 'never (just kidding)']
};

// PROMISE DAY - Promise or Dare
export const PROMISE_DARES = [
    { type: 'promise', text: "Promise to always let me win arguments." },
    { type: 'dare', text: "Send a voice note singing 'I Will Always Love You' badly." },
    { type: 'promise', text: "Promise to share your last bite of food." },
    { type: 'dare', text: "Change your profile pic to a potato for 10 minutes." },
    { type: 'promise', text: "Promise to verify my outfits before I go out." },
    { type: 'dare', text: "Text your ex (or crush) just a '👀' emoji." },
    { type: 'promise', text: "Promise to handle all spider situations." },
    { type: 'dare', text: "Do 20 jumping jacks while chanting 'Love is Pain'." }
];

// HUG DAY - Hug Simulator (Desi Edition)
export const HUG_STYLES = [
    { type: 'Jadoo Ki Jhappi', emoji: '🤗', awkwardness: 0, warmth: 1000, desc: 'Munna Bhai style magic!' },
    { type: 'The "Beta Shaadi Kab?"', emoji: '👵', awkwardness: 90, warmth: 50, desc: 'Aunty squeeze with questions.' },
    { type: 'The "Bro" Hug', emoji: '🤜', awkwardness: 20, warmth: 60, desc: 'Back slaps included.' },
    { type: 'Awkward Namaste', emoji: '🙏', awkwardness: 100, warmth: 10, desc: 'Respectful distance maintained.' },
    { type: 'The Filmy Aashiqui', emoji: '☔', awkwardness: 5, warmth: 90, desc: 'Slow motion rain hug!' },
    { type: 'Side Wala Hug', emoji: '🙃', awkwardness: 40, warmth: 40, desc: 'Safe for public places.' }
];

// VALENTINE'S DAY - Couple Chaos Scenarios (Desi Edition)
export const COUPLE_SCENARIOS = [
    { scenario: "Mummy ji found your 'secret' trip photos!", options: ["Say it's Photoshop", "Blame the friend", "Touch feet & apologize"] },
    { scenario: "Partner compares you to Sharma ji ka beta/beti.", options: ["Emotional blackmail", "Compare them to Alia/Ranbir", "Leave the house drama"] },
    { scenario: "You forgot to convince parents for love marriage.", options: ["Watch DDLJ together", "Run away (Just kidding)", "Send Rishta aunty"] },
    { scenario: "Partner puts elaichi in your Biryani.", options: ["Break up instantly", "Cry in corner", "Revenge with karela juice"] }
];

// MEME BUILDER - Templates (Colors or placeholders)
export const MEME_TEMPLATES = [
    { id: 'classic', color: 'bg-white', label: 'Classic' },
    { id: 'hera_pheri', color: 'bg-yellow-100', label: 'Hera Pheri Style' },
    { id: 'mirzapur', color: 'bg-red-100', label: 'Mirzapur Vibe' },
    { id: 'shark_tank', color: 'bg-blue-100', label: 'Shark Tank India' },
    { id: 'bollywood', color: 'bg-pink-100', label: 'Romance Special' }
];

// Helper to shuffle array
export const shuffleArray = <T>(array: T[]): T[] => {
    return [...array].sort(() => 0.5 - Math.random());
};
