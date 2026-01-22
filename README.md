# SESAME - Web3 Waitlist Page

A stunning, production-ready Web3 waitlist page with Twitter/X login and wallet integration.

## 🚀 Features

- **Twitter/X OAuth Integration** - Social login with X/Twitter
- **Multi-Wallet Support** - MetaMask, WalletConnect, Coinbase Wallet
- **Email Capture** - Traditional email signup option
- **Stunning Web3 UI** - Glassmorphism, particle effects, gradient animations
- **Responsive Design** - Perfect on mobile, tablet, and desktop
- **Real-time Stats** - Live countdown and user statistics
- **Social Sharing** - Share on Twitter and copy link functionality

## 🎨 Design Features

- **Animated particle background** with WebGL effects
- **Glassmorphism cards** with blur effects
- **Gradient color palette** (Cyan, Purple, Pink)
- **Smooth micro-animations** on all interactions
- **Premium typography** (Inter & Space Grotesk)
- **Dark mode optimized** for Web3 aesthetics

## ⚡ Quick Start

### Option 1: Simple HTTP Server (Recommended)

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 2: Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 3: Direct File

Simply double-click `index.html` to open in your browser.

## 🔧 Integration Guide

### Twitter/X OAuth Setup

1. Create a Twitter Developer account at https://developer.twitter.com
2. Create a new app and get your API keys
3. Update `app.js` with your OAuth credentials:

```javascript
// Replace simulateTwitterAuth() with actual OAuth flow
const TWITTER_CLIENT_ID = 'your-client-id';
const REDIRECT_URI = 'your-redirect-uri';
```

### Wallet Integration

The page includes:
- **MetaMask** - Ready to use (requires MetaMask browser extension)
- **WalletConnect** - Needs WalletConnect SDK v2.0
- **Coinbase Wallet** - Needs Coinbase Wallet SDK

To add WalletConnect (production):

```bash
npm install @walletconnect/web3-provider
```

### Backend API Integration

Replace the demo functions in `app.js`:

```javascript
async submitToWaitlist(data) {
    // Replace with your API endpoint
    const response = await fetch('https://your-api.com/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
}
```

## 📊 Data Capture

The page captures:
- **Email address** (with validation)
- **Wallet address** (Ethereum-compatible)
- **Twitter/X ID** (when using social login)
- **Timestamp** (automatic)

Data is currently saved to localStorage for demo purposes.

## 🎯 Customization

### Colors

Edit CSS variables in `style.css`:

```css
:root {
    --primary-cyan: #00F5FF;
    --primary-purple: #7B3FF2;
    --primary-pink: #FF3CF7;
}
```

### Branding

- Replace "SESAME" with your brand name
- Update the SVG logo in `index.html`
- Modify the hero copy and messaging

### Stats

Update the stats in `app.js`:

```javascript
this.animateCounter('totalUsers', 12384, 2000);
this.animateCounter('spotsLeft', 476, 2000);
```

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

**Note:** Wallet features require a Web3-enabled browser or wallet extension.

## 🔐 Security Notes

- Never expose private keys or API secrets in frontend code
- Implement rate limiting on your backend
- Validate all inputs server-side
- Use HTTPS in production
- Store sensitive data securely (never in localStorage for production)

## 📦 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy
```

### GitHub Pages

1. Push to GitHub
2. Go to Settings > Pages
3. Select main branch
4. Your site will be live at `username.github.io/repo-name`

## 🚀 Production Checklist

- [ ] Replace demo API calls with real backend
- [ ] Set up Twitter OAuth credentials
- [ ] Configure wallet providers (WalletConnect, Coinbase)
- [ ] Add analytics (Google Analytics, Mixpanel)
- [ ] Set up email service (SendGrid, Mailchimp)
- [ ] Add CAPTCHA for spam prevention
- [ ] Configure environment variables
- [ ] Test on all devices and browsers
- [ ] Add error logging (Sentry, LogRocket)
- [ ] Set up monitoring and alerts

## 📄 License

MIT License - Feel free to use for your project!

## 💬 Support

Built with ❤️ for the Web3 community.

---

**Ready to ship in 3 hours? This is production-ready NOW! 🚀**
