// ==========================================
// SESAME WAITLIST - WEB3 APPLICATION
// ==========================================

class SesameWaitlist {
    constructor() {
        this.web3 = null;
        this.currentAccount = null;
        this.userData = {
            email: null,
            walletAddress: null,
            twitterId: null,
            timestamp: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initParticles();
        this.startStatsAnimation();
        this.checkWalletConnection();
    }

    // ==========================================
    // PARTICLE ANIMATION
    // ==========================================
    initParticles() {
        const canvas = document.getElementById('particleCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

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
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach(b => {
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.strokeStyle = `rgba(123, 63, 242, ${0.15 * (1 - distance / 120)})`;
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
            // Show loading state
            const twitterBtn = document.getElementById('twitterBtn');
            twitterBtn.classList.add('loading');
            twitterBtn.querySelector('span').textContent = 'Connecting...';

            // Simulate Twitter OAuth (In production, integrate with Twitter OAuth 2.0)
            await this.simulateTwitterAuth();

            this.userData.twitterId = 'demo_twitter_user';
            this.userData.timestamp = Date.now();

            // Show success
            this.showSuccessState();
            
        } catch (error) {
            console.error('Twitter login error:', error);
            alert('Twitter login failed. Please try again.');
            
            const twitterBtn = document.getElementById('twitterBtn');
            twitterBtn.classList.remove('loading');
            twitterBtn.querySelector('span').textContent = 'Continue with X';
        }
    }

    async simulateTwitterAuth() {
        // In production, implement actual Twitter OAuth 2.0 flow
        // For demo purposes, we'll simulate the process
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Twitter OAuth simulation complete');
                resolve();
            }, 1500);
        });
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
        // In production, send to your backend API
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Submitted to waitlist:', data);
                
                // Save to localStorage for demo
                const existingData = JSON.parse(localStorage.getItem('waitlistData') || '[]');
                existingData.push({
                    ...data,
                    ...this.userData,
                    timestamp: Date.now()
                });
                localStorage.setItem('waitlistData', JSON.stringify(existingData));
                
                resolve();
            }, 1500);
        });
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
        const text = encodeURIComponent('I just joined the @Sesame waitlist! 🚀 Join me in the future of Web3.');
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }

    copyLink() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const copyBtn = document.querySelector('.copy-link span');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            alert('Failed to copy link. Please copy manually: ' + url);
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
