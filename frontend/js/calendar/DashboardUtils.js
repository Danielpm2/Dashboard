// Dashboard utility functions
class DashboardUtils {
    static async refreshCalendar() {
        if (window.dashboard && typeof window.dashboard.loadGoogleCalendar === 'function') {
            console.log('Dashboard found, calling loadGoogleCalendar...');
            try {
                await window.dashboard.loadGoogleCalendar();
                console.log('Dashboard refreshed successfully');
                return true;
            } catch (err) {
                console.error('Error refreshing dashboard:', err);
                return false;
            }
        } else {
            console.error('Dashboard not found or loadGoogleCalendar method not available');
            console.log('window.dashboard:', window.dashboard);
            return false;
        }
    }

    static isDashboardReady() {
        return window.dashboard && typeof window.dashboard.loadGoogleCalendar === 'function';
    }

    static logDashboardStatus() {
        console.log('Dashboard status:', {
            exists: !!window.dashboard,
            hasLoadMethod: !!(window.dashboard && window.dashboard.loadGoogleCalendar),
            methodType: window.dashboard ? typeof window.dashboard.loadGoogleCalendar : 'undefined'
        });
    }
}

export default DashboardUtils;
