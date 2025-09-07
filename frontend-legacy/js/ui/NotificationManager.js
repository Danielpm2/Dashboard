/**
 * Notification Manager
 * Handles all application notifications and alerts
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        // Remove existing container if it exists
        const existing = document.getElementById('notificationContainer');
        if (existing) {
            existing.remove();
        }

        // Create new container
        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" type="button">&times;</button>
            </div>
        `;

        // Add close event
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.onclick = () => this.remove(notification);

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    remove(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Remove from notifications array
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
        this.notifications = [];
    }

    destroy() {
        this.clear();
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

// Create global instance
const notificationManager = new NotificationManager();

export default notificationManager;
