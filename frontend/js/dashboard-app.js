/**
 * Dashboard App - Enhanced with Grid Management
 * Now includes dynamic widget positioning, resizing, and management
 */

class DashboardApp {
    constructor() {
        this.widgets = new Map();
        this.customizeMode = false;
        this.gridColumns = 6;
        this.gridRows = 8;
        this.draggedWidget = null;
        this.resizingWidget = null;
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

    async setup() {
        console.log('🚀 Dashboard App Starting...');
        
        // Initialize basic features
        this.initClock();
        this.initCustomizeButton();
        
        // Wait for dependencies to load
        await this.waitForDependencies();
        
        // Initialize grid system
        this.initGridSystem();
        
        // Initialize widgets
        this.initWidgets();
        
        console.log('✅ Dashboard App Ready!');
    }

    // Wait for external dependencies to load
    waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (window.NotesAPI && window.NotesWidget) {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    // Initialize grid system
    initGridSystem() {
        console.log('🎯 Initializing Grid System...');
        
        // Apply grid positions from data attributes
        this.applyGridPositions();
        
        // Initialize grid overlay
        this.initGridOverlay();
        
        // Initialize widget panel
        this.initWidgetPanel();
    }

    // Apply grid positions to widgets
    applyGridPositions() {
        const widgets = document.querySelectorAll('dashboard-widget[data-grid-position]');
        
        widgets.forEach(widget => {
            const gridPosition = widget.dataset.gridPosition;
            if (gridPosition) {
                widget.style.gridArea = gridPosition;
                console.log(`📍 Applied grid position: ${gridPosition} to ${widget.dataset.widgetId}`);
            }
        });
    }

    // Initialize grid overlay for visual feedback
    initGridOverlay() {
        const gridOverlay = document.getElementById('grid-overlay');
        if (!gridOverlay) return;

        // Create grid cells for visual feedback
        const totalCells = this.gridColumns * this.gridRows;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.cellIndex = i;
            cell.textContent = i + 1;
            gridOverlay.appendChild(cell);
        }
    }

    // Initialize widget panel with add/remove functionality
    initWidgetPanel() {
        const widgetTypeButtons = document.querySelectorAll('.widget-type-btn');
        
        widgetTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const widgetType = btn.dataset.widgetType;
                this.addWidget(widgetType);
            });
        });
    }

    // Add new widget to dashboard
    addWidget(type) {
        console.log(`➕ Adding new ${type} widget`);
        
        // Find next available position
        const position = this.findNextAvailablePosition();
        if (!position) {
            alert('No space available for new widget');
            return;
        }

        // Create unique ID
        const widgetId = `${type}-${Date.now()}`;
        
        // Create widget element
        const widget = document.createElement('dashboard-widget');
        widget.dataset.widgetType = type;
        widget.dataset.widgetId = widgetId;
        widget.dataset.gridPosition = position;
        widget.className = 'widget-item';
        widget.style.gridArea = position;

        // Add to grid
        const grid = document.getElementById('dashboard-grid');
        grid.appendChild(widget);

        // Initialize the widget
        this.initSingleWidget(widget, type, widgetId);

        // Add remove button in customize mode
        if (this.customizeMode) {
            this.addWidgetControls(widget);
        }
    }

    // Find next available grid position
    findNextAvailablePosition() {
        const occupiedPositions = new Set();
        
        // Get all current widget positions
        document.querySelectorAll('dashboard-widget[data-grid-position]').forEach(widget => {
            const pos = widget.dataset.gridPosition;
            if (pos) {
                occupiedPositions.add(pos);
            }
        });

        // Find first available 2x2 area
        for (let row = 1; row <= this.gridRows - 1; row++) {
            for (let col = 1; col <= this.gridColumns - 1; col++) {
                const position = `${row} / ${col} / ${row + 2} / ${col + 2}`;
                if (!occupiedPositions.has(position)) {
                    return position;
                }
            }
        }

        return null; // No space available
    }

    // Remove widget from dashboard
    removeWidget(widgetElement) {
        const widgetId = widgetElement.dataset.widgetId;
        console.log(`🗑️ Removing widget: ${widgetId}`);
        
        // Remove from widgets map
        this.widgets.delete(widgetId);
        
        // Remove from DOM
        widgetElement.remove();
    }

    // Add controls to widget in customize mode
    addWidgetControls(widget) {
        // Remove existing controls
        const existingControls = widget.querySelector('.widget-controls');
        if (existingControls) {
            existingControls.remove();
        }

        const controls = document.createElement('div');
        controls.className = 'widget-controls';
        controls.innerHTML = `
            <button class="widget-control-btn resize-btn" title="Resize">
                <i class="fas fa-expand-arrows-alt"></i>
            </button>
            <button class="widget-control-btn remove-btn" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        `;

        widget.appendChild(controls);

        // Bind control events
        const removeBtn = controls.querySelector('.remove-btn');
        const resizeBtn = controls.querySelector('.resize-btn');

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Remove this widget?')) {
                this.removeWidget(widget);
            }
        });

        resizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startResize(widget);
        });
    }

    // Start resize mode for widget
    startResize(widget) {
        console.log('🔄 Starting resize mode');
        this.resizingWidget = widget;
        widget.classList.add('resizing');
        
        // Add resize handles or show grid for selection
        this.showResizeGrid(widget);
    }

    // Show resize grid
    showResizeGrid(widget) {
        // This is a placeholder for resize functionality
        // You can implement click-to-resize on grid cells
        console.log('Resize grid shown for widget:', widget.dataset.widgetId);
    }

    // Initialize all dashboard widgets
    initWidgets() {
        const widgets = document.querySelectorAll('dashboard-widget');
        
        widgets.forEach(widget => {
            const widgetType = widget.dataset.widgetType;
            const widgetId = widget.dataset.widgetId;
            
            try {
                switch (widgetType) {
                    case 'notes':
                        this.initNotesWidget(widget, widgetId);
                        break;
                    case 'welcome':
                        this.initWelcomeWidget(widget, widgetId);
                        break;
                    case 'calendar':
                        this.initCalendarWidget(widget, widgetId);
                        break;
                    default:
                        console.warn(`Unknown widget type: ${widgetType}`);
                }
            } catch (error) {
                console.error(`Failed to initialize ${widgetType} widget:`, error);
                this.showWidgetError(widget, error.message);
            }
        });
    }

    // Initialize Notes Widget
    initNotesWidget(element, id) {
        console.log(`Initializing Notes Widget: ${id}`);
        
        const widget = new NotesWidget(element);
        this.widgets.set(id, widget);
        
        element.classList.add('notes-widget');
    }

    // Initialize Welcome Widget (simple)
    initWelcomeWidget(element, id) {
        console.log(`Initializing Welcome Widget: ${id}`);
        
        element.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-home"></i> Welcome</h3>
            </div>
            <div class="widget-content welcome-content">
                <div class="welcome-message">
                    <h2>Welcome to your Dashboard!</h2>
                    <p>Your personalized workspace is ready. Use the customize button to add and arrange widgets.</p>
                    <div class="quick-stats">
                        <div class="stat-item">
                            <i class="fas fa-sticky-note"></i>
                            <span>Notes ready</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-calendar"></i>
                            <span>Calendar connected</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <span id="welcome-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        element.classList.add('welcome-widget');
        
        // Update time in welcome widget
        setInterval(() => {
            const timeElement = element.querySelector('#welcome-time');
            if (timeElement) {
                timeElement.textContent = new Date().toLocaleTimeString();
            }
        }, 1000);
    }

    // Initialize Calendar Widget (placeholder)
    initCalendarWidget(element, id) {
        console.log(`Initializing Calendar Widget: ${id}`);
        
        element.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-calendar"></i> Calendar</h3>
            </div>
            <div class="widget-content calendar-content">
                <div class="calendar-placeholder">
                    <i class="fas fa-calendar-alt"></i>
                    <h4>Calendar Integration</h4>
                    <p>Calendar functionality will be available soon.</p>
                    <small>Connect your Google Calendar for events and scheduling.</small>
                </div>
            </div>
        `;
        
        element.classList.add('calendar-widget');
    }

    // Show error in widget
    showWidgetError(element, message) {
        element.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
            </div>
            <div class="widget-content error-content">
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Widget failed to load</p>
                    <small>${message}</small>
                </div>
            </div>
        `;
        element.classList.add('widget-error');
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

    // Enhanced customize button functionality
    initCustomizeButton() {
        const customizeBtn = document.getElementById('customize-btn');
        const widgetPanel = document.getElementById('widget-panel');
        const gridOverlay = document.getElementById('grid-overlay');
        const doneBtn = document.getElementById('done-customizing');

        if (!customizeBtn) return;

        customizeBtn.addEventListener('click', () => {
            this.toggleCustomizeMode();
        });

        doneBtn?.addEventListener('click', () => {
            this.exitCustomizeMode();
        });
    }

    toggleCustomizeMode() {
        if (this.customizeMode) {
            this.exitCustomizeMode();
        } else {
            this.enterCustomizeMode();
        }
    }

    enterCustomizeMode() {
        console.log('Entering customize mode');
        this.customizeMode = true;

        const customizeBtn = document.getElementById('customize-btn');
        const widgetPanel = document.getElementById('widget-panel');
        const gridOverlay = document.getElementById('grid-overlay');

        if (customizeBtn) {
            customizeBtn.classList.add('active');
            customizeBtn.innerHTML = '<i class="fas fa-times"></i><span>Exit</span>';
        }

        widgetPanel?.classList.remove('hidden');
        gridOverlay?.classList.remove('hidden');

        // Add customize mode class to body for styling
        document.body.classList.add('customize-mode');
    }

    exitCustomizeMode() {
        console.log('Exiting customize mode');
        this.customizeMode = false;

        const customizeBtn = document.getElementById('customize-btn');
        const widgetPanel = document.getElementById('widget-panel');
        const gridOverlay = document.getElementById('grid-overlay');

        if (customizeBtn) {
            customizeBtn.classList.remove('active');
            customizeBtn.innerHTML = '<i class="fas fa-edit"></i><span>Customize</span>';
        }

        widgetPanel?.classList.add('hidden');
        gridOverlay?.classList.add('hidden');

        // Remove customize mode class
        document.body.classList.remove('customize-mode');
    }

    // Get widget by ID
    getWidget(id) {
        return this.widgets.get(id);
    }

    // Refresh all widgets
    async refreshWidgets() {
        for (const [id, widget] of this.widgets) {
            if (widget.refresh && typeof widget.refresh === 'function') {
                try {
                    await widget.refresh();
                } catch (error) {
                    console.error(`Failed to refresh widget ${id}:`, error);
                }
            }
        }
    }
}

// Start the app
const dashboardApp = new DashboardApp();

// Make it globally accessible for debugging
window.dashboardApp = dashboardApp;
