const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Email configuration (using environment variables)
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // or 'outlook', 'yahoo', etc.
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
        }
    });
};

/**
 * Send gift via email
 * POST /api/gifts/send-email
 */
router.post('/send-email', async (req, res) => {
    try {
        const { to, gift } = req.body;

        if (!to || !gift) {
            return res.status(400).json({
                error: 'Recipient email and gift data are required'
            });
        }

        const transporter = createEmailTransporter();

        // HTML email template
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #FFE5EC 0%, #FFC2D4 100%);
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .gift-emoji {
            font-size: 80px;
            margin: 20px 0;
        }
        .gift-name {
            font-size: 28px;
            font-weight: bold;
            color: #FF2171;
            margin: 20px 0;
        }
        .message-box {
            background: #FFF0F3;
            border-left: 4px solid #FF2171;
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
        }
        .sender {
            font-size: 18px;
            color: #4A4E69;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #FF2171 0%, #9D174D 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #888;
            font-size: 14px;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💝 You've Received a Gift! 💝</h1>
            <div class="gift-emoji">${gift.giftEmoji}</div>
            <div class="gift-name">${gift.giftName}</div>
        </div>
        
        <div class="sender">
            <strong>From:</strong> ${gift.senderName}
            ${gift.recipientName ? `<br><strong>To:</strong> ${gift.recipientName}` : ''}
        </div>
        
        <div class="message-box">
            <strong>💌 Message:</strong>
            <p style="font-style: italic; margin-top: 10px;">"${gift.message}"</p>
        </div>
        
        ${gift.giftUrl ? `
        <div style="text-align: center;">
            <a href="${gift.giftUrl}" class="button">
                🎁 View Your Gift
            </a>
        </div>
        ` : ''}
        
        <div class="footer">
            <p>Sent with love from HeartSync 💕</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: `"HeartSync Gifts" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: `${gift.giftEmoji} You've received a gift from ${gift.senderName}!`,
            html: htmlContent,
            text: `
You've Received a Gift! ${gift.giftEmoji}

From: ${gift.senderName}
${gift.recipientName ? `To: ${gift.recipientName}` : ''}

Gift: ${gift.giftName}

Message:
"${gift.message}"

${gift.giftUrl ? `View your gift: ${gift.giftUrl}` : ''}

Sent with love from HeartSync 💕
            `.trim()
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Gift email sent successfully'
        });

    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
});

/**
 * Generate shareable gift link
 * POST /api/gifts/generate-link
 */
router.post('/generate-link', async (req, res) => {
    try {
        const { gift } = req.body;

        // Generate a unique gift ID (you might want to save this to database)
        const giftId = `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // In a real app, save the gift data to database here
        // await Gift.create({ id: giftId, ...gift });

        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/gift/${giftId}`;

        res.json({
            success: true,
            giftId,
            shareUrl
        });

    } catch (error) {
        console.error('Link generation error:', error);
        res.status(500).json({
            error: 'Failed to generate gift link'
        });
    }
});

module.exports = router;
