
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for images

// Database Connection
const pool = mysql.createPool({
    host: '185.12.92.46',
    user: 'p592462_valstand',
    password: 'lA5gJ2dX1j',
    database: 'p592462_valstand',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper for generic CRUD
const createCrudHandlers = (table, isJsonData = true) => {
    // GET ALL
    app.get(`/api/${table}`, async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${table}`);
            if (isJsonData) {
                // Parse JSON data column back to object
                const items = rows.map(r => {
                    const parsed = JSON.parse(r.data);
                    // Ensure ID from DB matches object ID if needed, 
                    // generally we trust the JSON blob but DB ID is source of truth
                    return parsed;
                });
                res.json(items);
            } else {
                res.json(rows);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    });

    // SAVE (Upsert)
    app.post(`/api/${table}`, async (req, res) => {
        try {
            const item = req.body;
            const id = item.id;
            
            if (!id) return res.status(400).json({ error: 'ID required' });

            const dataStr = JSON.stringify(item);
            
            // Check existence
            const [exists] = await pool.query(`SELECT id FROM ${table} WHERE id = ?`, [id]);
            
            if (exists.length > 0) {
                await pool.query(`UPDATE ${table} SET data = ? WHERE id = ?`, [dataStr, id]);
            } else {
                // For tables with extra columns, we might need specific logic, 
                // but here we use a generic approach assuming schema supports it or we only map known cols
                // Simplified for the "data" blob approach:
                if (table === 'blog_posts') {
                     await pool.query(`INSERT INTO ${table} (id, title, category, data) VALUES (?, ?, ?, ?)`, [id, item.title, item.category, dataStr]);
                } else if (table === 'cases') {
                     await pool.query(`INSERT INTO ${table} (id, title, data) VALUES (?, ?, ?)`, [id, item.title, dataStr]);
                } else if (table === 'images') {
                     await pool.query(`INSERT INTO ${table} (id, name, data) VALUES (?, ?, ?)`, [id, item.name, item.data]);
                } else {
                     await pool.query(`INSERT INTO ${table} (id, data) VALUES (?, ?)`, [id, dataStr]);
                }
            }
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    });

    // DELETE
    app.delete(`/api/${table}/:id`, async (req, res) => {
        try {
            await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    });
};

// --- Routes ---

// 1. Leads (Structured Table)
app.get('/api/leads', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leads ORDER BY date DESC');
        res.json(rows);
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/leads', async (req, res) => {
    try {
        const { id, name, phone, service, status, date } = req.body;
        await pool.query(
            'INSERT INTO leads (id, name, phone, service, status, date) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, phone, service, status, date]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

app.put('/api/leads/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE leads SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

app.delete('/api/leads/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// 2. JSON Blob Tables
createCrudHandlers('cases');
createCrudHandlers('testimonials');
createCrudHandlers('team');
createCrudHandlers('popups');
createCrudHandlers('images'); // Note: Images in MySQL blob/text might be slow, but fits requirement
createCrudHandlers('blog_posts');

// 3. Settings (Single Row usually, or Key-Value)
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(r => {
             // If we stored the whole settings object in one key
             if (r.setting_key === 'global') {
                 Object.assign(settings, JSON.parse(r.data));
             }
        });
        res.json(settings);
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/settings', async (req, res) => {
    try {
        const dataStr = JSON.stringify(req.body);
        const [exists] = await pool.query("SELECT setting_key FROM settings WHERE setting_key = 'global'");
        if (exists.length > 0) {
            await pool.query("UPDATE settings SET data = ? WHERE setting_key = 'global'", [dataStr]);
        } else {
            await pool.query("INSERT INTO settings (setting_key, data) VALUES ('global', ?)", [dataStr]);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// 4. Categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT name FROM categories');
        res.json(rows.map(r => r.name));
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/categories', async (req, res) => {
    try {
        await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [req.body.name]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

app.delete('/api/categories/:name', async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE name = ?', [req.params.name]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
