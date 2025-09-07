/**
 * Dashboard App - Basic Foundation
 * Starting with minimal functionality to test the setup
 */

class DashboardApp {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('🚀 Dashboard App Starting...');
        
        // Initialize basic features
        this.initClock();
        this.initCustomizeButton();
        
        console.log('✅ Dashboard App Ready!');
    }

    // Simple clock functionality
    initClock() {
        const timeElement = document.getElementById('current-time');
        if (!timeElement) return;

        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = timeString;
        };

        // Update immediately and then every second
        updateTime();
        setInterval(updateTime, 1000);
    }

    // Basic customize button (just for testing)
    initCustomizeButton() {
        const customizeBtn = document.getElementById('customize-btn');
        if (!customizeBtn) return;

        customizeBtn.addEventListener('click', () => {
            console.log('Customize button clicked');
            
            // Simple toggle for now
            const isActive = customizeBtn.classList.contains('active');
            if (isActive) {
                customizeBtn.classList.remove('active');
                customizeBtn.innerHTML = '<i class="fas fa-edit"></i><span>Customize</span>';
                console.log('Customize mode OFF');
            } else {
                customizeBtn.classList.add('active');
                customizeBtn.innerHTML = '<i class="fas fa-times"></i><span>Exit</span>';
                console.log('Customize mode ON');
            }
        });
    }
}

// Start the app
new DashboardApp();
