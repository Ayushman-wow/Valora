/**
 * Digital Gift Sharing Utilities
 * Supports sharing gifts via WhatsApp, Instagram, and Email
 */

export interface GiftData {
    giftName: string;
    giftEmoji: string;
    message: string;
    senderName: string;
    recipientName?: string;
    giftUrl?: string;
    imageUrl?: string;
}

/**
 * Share gift via WhatsApp Web API
 * Opens WhatsApp with pre-filled message
 */
export const shareViaWhatsApp = (gift: GiftData) => {
    const text = formatGiftMessage(gift);
    const encodedText = encodeURIComponent(text);

    // WhatsApp Web API - works on both mobile and desktop
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
};

/**
 * Share gift via Instagram
 * Note: Instagram doesn't have a direct share API, so we'll use the Stories sharing approach
 * or copy link to clipboard for manual sharing
 */
export const shareViaInstagram = async (gift: GiftData) => {
    const shareText = formatGiftMessage(gift);

    // Instagram doesn't have a direct web share API
    // We'll use the Web Share API if available, or copy to clipboard
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${gift.giftEmoji} Gift from ${gift.senderName}`,
                text: shareText,
                url: gift.giftUrl || window.location.href
            });
            return { success: true, method: 'share-api' };
        } catch (error) {
            console.log('Share cancelled or failed:', error);
        }
    }

    // Fallback: Copy to clipboard
    try {
        await navigator.clipboard.writeText(shareText);
        return {
            success: true,
            method: 'clipboard',
            message: 'Gift message copied! Open Instagram and paste it in a DM or Story.'
        };
    } catch (error) {
        return {
            success: false,
            error: 'Could not copy to clipboard'
        };
    }
};

/**
 * Share gift via Email using mailto protocol
 */
export const shareViaEmail = (gift: GiftData) => {
    const subject = `${gift.giftEmoji} You've received a gift from ${gift.senderName}!`;
    const body = formatGiftMessageForEmail(gift);

    const mailtoUrl = `mailto:${gift.recipientName ? '' : ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
};

/**
 * Advanced Email sharing using EmailJS or similar service
 * Requires EmailJS configuration
 */
export const sendGiftEmail = async (gift: GiftData, recipientEmail: string) => {
    // This would integrate with EmailJS or a backend email service
    // For now, we'll use the mailto fallback

    try {
        const response = await fetch('/api/send-gift-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: recipientEmail,
                gift: gift,
            }),
        });

        if (response.ok) {
            return { success: true };
        } else {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        console.error('Email send error:', error);
        // Fallback to mailto
        shareViaEmail(gift);
        return { success: false, fallback: 'mailto' };
    }
};

/**
 * Format gift message for WhatsApp/Instagram
 */
const formatGiftMessage = (gift: GiftData): string => {
    return `
${gift.giftEmoji} *You've Received a Gift!* ${gift.giftEmoji}

From: ${gift.senderName}
${gift.recipientName ? `To: ${gift.recipientName}` : ''}

Gift: ${gift.giftName}

💌 Message:
"${gift.message}"

${gift.giftUrl ? `\n🎁 View your gift: ${gift.giftUrl}` : ''}

Sent with love from HeartSync 💕
`.trim();
};

/**
 * Format gift message for Email (with HTML support)
 */
const formatGiftMessageForEmail = (gift: GiftData): string => {
    return `
You've Received a Gift! ${gift.giftEmoji}

From: ${gift.senderName}
${gift.recipientName ? `To: ${gift.recipientName}\n` : ''}

Gift: ${gift.giftName}

Message:
"${gift.message}"

${gift.giftUrl ? `\nView your gift here: ${gift.giftUrl}\n` : ''}

---
Sent with love from HeartSync
`.trim();
};

/**
 * Share using native Web Share API (works on mobile)
 */
export const shareViaWebShare = async (gift: GiftData) => {
    if (!navigator.share) {
        return {
            success: false,
            error: 'Web Share API not supported'
        };
    }

    try {
        await navigator.share({
            title: `${gift.giftEmoji} Gift from ${gift.senderName}`,
            text: formatGiftMessage(gift),
            url: gift.giftUrl || window.location.href
        });

        return { success: true };
    } catch (error) {
        console.log('Share cancelled:', error);
        return { success: false, error };
    }
};

/**
 * Generate a shareable gift URL
 */
export const generateGiftUrl = (giftId: string): string => {
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://heartsync.app';

    return `${baseUrl}/gift/${giftId}`;
};
