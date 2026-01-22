// Supabase Configuration
const SUPABASE_URL = "https://exbhqypsrslydutbmvaq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YmhxeXBzcnNseWR1dGJtdmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTg1MjMsImV4cCI6MjA4NDY3NDUyM30.pxgprscg5bCQtLs6wXwe8gG2PSOfdW0xP5F8M078pYA";

class SesameWaitlist {
    constructor() {
        this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.web3 = null;
        this.currentAccount = null;
        this.userData = {
            email: null,
            walletAddress: null,
            twitterId: null,
            referralCode: null,
            referredBy: null,
            timestamp: null
        };

        this.init();
    }

    init() {
        this.checkReferral();
        this.setupEventListeners();
        this.initParticles();
        this.initCardTilt();
        this.startStatsAnimation();
        this.checkWalletConnection();
        this.listenForAuth();
    }

    async listenForAuth() {
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                console.log('User signed in via X:', session.user);

                // If they don't have an email in userData yet, get it from X session
                if (!this.userData.email) {
                    this.userData.email = session.user.email || `x_user_${session.user.id.substring(0, 5)}@sesame.io`;
                    this.userData.twitterId = session.user.user_metadata?.user_name || session.user.id;
                }

                try {
                    // Save to Supabase Waitlist table
                    await this.submitToWaitlist();
                    this.showSuccessState();
                } catch (error) {
                    console.error('Save error:', error);
                    // If they are already on the list, just show success
                    if (error.message.includes('already on the waitlist')) {
                        this.showSuccessState();
                    }
                }
            }
        });
    }

    checkReferral() {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) {
            this.userData.referredBy = ref;
            console.log('Referred by:', ref);
        }
    }

    // ==========================================
    // PARTICLE ANIMATION
    // ==========================================
    initParticles() {
        const canvas = document.getElementById('particleCanvas');
        const ctx = canvas.getContext('2d');
        let mouse = { x: null, y: null, radius: 150 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.density = (Math.random() * 30) + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = (dx / distance) * force * this.density;
                    let directionY = (dy / distance) * force * this.density;
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    this.x += this.speedX;
                    this.y += this.speedY;
                }

                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(0, 245, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });

            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach(b => {
                    const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(123, 63, 242, ${0.15 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                });
            });
            requestAnimationFrame(animate);
        }
        animate();
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    initCardTilt() {
        const card = document.getElementById('waitlistCard');
        if (!card) return;

        window.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (y - centerY) / 20;
            const tiltY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        window.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    }

    // ==========================================
    // STATS ANIMATION
    // ==========================================
    startStatsAnimation() {
        // Animate counting up
        this.animateCounter('totalUsers', 12384, 2000);
        this.animateCounter('spotsLeft', 476, 2000);

        // Update countdown timer
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    animateCounter(id, target, duration) {
        const element = document.getElementById(id);
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }

    updateCountdown() {
        const launch = new Date('2026-02-01T00:00:00').getTime();
        const now = new Date().getTime();
        const distance = launch - now;

        const hours = Math.floor(distance / (1000 * 60 * 60));

        document.getElementById('timeLeft').textContent = `${hours}h`;
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    setupEventListeners() {
        // Twitter Login
        document.getElementById('twitterBtn').addEventListener('click', () => {
            this.handleTwitterLogin();
        });

        // Wallet Connect Button (Step 1)
        document.getElementById('connectWalletBtn').addEventListener('click', () => {
            this.showStep(2);
        });

        // Back Button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showStep(1);
        });

        // Wallet Options
        document.querySelectorAll('.wallet-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const walletType = e.currentTarget.dataset.wallet;
                this.connectWallet(walletType);
            });
        });

        // Email Form
        document.getElementById('emailForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmailSubmit();
        });

        // Share Buttons
        document.querySelector('.twitter-share').addEventListener('click', () => {
            this.shareOnTwitter();
        });

        document.querySelector('.copy-link').addEventListener('click', () => {
            this.copyLink();
        });
    }

    // ==========================================
    // NAVIGATION
    // ==========================================
    showStep(stepNumber) {
        document.querySelectorAll('.waitlist-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`step${stepNumber}`).classList.add('active');
    }

    // ==========================================
    // TWITTER/X LOGIN
    // ==========================================
    async handleTwitterLogin() {
        try {
            const twitterBtn = document.getElementById('twitterBtn');
            twitterBtn.classList.add('loading');
            twitterBtn.querySelector('span').textContent = 'Connecting to X...';

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'twitter',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;

        } catch (error) {
            console.error('Twitter login error:', error);
            alert('Twitter login failed: ' + error.message);

            const twitterBtn = document.getElementById('twitterBtn');
            twitterBtn.classList.remove('loading');
            twitterBtn.querySelector('span').textContent = 'Continue with X';
        }
    }

    // ==========================================
    // WALLET CONNECTION
    // ==========================================
    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);

            // Check if already connected
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            }).catch(() => []);

            if (accounts.length > 0) {
                this.currentAccount = accounts[0];
            }
        }
    }

    async connectWallet(walletType) {
        try {
            const walletOption = document.querySelector(`[data-wallet="${walletType}"]`);
            walletOption.classList.add('loading');

            if (walletType === 'metamask') {
                await this.connectMetaMask();
            } else if (walletType === 'walletconnect') {
                await this.connectWalletConnect();
            } else if (walletType === 'coinbase') {
                await this.connectCoinbase();
            }

            walletOption.classList.remove('loading');

        } catch (error) {
            console.error('Wallet connection error:', error);
            alert(`Failed to connect ${walletType}. Please make sure you have the wallet installed.`);

            const walletOption = document.querySelector(`[data-wallet="${walletType}"]`);
            walletOption.classList.remove('loading');
        }
    }

    async connectMetaMask() {
        if (typeof window.ethereum === 'undefined') {
            window.open('https://metamask.io/download/', '_blank');
            throw new Error('MetaMask not installed');
        }

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            this.currentAccount = accounts[0];
            this.web3 = new Web3(window.ethereum);

            this.userData.walletAddress = this.currentAccount;
            this.userData.timestamp = Date.now();

            this.showSuccessState();

        } catch (error) {
            if (error.code === 4001) {
                throw new Error('User rejected the connection');
            }
            throw error;
        }
    }

    async connectWalletConnect() {
        // In production, implement WalletConnect v2
        alert('WalletConnect integration - In production, this would use WalletConnect SDK v2.0');

        // Simulate connection for demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.userData.walletAddress = '0x' + Math.random().toString(16).substr(2, 40);
        this.userData.timestamp = Date.now();
        this.showSuccessState();
    }

    async connectCoinbase() {
        // In production, implement Coinbase Wallet SDK
        alert('Coinbase Wallet integration - In production, this would use Coinbase Wallet SDK');

        // Simulate connection for demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.userData.walletAddress = '0x' + Math.random().toString(16).substr(2, 40);
        this.userData.timestamp = Date.now();
        this.showSuccessState();
    }

    // ==========================================
    // EMAIL SUBMISSION
    // ==========================================
    async handleEmailSubmit() {
        const emailInput = document.getElementById('emailInput');
        const email = emailInput.value.trim();

        if (!this.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        try {
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.classList.add('loading');
            submitBtn.querySelector('span').textContent = 'Joining...';

            // Simulate API call
            await this.submitToWaitlist({ email });

            this.userData.email = email;
            this.userData.timestamp = Date.now();

            this.showSuccessState();

        } catch (error) {
            console.error('Email submission error:', error);
            alert('Failed to join waitlist. Please try again.');

            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.classList.remove('loading');
            submitBtn.querySelector('span').textContent = 'Join Waitlist';
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async submitToWaitlist(data) {
        try {
            // Generate a simple referral code (first 6 chars of email or random)
            const refCode = (this.userData.email ? this.userData.email.split('@')[0] : 'user') + Math.random().toString(36).substring(2, 6);
            this.userData.referralCode = refCode;

            const { data: result, error } = await this.supabase
                .from('waitlist')
                .insert([
                    {
                        email: this.userData.email,
                        wallet_address: this.userData.walletAddress,
                        twitter_id: this.userData.twitterId,
                        referral_code: this.userData.referralCode,
                        referred_by: this.userData.referredBy
                    }
                ])
                .select();

            if (error) {
                if (error.code === '23505') { // Unique violation
                    throw new Error('This email or wallet is already on the waitlist!');
                }
                throw error;
            }

            // If referred by someone, increment their count (optional backend logic, usually better in RPC/Function)
            if (this.userData.referredBy) {
                await this.supabase.rpc('increment_referral_count', {
                    ref_code: this.userData.referredBy
                });
            }

            console.log('Successfully added to Supabase:', result);
            return result;
        } catch (error) {
            console.error('Supabase error:', error);
            throw error;
        }
    }

    // ==========================================
    // SUCCESS STATE
    // ==========================================
    showSuccessState() {
        this.showStep(3);

        // Update display values
        if (this.userData.walletAddress) {
            const addressDisplay = document.getElementById('displayWalletAddress');
            addressDisplay.textContent = this.formatAddress(this.userData.walletAddress);
            document.getElementById('walletAddressRow').style.display = 'flex';
        }

        if (this.userData.email) {
            document.getElementById('displayEmail').textContent = this.userData.email;
            document.getElementById('emailRow').style.display = 'flex';
        }

        // Show referral link
        const refLink = `${window.location.origin}${window.location.pathname}?ref=${this.userData.referralCode}`;
        const refDisplay = document.getElementById('displayReferralLink');
        if (refDisplay) {
            refDisplay.textContent = this.userData.referralCode;
            refDisplay.title = refLink;
        }

        // Generate random position for demo
        const position = Math.floor(Math.random() * 5000) + 1;
        document.getElementById('positionValue').textContent = position.toLocaleString();

        // Add confetti effect
        this.celebrateSuccess();
    }

    formatAddress(address) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    celebrateSuccess() {
        // Simple confetti effect could be added here
        console.log('🎉 Success! Welcome to Sesame!');
    }

    // ==========================================
    // SOCIAL SHARING
    // ==========================================
    shareOnTwitter() {
        const refLink = `${window.location.origin}${window.location.pathname}?ref=${this.userData.referralCode}`;
        const text = encodeURIComponent(`I just joined the @Sesame waitlist! 🚀 Use my link to move up the list:`);
        const url = encodeURIComponent(refLink);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }

    copyLink() {
        const refLink = `${window.location.origin}${window.location.pathname}?ref=${this.userData.referralCode}`;
        navigator.clipboard.writeText(refLink).then(() => {
            const copyBtn = document.querySelector('.copy-link span');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Link Copied!';

            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            alert('Failed to copy link. Please copy manually: ' + refLink);
        });
    }
}

// ==========================================
// INITIALIZE APP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const app = new SesameWaitlist();
    window.sesameApp = app; // Make accessible globally for debugging
});
