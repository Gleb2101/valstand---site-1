
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; 

app.enable('trust proxy');
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Logging
app.use((req, res, next) => {
    if (!req.url.match(/\.(js|css|png|jpg|ico|svg|woff2)$/)) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    }
    next();
});

const distPath = path.join(__dirname, '../dist');

// --- DATABASE CONNECTION ---
let pool = null;

const connectDB = async () => {
    const dbConfig = {
        host: '127.0.0.1',      
        user: 'root_1',         
        password: 'BZjAFGph7c', 
        database: 'root_1',     
        port: 3306,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 10000 
    };

    console.log(`[DB] Attempting connection to ${dbConfig.host} as user '${dbConfig.user}'...`);

    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
        
        await initTables(connection);
        
        connection.release();
    } catch (err) {
        console.error('❌ DATABASE CONNECTION FAILED');
        console.error(`Error Code: ${err.code}`);
        console.error(`Error Message: ${err.message}`);
        pool = null; 
    }
};

const initTables = async (connection) => {
    try {
        await connection.query(`CREATE TABLE IF NOT EXISTS leads (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), phone VARCHAR(255), service VARCHAR(255), status VARCHAR(50), date DATETIME)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS cases (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), data LONGTEXT)`);
        // Services table for storing service data
        await connection.query(`CREATE TABLE IF NOT EXISTS services (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), data LONGTEXT)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS blog_posts (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), category VARCHAR(255), data LONGTEXT)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS images (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), data LONGTEXT)`);
        const simpleTables = ['team', 'testimonials', 'popups'];
        for (const t of simpleTables) {
            await connection.query(`CREATE TABLE IF NOT EXISTS ${t} (id VARCHAR(255) PRIMARY KEY, data LONGTEXT)`);
        }
        await connection.query(`CREATE TABLE IF NOT EXISTS settings (setting_key VARCHAR(255) PRIMARY KEY, data LONGTEXT)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS categories (name VARCHAR(255) PRIMARY KEY)`);
    } catch (e) {
        console.error("Table init error:", e.message);
    }
};

connectDB();

// --- API ROUTES ---

const dbCheck = (req, res, next) => {
    if (!pool) {
        if (req.method === 'GET') return res.json([]);
        return res.status(503).json({ error: "Database unavailable (Static Mode)", success: false });
    }
    next();
};

app.get('/api/status', async (req, res) => {
    if(pool) res.json({ status: 'ok', db: 'connected' });
    else res.json({ status: 'ok', db: 'disconnected' });
});

// Custom Route for Favicon from absolute path
app.get('/favicon_val.svg', (req, res) => {
    // Exact path requested by user
    const iconPath = '/var/www/www-root/data/www/valstand.ru/favicon_val.svg';
    
    try {
        if (fs.existsSync(iconPath)) {
            res.sendFile(iconPath);
        } else {
            console.warn(`Favicon not found at ${iconPath}, checking local...`);
            // Fallback to local project file if absolute path doesn't exist (dev environment)
            const localPath = path.join(__dirname, '../public/favicon_val.svg'); // Assuming it might be in public
            // Or serve a default 404
            res.status(404).send('Favicon not found');
        }
    } catch (e) {
        console.error("Error serving favicon:", e);
        res.status(500).send("Error");
    }
});

// Generic CRUD
const createCrudHandlers = (table) => {
    app.get(`/api/${table}`, dbCheck, async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${table}`);
            const items = rows.map(r => { try { return JSON.parse(r.data); } catch (e) { return { id: r.id }; } });
            res.json(items);
        } catch (error) { res.status(500).json({ error: error.message }); }
    });

    app.post(`/api/${table}`, dbCheck, async (req, res) => {
        try {
            const item = req.body;
            const dataStr = JSON.stringify(item);
            
            // Handle specific columns for search/indexing optimizations if needed
            if (table === 'blog_posts') {
                 await pool.query(`INSERT INTO ${table} (id, title, category, data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), data=VALUES(data)`, [item.id, item.title, item.category, dataStr]);
            } else if (table === 'cases' || table === 'services') {
                 await pool.query(`INSERT INTO ${table} (id, title, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), data=VALUES(data)`, [item.id, item.title, dataStr]);
            } else if (table === 'images') {
                 await pool.query(`INSERT INTO ${table} (id, name, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), data=VALUES(data)`, [item.id, item.name, item.data]);
            } else {
                 await pool.query(`INSERT INTO ${table} (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data=VALUES(data)`, [item.id, dataStr]);
            }
            res.json({ success: true });
        } catch (error) { res.status(500).json({ error: error.message }); }
    });

    app.delete(`/api/${table}/:id`, dbCheck, async (req, res) => {
        try {
            await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
            res.json({ success: true });
        } catch (error) { res.status(500).json({ error: error.message }); }
    });
};

// Leads specific
app.get('/api/leads', dbCheck, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leads ORDER BY date DESC');
        res.json(rows);
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/leads', dbCheck, async (req, res) => {
    try {
        const { id, name, phone, service, status, date } = req.body;
        const validDate = date ? date : new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.query('INSERT INTO leads (id, name, phone, service, status, date) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status)', [id, name, phone, service, status, validDate]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/leads/:id', dbCheck, async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE leads SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

app.delete('/api/leads/:id', dbCheck, async (req, res) => {
    try {
        await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// Settings specific
app.get('/api/settings', dbCheck, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(r => { if (r.setting_key === 'global') try { Object.assign(settings, JSON.parse(r.data)); } catch (e) {} });
        res.json(settings);
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/settings', dbCheck, async (req, res) => {
    try {
        const dataStr = JSON.stringify(req.body);
        await pool.query("INSERT INTO settings (setting_key, data) VALUES ('global', ?) ON DUPLICATE KEY UPDATE data=VALUES(data)", [dataStr]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// Categories specific
app.get('/api/categories', dbCheck, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT name FROM categories');
        res.json(rows.map(r => r.name));
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/categories', dbCheck, async (req, res) => {
    try {
        await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [req.body.name]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

app.delete('/api/categories/:name', dbCheck, async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE name = ?', [req.params.name]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

createCrudHandlers('cases');
createCrudHandlers('testimonials');
createCrudHandlers('team');
createCrudHandlers('popups');
createCrudHandlers('images');
createCrudHandlers('blog_posts');
createCrudHandlers('services'); // Register services handler

// --- STATIC FILES ---
app.use(express.static(distPath, {
  maxAge: '1d', 
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Error: Build not found.');
  }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
