# Email Configuration for Gift Sharing

## Required Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Email Configuration (for sending gift emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for generating gift links)
FRONTEND_URL=http://localhost:3000
```

## Gmail Setup Instructions

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### 2. Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "HeartSync Gift Sharing"
4. Copy the 16-character password
5. Use this as your `EMAIL_PASSWORD`

## Alternative Email Services

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### SendGrid (Recommended for Production)
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Mailgun
```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com
```

## Testing Email Functionality

```bash
# Install nodemailer if not already installed
cd backend
npm install nodemailer

# Test email sending
curl -X POST http://localhost:5000/api/gifts/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "gift": {
      "giftName": "Virtual Rose",
      "giftEmoji": "🌹",
      "message": "Thinking of you!",
      "senderName": "John Doe",
      "giftUrl": "http://localhost:3000/gift/123"
    }
  }'
```

## WhatsApp Integration

WhatsApp sharing uses the Web API - no configuration needed!
- Works on both mobile and desktop
- Opens WhatsApp with pre-filled message
- User just needs to select recipient

## Instagram Integration

Instagram sharing uses:
1. **Web Share API** (mobile) - Native sharing dialog
2. **Clipboard fallback** - Copies message for manual sharing

No API keys required!

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use App Passwords** instead of account passwords
3. **Rotate credentials** regularly
4. **Limit email sending rate** to avoid spam flags
5. **Validate email addresses** before sending

## Rate Limiting (Recommended)

Add to `backend/routes/giftRoutes.js`:

```javascript
const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many emails sent, please try again later.'
});

router.post('/send-email', emailLimiter, async (req, res) => {
    // ... existing code
});
```

## Troubleshooting

### Email not sending?
- Check your EMAIL_USER and EMAIL_PASSWORD
- Verify 2FA is enabled and app password is correct
- Check Gmail "Less secure app access" is OFF (use app password instead)

### WhatsApp not opening?
- Ensure WhatsApp is installed on the device
- Check if pop-ups are blocked in browser

### Instagram share not working?
- Web Share API requires HTTPS in production
- Fallback to clipboard will work on all browsers
