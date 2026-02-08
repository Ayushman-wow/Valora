const express = require('express');
const router = express.Router();

// Mock AI Logic (since we don't have a real API key configured in this environment usually)
// However, I can implement a "smart" generator using templates and random variations
// OR I can use a standard fetch to an LLM if the user provides a key later.

const LOVE_TEMPLATES = [
    "My dearest {name}, every time I think of you, my heart {action}. Your {trait} is what I love most about you.",
    "Dear {name}, being with you is like a {metaphor}. I promise to {promise} forever.",
    "To my {name}, the way you {action} always makes me {emotion}. I am so lucky to have you."
];

router.post('/generate-letter', (req, res) => {
    const { name, mood, style } = req.body;

    // Simple template-based "AI" for now
    let content = `Dearest ${name || 'Love'},\n\n`;

    if (mood === 'Romantic') {
        content += `Every moment with you feels like a dream I never want to wake up from. Your presence is the warmth in my winter and the light in my darkest days. I just wanted to remind you how much you mean to me.`;
    } else if (mood === 'Playful') {
        content += `You're the butter to my toast, the cheese to my macaroni, and the person I want to annoy for the rest of my life! Thanks for being my partner in crime and my favorite distraction.`;
    } else {
        content += `I was just sitting here thinking about us and all the little things that make you so special. Life is simpler and sweeter with you by my side.`;
    }

    content += `\n\nYours always,\n${req.body.sender || 'HeartSync AI'}`;

    res.json({ letter: content });
});

router.post('/cupid-chat', (req, res) => {
    const { message } = req.body;
    const msg = message.toLowerCase();

    const categories = {
        dating: [
            "Confidence is key, but authenticity is what makes them stay.",
            "Try a 'Digital Date' if you're far apart. Shared gaming or movies are great!",
            "First dates are for discovering vibes, not deciding lives. Keep it light."
        ],
        conflict: [
            "It's not you vs them, it's both of you vs the problem.",
            "Take a 5-minute breather before responding to a heated text.",
            "Use 'I feel' instead of 'You always'. It changes everything."
        ],
        gems: [
            "Love is like a garden—it needs consistent watering, not just a flood once a year.",
            "The best gift is often your undivided attention.",
            "Small surprises on ordinary days beat big gifts on planned ones."
        ]
    };

    let reply = "";
    if (msg.includes('fight') || msg.includes('angry') || msg.includes('sad')) {
        reply = categories.conflict[Math.floor(Math.random() * categories.conflict.length)];
    } else if (msg.includes('date') || msg.includes('meet') || msg.includes('first')) {
        reply = categories.dating[Math.floor(Math.random() * categories.dating.length)];
    } else {
        const all = [...categories.dating, ...categories.conflict, ...categories.gems];
        reply = all[Math.floor(Math.random() * all.length)];
    }

    res.json({ reply });
});

module.exports = router;
