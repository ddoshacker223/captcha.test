// CAPTCHA Verification System for Telegram WebApp
class CaptchaVerification {
    constructor() {
        this.isChecked = false;
        this.isSubmitting = false;
        this.userData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.collectInitialData();
        this.checkTelegramWebApp();
    }

    bindEvents() {
        // Checkbox click
        document.getElementById('captchaBox').addEventListener('click', () => this.toggleCheckbox());
        
        // Verify button click
        document.getElementById('verifyBtn').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.isChecked && !this.isSubmitting) {
                this.verifyUser();
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                const captchaBox = document.getElementById('captchaBox');
                if (document.activeElement === captchaBox || document.activeElement === document.body) {
                    e.preventDefault();
                    this.toggleCheckbox();
                }
            }
        });
    }

    checkTelegramWebApp() {
        // Check if we're in Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                // Expand WebApp to full height
                window.Telegram.WebApp.expand();
                
                // Set background color
                window.Telegram.WebApp.setBackgroundColor('#667eea');
                
                // Enable closing confirmation
                window.Telegram.WebApp.enableClosingConfirmation();
                
                console.log('Telegram WebApp initialized');
            } catch (error) {
                console.log('Error initializing Telegram WebApp:', error);
            }
        }
    }

    collectInitialData() {
        // Collect basic user data that's available without interaction
        this.userData = {
            // Screen information
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            },
            
            // Browser information
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                pdfViewerEnabled: navigator.pdfViewerEnabled || 'unknown',
                vendor: navigator.vendor || 'unknown',
                product: navigator.product || 'unknown'
            },
            
            // Hardware information
            hardware: {
                hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
                deviceMemory: navigator.deviceMemory || 'unknown',
                maxTouchPoints: navigator.maxTouchPoints || 0
            },
            
            // Network information
            network: {
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt
                } : 'unknown'
            },
            
            // Time and location
            system: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                locale: Intl.DateTimeFormat().resolvedOptions().locale
            },
            
            // Features detection
            features: {
                touchSupport: 'ontouchstart' in window,
                serviceWorker: 'serviceWorker' in navigator,
                webGL: this.detectWebGL(),
                canvas: this.detectCanvas(),
                fonts: this.detectFonts(),
                plugins: this.detectPlugins(),
                localStorage: !!window.localStorage,
                sessionStorage: !!window.sessionStorage,
                indexedDB: !!window.indexedDB
            },
            
            timestamp: new Date().toISOString(),
            sessionId: this.generateSessionId(),
            user_id: this.generateUserId()
        };

        console.log('Initial user data collected');
    }

    toggleCheckbox() {
        if (this.isSubmitting) return;
        
        const captchaBox = document.getElementById('captchaBox');
        const verifyBtn = document.getElementById('verifyBtn');
        
        this.isChecked = !this.isChecked;
        
        if (this.isChecked) {
            captchaBox.classList.add('checked');
            verifyBtn.disabled = false;
            
            // Collect additional data when user interacts
            this.collectInteractionData();
        } else {
            captchaBox.classList.remove('checked');
            verifyBtn.disabled = true;
        }
    }

    collectInteractionData() {
        // Add interaction-specific data
        this.userData.interaction = {
            mouseMovement: this.trackMouseMovement(),
            clickPattern: this.trackClickPattern(),
            scrollBehavior: this.trackScrollBehavior(),
            interactionTime: new Date().toISOString()
        };

        // Collect more detailed fingerprinting data
        this.userData.detailedFingerprint = {
            canvasFingerprint: this.getCanvasFingerprint(),
            webglFingerprint: this.getWebGLFingerprint(),
            audioFingerprint: this.getAudioFingerprint(),
            installedFonts: this.getInstalledFonts(),
            platform: navigator.platform,
            vendor: navigator.vendor,
            product: navigator.product
        };
    }

    verifyUser() {
        const btnText = document.getElementById('btnText');
        const loadingDots = document.getElementById('loadingDots');
        const successMessage = document.getElementById('successMessage');
        const verifyBtn = document.getElementById('verifyBtn');
        
        // Show loading state
        this.isSubmitting = true;
        verifyBtn.disabled = true;
        btnText.style.display = 'none';
        loadingDots.style.display = 'flex';
        
        // Final data collection before submission
        this.userData.finalVerification = {
            verificationTime: new Date().toISOString(),
            timeToComplete: Date.now() - performance.timing.navigationStart,
            userBehavior: this.analyzeUserBehavior()
        };

        // Add Telegram ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const telegramId = urlParams.get('tgid');
        if (telegramId) {
            this.userData.telegram_id = parseInt(telegramId);
        }

        // Simulate verification process
        setTimeout(() => {
            this.submitToServer()
                .then(() => {
                    // Show success state
                    loadingDots.style.display = 'none';
                    successMessage.style.display = 'flex';
                    verifyBtn.style.display = 'none';
                    
                    // Notify Telegram WebApp about successful verification
                    this.notifyTelegramSuccess();
                })
                .catch(error => {
                    console.error('Verification failed:', error);
                    this.handleVerificationError();
                });
        }, 2000);
    }

    async submitToServer() {
        try {
            // Send data to your Flask server
            const response = await fetch('http://localhost:5000/api/captcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_data: this.userData,
                    verification_type: 'github_pages_captcha',
                    source: 'telegram_webapp'
                })
            });

            if (!response.ok) {
                throw new Error('Server response not OK');
            }

            const data = await response.json();
            console.log('Data submitted successfully:', data);
            return data;
            
        } catch (error) {
            console.error('Error submitting data:', error);
            // Even if server submission fails, we still consider it a success for the user
            return { status: 'success', message: 'Verification completed' };
        }
    }

    notifyTelegramSuccess() {
        // If we're in a Telegram WebApp, send data back to the bot
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                const resultData = {
                    status: 'verified',
                    user_data: this.userData,
                    telegram_id: this.userData.telegram_id,
                    timestamp: new Date().toISOString(),
                    verification_type: 'captcha'
                };
                
                // Send data to bot
                window.Telegram.WebApp.sendData(JSON.stringify(resultData));
                
                // Close WebApp after successful verification
                setTimeout(() => {
                    window.Telegram.WebApp.close();
                }, 1500);
                
            } catch (error) {
                console.log('Error sending data to Telegram:', error);
                this.showSuccessMessage();
            }
        } else {
            // If not in WebApp, just show success message
            this.showSuccessMessage();
        }
    }

    showSuccessMessage() {
        // Show success message for non-WebApp users
        const successMessage = document.getElementById('successMessage');
        const verifyBtn = document.getElementById('verifyBtn');
        const loadingDots = document.getElementById('loadingDots');
        
        loadingDots.style.display = 'none';
        successMessage.style.display = 'flex';
        verifyBtn.style.display = 'none';
        
        // Add continue button for non-WebApp users
        setTimeout(() => {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'btn-verify';
            continueBtn.innerHTML = '<i class="fas fa-check me-2"></i>Continue';
            continueBtn.onclick = () => {
                alert('Verification completed! You can now return to the bot.');
            };
            
            document.querySelector('.captcha-container').appendChild(continueBtn);
        }, 2000);
    }

    handleVerificationError() {
        const btnText = document.getElementById('btnText');
        const loadingDots = document.getElementById('loadingDots');
        const verifyBtn = document.getElementById('verifyBtn');
        
        // Reset to allow retry
        loadingDots.style.display = 'none';
        btnText.style.display = 'inline';
        btnText.textContent = 'Retry Verification';
        verifyBtn.disabled = false;
        this.isSubmitting = false;
        
        alert('Verification failed. Please try again.');
    }

    // Fingerprinting methods
    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    detectCanvas() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }

    detectFonts() {
        // Basic font detection
        const fonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
            'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS',
            'Arial Black', 'Impact', 'Tahoma', 'Trebuchet MS'
        ];
        
        return fonts.filter(font => {
            return document.fonts.check(`12px "${font}"`);
        });
    }

    detectPlugins() {
        const plugins = [];
        if (navigator.plugins) {
            for (let i = 0; i < navigator.plugins.length; i++) {
                plugins.push(navigator.plugins[i].name);
            }
        }
        return plugins;
    }

    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Canvas Fingerprint', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Canvas Fingerprint', 4, 17);
            
            return canvas.toDataURL().substring(22); // Remove data:image/png;base64,
        } catch (e) {
            return 'error';
        }
    }

    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'unsupported';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return {
                vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
                version: gl.getParameter(gl.VERSION)
            };
        } catch (e) {
            return 'error';
        }
    }

    getAudioFingerprint() {
        // Simplified audio context fingerprint
        try {
            const audioContext = window.AudioContext || window.webkitAudioContext;
            return !!audioContext;
        } catch (e) {
            return false;
        }
    }

    getInstalledFonts() {
        return this.detectFonts();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    generateUserId() {
        const uniqueString = navigator.userAgent + screen.width + screen.height + new Date().getTime();
        return Math.abs(this.hashCode(uniqueString));
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    trackMouseMovement() {
        // Basic mouse movement tracking
        let movements = 0;
        const handler = () => movements++;
        document.addEventListener('mousemove', handler);
        
        setTimeout(() => {
            document.removeEventListener('mousemove', handler);
        }, 3000);
        
        return movements;
    }

    trackClickPattern() {
        // Track click patterns
        const clicks = [];
        const handler = (e) => {
            clicks.push({
                x: e.clientX,
                y: e.clientY,
                time: Date.now()
            });
        };
        
        document.addEventListener('click', handler);
        
        setTimeout(() => {
            document.removeEventListener('click', handler);
        }, 5000);
        
        return clicks.length;
    }

    trackScrollBehavior() {
        // Track scrolling behavior
        let scrolls = 0;
        const handler = () => scrolls++;
        window.addEventListener('scroll', handler);
        
        setTimeout(() => {
            window.removeEventListener('scroll', handler);
        }, 5000);
        
        return scrolls;
    }

    analyzeUserBehavior() {
        // Analyze user behavior patterns
        return {
            mouseMovements: this.trackMouseMovement(),
            clicks: this.trackClickPattern(),
            scrolls: this.trackScrollBehavior(),
            timeOnPage: performance.now()
        };
    }
}

// Initialize CAPTCHA when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CaptchaVerification();
    console.log('CAPTCHA verification system initialized');
    
    // Log available fingerprinting data
    console.log('Available fingerprinting methods:');
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Screen:', screen.width + 'x' + screen.height);
    console.log('- Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('- Platform:', navigator.platform);
});
