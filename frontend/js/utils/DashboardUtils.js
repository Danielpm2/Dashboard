/**
 * Dashboard Utilities
 * Common utility functions and helpers for the dashboard
 */

class DashboardUtils {
    /**
     * Format date for display
     */
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleDateString('en-US', formatOptions);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }

    /**
     * Format time for display
     */
    static formatTime(time, format24Hour = false) {
        try {
            if (!time) return '';
            
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const min = minutes || '00';
            
            if (format24Hour) {
                return `${hour.toString().padStart(2, '0')}:${min}`;
            }
            
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            
            return `${displayHour}:${min} ${ampm}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return time;
        }
    }

    /**
     * Format date and time together
     */
    static formatDateTime(date, startTime, endTime) {
        const formattedDate = this.formatDate(date, { 
            month: 'short', 
            day: 'numeric' 
        });
        
        const formattedStartTime = this.formatTime(startTime);
        const formattedEndTime = this.formatTime(endTime);
        
        if (formattedStartTime && formattedEndTime) {
            return `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;
        } else if (formattedStartTime) {
            return `${formattedDate}, ${formattedStartTime}`;
        } else {
            return formattedDate;
        }
    }

    /**
     * Truncate text to specified length
     */
    static truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Escape HTML to prevent XSS
     */
    static escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Debounce function to limit rapid calls
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit calls frequency
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Check if element is in viewport
     */
    static isInViewport(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     */
    static scrollToElement(element, offset = 0) {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Copy text to clipboard
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const result = document.execCommand('copy');
                textArea.remove();
                return result;
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    }

    /**
     * Get URL parameters
     */
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    /**
     * Set URL parameter without page reload
     */
    static setUrlParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    }

    /**
     * Remove URL parameter without page reload
     */
    static removeUrlParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    }

    /**
     * Local storage helpers with error handling
     */
    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    };

    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate date format
     */
    static isValidDate(date) {
        const dateObj = new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj);
    }

    /**
     * Get relative time (e.g., "2 hours ago")
     */
    static getRelativeTime(date) {
        const now = new Date();
        const targetDate = new Date(date);
        const diffInSeconds = Math.floor((now - targetDate) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }
}

export default DashboardUtils;
