const express = require('express');
const router = express.Router();
const { getConnection } = require('../api/database');

// Get all panels with widgets
router.get('/', async (req, res) => {
    try {
        const db = await getConnection();
        
        // Get panels
        const [panels] = await db.execute('SELECT * FROM panels ORDER BY panel_key');
        
        // Get widgets for each panel
        const result = {};
        
        for (const panel of panels) {
            const [widgets] = await db.execute(
                'SELECT * FROM widgets WHERE panel_key = ? ORDER BY widget_order',
                [panel.panel_key]
            );
            
            result[panel.panel_key] = {
                title: panel.title,
                widgets: widgets.map(widget => ({
                    id: widget.widget_id,
                    title: widget.title,
                    content: widget.content,
                    color: widget.color,
                    large: widget.is_large,
                    small: widget.is_small
                }))
            };
        }
        
        await db.end();
        res.json({ panels: result });
    } catch (error) {
        console.error('Error fetching panels:', error);
        res.status(500).json({ error: 'Failed to fetch panels' });
    }
});

// Save panels configuration
router.post('/', async (req, res) => {
    try {
        const { panels } = req.body;
        const db = await getConnection();
        
        // Use query instead of execute for transaction commands
        await db.query('START TRANSACTION');
        
        try {
            // Clear existing data
            await db.execute('DELETE FROM widgets');
            await db.execute('DELETE FROM panels');
            
            // Insert panels and widgets
            for (const [panelKey, panelData] of Object.entries(panels)) {
                // Insert panel
                await db.execute(
                    'INSERT INTO panels (panel_key, title) VALUES (?, ?)',
                    [panelKey, panelData.title]
                );
                
                // Insert widgets
                for (let i = 0; i < panelData.widgets.length; i++) {
                    const widget = panelData.widgets[i];
                    await db.execute(
                        `INSERT INTO widgets 
                         (widget_id, panel_key, title, content, color, widget_order, is_large, is_small) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            widget.id,
                            panelKey,
                            widget.title,
                            widget.content || '',
                            widget.color || '#00d563',
                            i,
                            widget.large || false,
                            widget.small || false
                        ]
                    );
                }
            }
            
            await db.query('COMMIT');
            console.log('Panels saved successfully');
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
        
        await db.end();
        
        res.json({ success: true, message: 'Panels saved successfully' });
    } catch (error) {
        console.error('Error saving panels:', error);
        res.status(500).json({ error: 'Failed to save panels' });
    }
});

// Get specific panel
router.get('/:panelKey', async (req, res) => {
    try {
        const { panelKey } = req.params;
        const db = await getConnection();
        
        const [panels] = await db.execute(
            'SELECT * FROM panels WHERE panel_key = ?',
            [panelKey]
        );
        
        if (panels.length === 0) {
            await db.end();
            return res.status(404).json({ error: 'Panel not found' });
        }
        
        const [widgets] = await db.execute(
            'SELECT * FROM widgets WHERE panel_key = ? ORDER BY widget_order',
            [panelKey]
        );
        
        const result = {
            title: panels[0].title,
            widgets: widgets.map(widget => ({
                id: widget.widget_id,
                title: widget.title,
                content: widget.content,
                color: widget.color,
                large: widget.is_large,
                small: widget.is_small
            }))
        };
        
        await db.end();
        res.json(result);
    } catch (error) {
        console.error('Error fetching panel:', error);
        res.status(500).json({ error: 'Failed to fetch panel' });
    }
});

module.exports = router;
