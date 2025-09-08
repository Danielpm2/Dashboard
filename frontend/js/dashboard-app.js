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
        this.selectedWidget = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragStartPos = null;
        this.resizeDirection = null;
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
        
        // Try to load saved layout, if none exists use default widgets
        const layoutLoaded = await this.loadLayout();
        
        if (!layoutLoaded) {
            // Initialize default widgets if no saved layout
            this.initWidgets();
        }
        
        // Add global mouse handlers
        this.initGlobalMouseHandlers();
        
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

        // Clear existing cells
        gridOverlay.innerHTML = '';

        // Create grid cells for visual feedback
        const totalCells = this.gridColumns * this.gridRows;
        for (let i = 0; i < totalCells; i++) {
            const row = Math.floor(i / this.gridColumns) + 1;
            const col = (i % this.gridColumns) + 1;
            
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.cellIndex = i;
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.textContent = `${row},${col}`;
            
            // Grid cells are now primarily for visual feedback
            // Positioning is handled by drag and drop
            
            gridOverlay.appendChild(cell);
        }
    }



    // Check if a grid position is available
    isPositionAvailable(gridPosition, excludeWidget = null) {
        const newPos = this.parseGridPosition(gridPosition);
        const widgets = document.querySelectorAll('dashboard-widget[data-grid-position]');
        
        for (const widget of widgets) {
            if (widget === excludeWidget) continue;
            
            const existingPosition = widget.dataset.gridPosition;
            if (!existingPosition) continue;
            
            const existingPos = this.parseGridPosition(existingPosition);
            
            // Check for overlap
            const noOverlap = (
                newPos.endRow <= existingPos.startRow ||
                newPos.startRow >= existingPos.endRow ||
                newPos.endCol <= existingPos.startCol ||
                newPos.startCol >= existingPos.endCol
            );
            
            if (!noOverlap) {
                return false; // Overlap detected
            }
        }
        
        return true;
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

        // Visual feedback
        widget.style.opacity = '0';
        widget.style.transform = 'scale(0.8)';
        
        // Animate in
        requestAnimationFrame(() => {
            widget.style.transition = 'all 0.3s ease';
            widget.style.opacity = '1';
            widget.style.transform = 'scale(1)';
        });

        console.log(`✅ Added ${type} widget successfully at position: ${position}`);
        
        // Save layout after adding widget
        this.saveLayout();
    }

    // Find next available grid position
    findNextAvailablePosition(width = 2, height = 2) {
        // Try to find space starting from top-left
        for (let row = 1; row <= this.gridRows - height + 1; row++) {
            for (let col = 1; col <= this.gridColumns - width + 1; col++) {
                const position = this.createGridPosition(row, col, row + height, col + width);
                if (this.isPositionAvailable(position)) {
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
        
        // Save layout after removing widget
        this.saveLayout();
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
            <button class="widget-control-btn remove-btn" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
            <div class="resize-handle resize-handle-se" title="Resize"></div>
            <div class="resize-handle resize-handle-s" title="Resize Height"></div>
            <div class="resize-handle resize-handle-e" title="Resize Width"></div>
        `;

        widget.appendChild(controls);

        // Bind control events
        const removeBtn = controls.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Remove this widget?')) {
                this.removeWidget(widget);
            }
        });

        // Add resize handles
        this.addResizeHandles(widget);
        
        // Add drag functionality
        this.addDragFunctionality(widget);
    }



    // Add drag functionality to widget
    addDragFunctionality(widget) {
        let startX, startY, startGridCol, startGridRow;
        
        const handleMouseDown = (e) => {
            if (!this.customizeMode || e.target.closest('.widget-controls') || e.target.closest('.resize-handle')) {
                return;
            }
            
            this.isDragging = true;
            this.draggedWidget = widget;
            
            startX = e.clientX;
            startY = e.clientY;
            
            // Get current position
            const position = this.parseGridPosition(widget.dataset.gridPosition);
            startGridCol = position.startCol;
            startGridRow = position.startRow;
            
            widget.classList.add('dragging');
            document.body.style.cursor = 'grabbing';
            
            e.preventDefault();
        };
        
        widget.addEventListener('mousedown', handleMouseDown);
    }

    // Add resize handles functionality
    addResizeHandles(widget) {
        const handles = widget.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                if (!this.customizeMode) return;
                
                e.stopPropagation();
                e.preventDefault();
                
                this.isResizing = true;
                this.resizingWidget = widget;
                this.resizeDirection = handle.classList.contains('resize-handle-se') ? 'se' :
                                    handle.classList.contains('resize-handle-s') ? 's' : 'e';
                
                widget.classList.add('resizing');
                document.body.style.cursor = this.getResizeCursor(this.resizeDirection);
            });
        });
    }

    // Get appropriate cursor for resize direction
    getResizeCursor(direction) {
        switch (direction) {
            case 'se': return 'se-resize';
            case 's': return 's-resize';
            case 'e': return 'e-resize';
            default: return 'resize';
        }
    }

    // Parse grid position string into object
    parseGridPosition(gridPosition) {
        const parts = gridPosition.split(' / ').map(Number);
        return {
            startRow: parts[0],
            startCol: parts[1],
            endRow: parts[2],
            endCol: parts[3]
        };
    }

    // Create grid position string from coordinates
    createGridPosition(startRow, startCol, endRow, endCol) {
        return `${startRow} / ${startCol} / ${endRow} / ${endCol}`;
    }

    // Get grid cell from mouse coordinates  
    getGridCellFromCoords(x, y) {
        const grid = document.getElementById('dashboard-grid');
        const gridRect = grid.getBoundingClientRect();
        
        // Calculate relative position within grid
        const relativeX = x - gridRect.left;
        const relativeY = y - gridRect.top;
        
        // Account for gap and calculate cell
        const cellWidth = (gridRect.width - (this.gridColumns - 1) * 20) / this.gridColumns;
        const cellHeight = 140 + 20; // cell height + gap
        
        const col = Math.max(1, Math.min(this.gridColumns, Math.floor(relativeX / (cellWidth + 20)) + 1));
        const row = Math.max(1, Math.min(this.gridRows, Math.floor(relativeY / cellHeight) + 1));
        
        return { row, col };
    }

    // End resize mode
    endResize() {
        if (this.resizingWidget) {
            this.resizingWidget.classList.remove('resizing');
            this.resizingWidget = null;
            this.isResizing = false;
            this.resizeDirection = null;
            document.body.style.cursor = '';
        }
    }

    // End drag mode
    endDrag() {
        if (this.draggedWidget) {
            this.draggedWidget.classList.remove('dragging');
            this.draggedWidget = null;
            this.isDragging = false;
            document.body.style.cursor = '';
        }
    }

    // Initialize global mouse handlers for drag and resize
    initGlobalMouseHandlers() {
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.draggedWidget) {
                this.handleDrag(e);
            } else if (this.isResizing && this.resizingWidget) {
                this.handleResize(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.finalizeDrag(e);
            } else if (this.isResizing) {
                this.finalizeResize(e);
            }
        });
    }

    // Handle drag movement
    handleDrag(e) {
        const cell = this.getGridCellFromCoords(e.clientX, e.clientY);
        
        // Visual feedback - highlight drop zone
        this.highlightDropZone(cell.row, cell.col);
    }

    // Handle resize movement
    handleResize(e) {
        const cell = this.getGridCellFromCoords(e.clientX, e.clientY);
        
        // Visual feedback - show potential new size
        this.previewResize(cell.row, cell.col);
    }

    // Finalize drag operation
    finalizeDrag(e) {
        if (!this.draggedWidget) return;
        
        const cell = this.getGridCellFromCoords(e.clientX, e.clientY);
        const currentPosition = this.parseGridPosition(this.draggedWidget.dataset.gridPosition);
        
        // Calculate widget dimensions
        const width = currentPosition.endCol - currentPosition.startCol;
        const height = currentPosition.endRow - currentPosition.startRow;
        
        // Create new position
        const newEndCol = Math.min(this.gridColumns + 1, cell.col + width);
        const newEndRow = Math.min(this.gridRows + 1, cell.row + height);
        const newPosition = this.createGridPosition(cell.row, cell.col, newEndRow, newEndCol);
        
        // Check if position is valid
        if (this.isPositionAvailable(newPosition, this.draggedWidget)) {
            this.draggedWidget.dataset.gridPosition = newPosition;
            this.draggedWidget.style.gridArea = newPosition;
            console.log(`Moved widget to: ${newPosition}`);
            
            // Save layout after moving
            this.saveLayout();
        } else {
            console.log('Position not available, reverting');
        }
        
        this.clearDropZoneHighlight();
        this.endDrag();
    }

    // Finalize resize operation
    finalizeResize(e) {
        if (!this.resizingWidget) return;
        
        const cell = this.getGridCellFromCoords(e.clientX, e.clientY);
        const currentPosition = this.parseGridPosition(this.resizingWidget.dataset.gridPosition);
        
        let newPosition;
        
        switch (this.resizeDirection) {
            case 'se':
                newPosition = this.createGridPosition(
                    currentPosition.startRow,
                    currentPosition.startCol,
                    Math.min(this.gridRows + 1, cell.row + 1),
                    Math.min(this.gridColumns + 1, cell.col + 1)
                );
                break;
            case 's':
                newPosition = this.createGridPosition(
                    currentPosition.startRow,
                    currentPosition.startCol,
                    Math.min(this.gridRows + 1, cell.row + 1),
                    currentPosition.endCol
                );
                break;
            case 'e':
                newPosition = this.createGridPosition(
                    currentPosition.startRow,
                    currentPosition.startCol,
                    currentPosition.endRow,
                    Math.min(this.gridColumns + 1, cell.col + 1)
                );
                break;
        }
        
        // Ensure minimum size
        const position = this.parseGridPosition(newPosition);
        if (position.endRow > position.startRow + 1 && position.endCol > position.startCol + 1) {
            if (this.isPositionAvailable(newPosition, this.resizingWidget)) {
                this.resizingWidget.dataset.gridPosition = newPosition;
                this.resizingWidget.style.gridArea = newPosition;
                console.log(`Resized widget to: ${newPosition}`);
                
                // Save layout after resizing
                this.saveLayout();
            }
        }
        
        this.clearResizePreview();
        this.endResize();
    }

    // Highlight drop zone during drag
    highlightDropZone(row, col) {
        this.clearDropZoneHighlight();
        
        if (!this.draggedWidget) return;
        
        const currentPosition = this.parseGridPosition(this.draggedWidget.dataset.gridPosition);
        const width = currentPosition.endCol - currentPosition.startCol;
        const height = currentPosition.endRow - currentPosition.startRow;
        
        // Highlight cells that would be occupied
        for (let r = row; r < row + height && r <= this.gridRows; r++) {
            for (let c = col; c < col + width && c <= this.gridColumns; c++) {
                const cell = document.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.add('drop-zone');
                }
            }
        }
    }

    // Clear drop zone highlighting
    clearDropZoneHighlight() {
        document.querySelectorAll('.grid-cell.drop-zone').forEach(cell => {
            cell.classList.remove('drop-zone');
        });
    }

    // Preview resize during resize operation
    previewResize(row, col) {
        // Implementation for resize preview can be added here
        // For now, we'll keep it simple
    }

    // Clear resize preview
    clearResizePreview() {
        // Clear any resize preview styling
    }



    // Initialize all dashboard widgets
    initWidgets() {
        const widgets = document.querySelectorAll('dashboard-widget');
        
        widgets.forEach(widget => {
            const widgetType = widget.dataset.widgetType;
            const widgetId = widget.dataset.widgetId;
            
            this.initSingleWidget(widget, widgetType, widgetId);
        });
    }

    // Initialize a single widget
    initSingleWidget(element, widgetType, widgetId) {
        try {
            switch (widgetType) {
                case 'notes':
                    this.initNotesWidget(element, widgetId);
                    break;
                case 'welcome':
                    this.initWelcomeWidget(element, widgetId);
                    break;
                case 'calendar':
                    this.initCalendarWidget(element, widgetId);
                    break;
                case 'events':
                    this.initEventsWidget(element, widgetId);
                    break;
                case 'clock':
                    this.initClockWidget(element, widgetId);
                    break;
                case 'image':
                    this.initImageWidget(element, widgetId);
                    break;
                case 'links':
                    this.initLinksWidget(element, widgetId);
                    break;
                case 'weather':
                    this.initWeatherWidget(element, widgetId);
                    break;
                case 'todo':
                    this.initTodoWidget(element, widgetId);
                    break;
                default:
                    console.warn(`Unknown widget type: ${widgetType}`);
            }
        } catch (error) {
            console.error(`Failed to initialize ${widgetType} widget:`, error);
            this.showWidgetError(element, error.message);
        }
    }

    // Initialize Notes Widget
    initNotesWidget(element, id) {
        console.log(`Initializing Notes Widget: ${id}`);
        
        const widget = new NotesWidget(element);
        this.widgets.set(id, widget);
        
        element.classList.add('notes-widget');
        
        // Store reference for easy access
        this.notesWidget = widget;
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

    // Initialize Calendar Widget
    initCalendarWidget(element, id) {
        console.log(`Initializing Calendar Widget: ${id}`);
        
        const widget = new CalendarWidget(element);
        this.widgets.set(id, widget);
        
        element.classList.add('calendar-widget');
    }

    // Initialize Events Widget
    initEventsWidget(element, id) {
        console.log(`Initializing Events Widget: ${id}`);
        
        const widget = new EventsWidget(element);
        this.widgets.set(id, widget);
        
        element.classList.add('events-widget');
    }

    // Initialize Clock Widget
    initClockWidget(element, id) {
        console.log(`Initializing Clock Widget: ${id}`);
        
        element.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-clock"></i> Clock</h3>
            </div>
            <div class="widget-content clock-content">
                <div class="clock-display">
                    <div class="time" id="clock-time-${id}">00:00:00</div>
                    <div class="date" id="clock-date-${id}">Loading...</div>
                </div>
            </div>
        `;
        
        element.classList.add('clock-widget');
        
        // Update clock
        const updateClock = () => {
            const now = new Date();
            const timeElement = element.querySelector(`#clock-time-${id}`);
            const dateElement = element.querySelector(`#clock-date-${id}`);
            
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString();
            }
            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Initialize Image Widget
    initImageWidget(element, id) {
        console.log(`Initializing Image Widget: ${id}`);
        
        element.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-image"></i> Image</h3>
            </div>
            <div class="widget-content image-content">
                <div class="image-placeholder">
                    <i class="fas fa-image"></i>
                    <h4>Image Widget</h4>
                    <p>Upload or add image URL</p>
                    <button class="btn btn-primary">Add Image</button>
                </div>
            </div>
        `;
        
        element.classList.add('image-widget');
    }

    // Initialize Links Widget
    initLinksWidget(element, id) {
        console.log(`Initializing Links Widget: ${id}`);
        
        element.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-link"></i> Quick Links</h3>
                <button class="widget-action-btn" title="Add Link">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="widget-content links-content">
                <div class="links-list">
                    <a href="https://github.com" class="link-item" target="_blank">
                        <i class="fab fa-github"></i>
                        <span>GitHub</span>
                    </a>
                    <a href="https://stackoverflow.com" class="link-item" target="_blank">
                        <i class="fab fa-stack-overflow"></i>
                        <span>Stack Overflow</span>
                    </a>
                    <a href="https://developer.mozilla.org" class="link-item" target="_blank">
                        <i class="fas fa-book"></i>
                        <span>MDN Docs</span>
                    </a>
                </div>
            </div>
        `;
        
        element.classList.add('links-widget');
    }

    // Initialize Weather Widget
    initWeatherWidget(element, id) {
        console.log(`Initializing Weather Widget: ${id}`);
        
        element.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-cloud-sun"></i> Weather</h3>
                <button class="widget-action-btn" title="Refresh Weather">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
            <div class="widget-content weather-content">
                <div class="weather-info">
                    <div class="weather-main">
                        <div class="temperature">23°C</div>
                        <div class="weather-icon">
                            <i class="fas fa-sun"></i>
                        </div>
                    </div>
                    <div class="weather-details">
                        <div class="location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>New York, NY</span>
                        </div>
                        <div class="conditions">Sunny</div>
                        <div class="humidity">
                            <i class="fas fa-tint"></i>
                            <span>Humidity: 45%</span>
                        </div>
                        <div class="wind">
                            <i class="fas fa-wind"></i>
                            <span>Wind: 8 km/h</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        element.classList.add('weather-widget');
    }

    // Initialize Todo Widget
    initTodoWidget(element, id) {
        console.log(`Initializing Todo Widget: ${id}`);
        
        element.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-check-square"></i> Todo List</h3>
                <button class="widget-action-btn" id="add-todo-${id}" title="Add Todo">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="widget-content todo-content">
                <div class="add-todo-form hidden" id="add-todo-form-${id}">
                    <input type="text" placeholder="What needs to be done?" id="todo-input-${id}" maxlength="100">
                    <div class="todo-actions">
                        <button class="btn btn-sm btn-primary" id="save-todo-${id}">Add</button>
                        <button class="btn btn-sm btn-secondary" id="cancel-todo-${id}">Cancel</button>
                    </div>
                </div>
                <div class="todo-list" id="todo-list-${id}">
                    <div class="todo-item">
                        <input type="checkbox" id="todo-1-${id}">
                        <label for="todo-1-${id}">Review project requirements</label>
                        <button class="delete-todo-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="todo-item">
                        <input type="checkbox" id="todo-2-${id}" checked>
                        <label for="todo-2-${id}" class="completed">Set up development environment</label>
                        <button class="delete-todo-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="todo-item">
                        <input type="checkbox" id="todo-3-${id}">
                        <label for="todo-3-${id}">Write unit tests</label>
                        <button class="delete-todo-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        element.classList.add('todo-widget');
        
        // Add todo functionality
        this.bindTodoEvents(element, id);
    }

    // Bind todo widget events
    bindTodoEvents(element, id) {
        const addBtn = element.querySelector(`#add-todo-${id}`);
        const addForm = element.querySelector(`#add-todo-form-${id}`);
        const todoInput = element.querySelector(`#todo-input-${id}`);
        const saveBtn = element.querySelector(`#save-todo-${id}`);
        const cancelBtn = element.querySelector(`#cancel-todo-${id}`);
        const todoList = element.querySelector(`#todo-list-${id}`);

        // Show add form
        addBtn?.addEventListener('click', () => {
            addForm?.classList.remove('hidden');
            todoInput?.focus();
        });

        // Hide add form
        cancelBtn?.addEventListener('click', () => {
            addForm?.classList.add('hidden');
            todoInput.value = '';
        });

        // Save todo
        saveBtn?.addEventListener('click', () => {
            const text = todoInput?.value.trim();
            if (text) {
                this.addTodoItem(todoList, text, id);
                todoInput.value = '';
                addForm?.classList.add('hidden');
            }
        });

        // Enter to save
        todoInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveBtn?.click();
            }
        });

        // Bind existing todo events
        this.bindExistingTodoEvents(element, id);
    }

    // Add new todo item
    addTodoItem(todoList, text, widgetId) {
        const todoId = `todo-${Date.now()}-${widgetId}`;
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.innerHTML = `
            <input type="checkbox" id="${todoId}">
            <label for="${todoId}">${this.escapeHtml(text)}</label>
            <button class="delete-todo-btn" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        todoList.appendChild(todoItem);
        this.bindTodoItemEvents(todoItem);
    }

    // Bind events for existing todo items
    bindExistingTodoEvents(element, id) {
        const todoItems = element.querySelectorAll('.todo-item');
        todoItems.forEach(item => this.bindTodoItemEvents(item));
    }

    // Bind events for a single todo item
    bindTodoItemEvents(todoItem) {
        const checkbox = todoItem.querySelector('input[type="checkbox"]');
        const label = todoItem.querySelector('label');
        const deleteBtn = todoItem.querySelector('.delete-todo-btn');

        // Toggle completion
        checkbox?.addEventListener('change', () => {
            if (checkbox.checked) {
                label?.classList.add('completed');
            } else {
                label?.classList.remove('completed');
            }
        });

        // Delete todo
        deleteBtn?.addEventListener('click', () => {
            if (confirm('Delete this todo item?')) {
                todoItem.remove();
            }
        });
    }

    // Escape HTML for security
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Reset dashboard to default layout
    resetToDefaultLayout() {
        if (confirm('Reset dashboard to default layout? This will remove all custom positioning and added widgets.')) {
            console.log('🔄 Resetting to default layout');
            
            // Clear saved layout
            localStorage.removeItem('dashboard-layout');
            
            // Reload the page to restore default
            window.location.reload();
        }
    }

    // Export layout as JSON (for backup/sharing)
    exportLayout() {
        const layout = this.saveLayout();
        const dataStr = JSON.stringify(layout, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dashboard-layout-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('📥 Layout exported');
    }

    // Import layout from JSON file
    importLayout(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const layout = JSON.parse(e.target.result);
                localStorage.setItem('dashboard-layout', JSON.stringify(layout));
                
                console.log('📤 Layout imported, reloading...');
                window.location.reload();
                
            } catch (error) {
                console.error('Failed to import layout:', error);
                alert('Invalid layout file');
            }
        };
        reader.readAsText(file);
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
            console.log('Customize button clicked');
            this.toggleCustomizeMode();
        });

        doneBtn?.addEventListener('click', () => {
            this.exitCustomizeMode();
        });

        // Layout management buttons
        const resetBtn = document.getElementById('reset-layout-btn');
        const exportBtn = document.getElementById('export-layout-btn');
        const importInput = document.getElementById('import-layout');

        resetBtn?.addEventListener('click', () => {
            this.resetToDefaultLayout();
        });

        exportBtn?.addEventListener('click', () => {
            this.exportLayout();
        });

        importInput?.addEventListener('change', (e) => {
            this.importLayout(e);
        });
    }

    toggleCustomizeMode() {
        console.log('Toggle customize mode, current mode:', this.customizeMode);
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
        
        console.log('Widget panel element:', widgetPanel);
        console.log('Widget panel classes before:', widgetPanel?.className);

        if (customizeBtn) {
            customizeBtn.classList.add('active');
            customizeBtn.innerHTML = '<i class="fas fa-times"></i><span>Exit</span>';
        }

        if (widgetPanel) {
            widgetPanel.classList.remove('hidden');
            widgetPanel.classList.add('show');
            console.log('Widget panel classes after:', widgetPanel.className);
        }
        if (gridOverlay) {
            gridOverlay.classList.remove('hidden');
            gridOverlay.classList.add('show');
        }

        // Add customize mode class to body for styling
        document.body.classList.add('customize-mode');

        // Add controls to all widgets
        document.querySelectorAll('dashboard-widget').forEach(widget => {
            this.addWidgetControls(widget);
        });

        console.log('📋 Customize mode active - Click widgets to select/move, use controls to resize/remove');
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

        if (widgetPanel) {
            widgetPanel.classList.remove('show');
            widgetPanel.classList.add('hidden');
        }
        if (gridOverlay) {
            gridOverlay.classList.add('hidden');
            gridOverlay.classList.remove('show');
        }

        // Remove customize mode class
        document.body.classList.remove('customize-mode');

        // Remove controls from all widgets
        document.querySelectorAll('.widget-controls').forEach(controls => {
            controls.remove();
        });

        // Clear all states
        this.endResize();
        this.endDrag();
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

    // Save dashboard layout to localStorage
    saveLayout() {
        const layout = {
            widgets: {},
            lastSaved: new Date().toISOString()
        };
        
        document.querySelectorAll('dashboard-widget').forEach(widget => {
            const id = widget.dataset.widgetId;
            const position = widget.dataset.gridPosition;
            const type = widget.dataset.widgetType;
            
            if (id && position && type) {
                layout.widgets[id] = {
                    type,
                    position,
                    gridArea: widget.style.gridArea
                };
            }
        });
        
        console.log('💾 Saving dashboard layout:', layout);
        localStorage.setItem('dashboard-layout', JSON.stringify(layout));
        return layout;
    }

    // Load dashboard layout from localStorage
    async loadLayout() {
        try {
            const savedLayout = localStorage.getItem('dashboard-layout');
            if (!savedLayout) {
                console.log('📂 No saved layout found, using default');
                return false;
            }
            
            const layout = JSON.parse(savedLayout);
            console.log('📂 Loading saved layout:', layout);
            
            if (!layout.widgets) {
                console.warn('Invalid layout format');
                return false;
            }
            
            // Clear existing widgets first
            this.clearAllWidgets();
            
            // Restore widgets from saved layout
            for (const [widgetId, widgetData] of Object.entries(layout.widgets)) {
                await this.restoreWidget(widgetId, widgetData);
            }
            
            console.log('✅ Layout restored successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to load layout:', error);
            return false;
        }
    }

    // Clear all existing widgets
    clearAllWidgets() {
        const existingWidgets = document.querySelectorAll('dashboard-widget');
        existingWidgets.forEach(widget => {
            const widgetId = widget.dataset.widgetId;
            if (widgetId) {
                this.widgets.delete(widgetId);
            }
            widget.remove();
        });
    }

    // Restore a single widget from saved data
    async restoreWidget(widgetId, widgetData) {
        try {
            const { type, position } = widgetData;
            
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

            console.log(`✅ Restored ${type} widget: ${widgetId} at ${position}`);
            
        } catch (error) {
            console.error(`Failed to restore widget ${widgetId}:`, error);
        }
    }
}

// Start the app
const dashboardApp = new DashboardApp();

// Make it globally accessible for debugging
window.dashboardApp = dashboardApp;
