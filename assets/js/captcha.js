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
        this.initTelegramWebApp();
    }

    initTelegramWebApp() {
        // Initialize Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                // Expand WebApp to full height
                Telegram.WebApp.expand();
                
                // Set background color
                Telegram.WebApp.setBackgroundColor('#667eea');
                
                // Enable closing confirmation
                Telegram.WebApp.enableClosingConfirmation();
                
                // Set header color
                Telegram.WebApp.setHeaderColor('#667eea');
                
                console.log('Telegram WebApp initialized');
            } catch (error) {
                console.log('Error initializing Telegram WebApp:', error);
            }
        }
    }

    bindEvents() {
        // Checkbox click - используем onclick для Telegram WebApp
        const captchaBox = document.getElementById('captchaBox');
        captchaBox.onclick = () => this.toggleCheckbox();
        
        // Verify button click - ИСПРАВЛЕНИЕ: используем onclick вместо addEventListener
        const verifyBtn = document.getElementById('verifyBtn');
        verifyBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.isChecked && !this.isSubmitting) {
                this.verifyUser();
            }
        };

        // Touch events для мобильных устройств
        captchaBox.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleCheckbox();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.toggleCheckbox();
            }
        });
    }

    collectInitialData() {
        // Collect basic user data
        this.userData = {
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
            },
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
            },
            system: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            timestamp: new Date().toISOString(),
            user_id: this.generateUserId()
        };

        // Add Telegram ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const telegramId = urlParams.get('tgid');
        if (telegramId) {
            this.userData.telegram_id = parseInt(telegramId);
        }
    }

    toggleCheckbox() {
        if (this.isSubmitting) return;
        
        const captchaBox = document.getElementById('captchaBox');
        const verifyBtn = document.getElementById('verifyBtn');
        
        this.isChecked = !this.isChecked;
        
        if (this.isChecked) {
            captchaBox.classList.add('checked');
            verifyBtn.disabled = false;
            // ИСПРАВЛЕНИЕ: Добавляем класс для активной кнопки
            verifyBtn.classList.add('active');
        } else {
            captchaBox.classList.remove('checked');
            verifyBtn.disabled = true;
            verifyBtn.classList.remove('active');
        }
    }

    verifyUser() {
        const btnText = document.getElementById('btnText');
        const loadingDots = document.getElementById('loadingDots');
        const verifyBtn = document.getElementById('verifyBtn');
        
        // Show loading state
        this.isSubmitting = true;
        verifyBtn.disabled = true;
        verifyBtn.classList.remove('active');
        btnText.style.display = 'none';
        loadingDots.style.display = 'flex';
        
        // Simulate verification process
        setTimeout(() => {
            this.completeVerification();
        }, 1500);
    }

    completeVerification() {
        const loadingDots = document.getElementById('loadingDots');
        const successMessage = document.getElementById('successMessage');
        const verifyBtn = document.getElementById('verifyBtn');
        
        // Show success state
        loadingDots.style.display = 'none';
        successMessage.style.display = 'flex';
        verifyBtn.style.display = 'none';
        
        // Send data to Telegram bot и закрываем WebApp
        this.sendDataToBot();
    }

    sendDataToBot() {
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                const resultData = {
                    status: 'verified',
                    user_data: this.userData,
                    telegram_id: this.userData.telegram_id,
                    timestamp: new Date().toISOString(),
                    verification_type: 'captcha'
                };
                
                console.log('Sending data to bot:', resultData);
                
                // Send data to bot - это закроет WebApp и вернет данные в бот
                Telegram.WebApp.sendData(JSON.stringify(resultData));
                
                // WebApp автоматически закроется после sendData
                
            } catch (error) {
                console.log('Error sending data to Telegram:', error);
                this.showFallbackSuccess();
            }
        } else {
            this.showFallbackSuccess();
        }
    }

    showFallbackSuccess() {
        // Fallback для обычного браузера
        const successMessage = document.getElementById('successMessage');
        successMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i>Verification completed! You can close this window.';
        successMessage.style.display = 'flex';
    }

    generateUserId() {
        const uniqueString = navigator.userAgent + screen.width + screen.height + new Date().getTime();
        let hash = 0;
        for (let i = 0; i < uniqueString.length; i++) {
            const char = uniqueString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}

// Initialize CAPTCHA when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CaptchaVerification();
    console.log('CAPTCHA system ready');
});
