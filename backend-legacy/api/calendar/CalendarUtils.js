class CalendarUtils {
    static getMockEvents() {
        const now = new Date();
        const events = [];
        
        // Create some mock events for the next few days
        for (let i = 0; i < 7; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + i);
            
            if (i === 0) { // Today
                events.push({
                    id: `mock-${i}-1`,
                    title: 'Team Standup',
                    description: 'Daily team synchronization meeting',
                    start: new Date(eventDate.setHours(9, 0)).toISOString(),
                    end: new Date(eventDate.setHours(9, 30)).toISOString(),
                    location: 'Conference Room A',
                    status: 'confirmed'
                });
                
                events.push({
                    id: `mock-${i}-2`,
                    title: 'Project Review',
                    description: 'Review progress on dashboard project',
                    start: new Date(eventDate.setHours(14, 0)).toISOString(),
                    end: new Date(eventDate.setHours(15, 0)).toISOString(),
                    location: 'Online',
                    status: 'confirmed'
                });
            } else if (i === 1) { // Tomorrow
                events.push({
                    id: `mock-${i}-1`,
                    title: 'Client Meeting',
                    description: 'Discuss project requirements and timeline',
                    start: new Date(eventDate.setHours(10, 0)).toISOString(),
                    end: new Date(eventDate.setHours(11, 0)).toISOString(),
                    location: 'Client Office',
                    status: 'confirmed'
                });
            } else if (i === 3) { // Day after tomorrow
                events.push({
                    id: `mock-${i}-1`,
                    title: 'Code Review Session',
                    description: 'Review recent code changes and improvements',
                    start: new Date(eventDate.setHours(16, 0)).toISOString(),
                    end: new Date(eventDate.setHours(17, 0)).toISOString(),
                    location: 'Development Lab',
                    status: 'confirmed'
                });
            }
        }
        
        return events;
    }

    static groupEventsByDate(events) {
        const grouped = {};
        
        events.forEach(event => {
            const eventDate = new Date(event.start);
            const dateKey = eventDate.toDateString();
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            grouped[dateKey].push(event);
        });
        
        return grouped;
    }

    static formatEventTime(start, end) {
        try {
            // Check if it's an all-day event (no 'T' in the date string)
            const isAllDay = !start.includes('T');
            
            if (isAllDay) {
                const startDate = new Date(start + 'T00:00:00');
                return startDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                });
            }
            
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            // Check if dates are valid
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return 'Date invalide';
            }
            
            const startTime = startDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const endTime = endDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `${startTime} - ${endTime}`;
        } catch (error) {
            console.error('Error formatting event time:', error);
            return 'Heure non disponible';
        }
    }
}

module.exports = CalendarUtils;
