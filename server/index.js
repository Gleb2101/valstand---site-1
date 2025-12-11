
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Настройка путей для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Логирование для отладки путей на сервере
const distPath = path.join(__dirname, '../dist');
console.log('--- Server Startup ---');
console.log(`API running on port: ${PORT}`);
console.log(`Static files path: ${distPath}`);
if (fs.existsSync(distPath)) {
    console.log('SUCCESS: Dist folder found.');
} else {
    console.error('ERROR: Dist folder NOT found! Check your upload structure.');
}

// Database Connection
const pool = mysql.createPool({
    host: 'localhost', 
    user: 'p592462_valstand', // Проверьте пользователя в ISPmanager -> Базы данных
    password: 'lA5gJ2dX1j',    // Проверьте пароль
    database: 'p592462_valstand', // Проверьте имя БД
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- API Routes ---

app.get('/api', (req, res) => {
    res.send('API Backend is running correctly!');
});

app.get('/setup', async (req, res) => {
    try {
        const queries = [
            `CREATE TABLE IF NOT EXISTS leads (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                service VARCHAR(255),
                status VARCHAR(50) DEFAULT 'new',
                date DATETIME
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                data LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS categories (
                name VARCHAR(100) PRIMARY KEY
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS testimonials (
                id VARCHAR(50) PRIMARY KEY, 
                data LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS team (
                id VARCHAR(50) PRIMARY KEY, 
                data LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS popups (
                id VARCHAR(50) PRIMARY KEY, 
                data LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS cases (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255),
                data LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS blog_posts (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255),
                category VARCHAR(100),
                data LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS services (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255),
                data LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            `CREATE TABLE IF NOT EXISTS images (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255),
                data LONGTEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
        ];

        for (const query of queries) {
            await pool.query(query);
        }

        res.send(`<h1>База данных успешно настроена!</h1><a href="/">Вернуться на сайт</a>`);
    } catch (error) {
        console.error("Setup Error:", error);
        res.status(500).send(`<h1>Ошибка настройки БД</h1><pre>${error.message}</pre>`);
    }
});

const createCrudHandlers = (table, isJsonData = true) => {
    app.get(`/api/${table}`, async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${table}`);
            if (isJsonData) {
                const items = rows.map(r => {
                    try { return JSON.parse(r.data); } catch (e) { return { id: r.id, error: 'Corrupt Data' }; }
                });
                res.json(items);
            } else {
                res.json(rows);
            }
        } catch (error) {
            console.error(`GET ${table} Error:`, error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post(`/api/${table}`, async (req, res) => {
        try {
            const item = req.body;
            const id = item.id;
            if (!id) return res.status(400).json({ error: 'ID required' });

            const dataStr = JSON.stringify(item);
            
            if (table === 'blog_posts') {
                 await pool.query(
                    `INSERT INTO ${table} (id, title, category, data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), data=VALUES(data)`, 
                    [id, item.title, item.category, dataStr]
                 );
            } else if (table === 'cases' || table === 'services') {
                 await pool.query(
                    `INSERT INTO ${table} (id, title, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), data=VALUES(data)`, 
                    [id, item.title, dataStr]
                 );
            } else if (table === 'images') {
                 await pool.query(
                    `INSERT INTO ${table} (id, name, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), data=VALUES(data)`, 
                    [id, item.name, item.data]
                 );
            } else {
                 await pool.query(
                    `INSERT INTO ${table} (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data=VALUES(data)`, 
                    [id, dataStr]
                 );
            }
            res.json({ success: true });
        } catch (error) {
            console.error(`POST ${table} Error:`, error);
            res.status(500).json({ error: error.message });
        }
    });

    app.delete(`/api/${table}/:id`, async (req, res) => {
        try {
            await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
            res.json({ success: true });
        } catch (error) {
            console.error(`DELETE ${table} Error:`, error);
            res.status(500).json({ error: error.message });
        }
    });
};

// Routes Implementation
app.get('/api/leads', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leads ORDER BY date DESC');
        res.json(rows);
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/leads', async (req, res) => {
    try {
        const { id, name, phone, service, status, date } = req.body;
        const validDate = date ? date : new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.query(
            'INSERT INTO leads (id, name, phone, service, status, date) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status)',
            [id, name, phone, service, status, validDate]
        );
        res.json({ success: true });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
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

createCrudHandlers('cases');
createCrudHandlers('testimonials');
createCrudHandlers('team');
createCrudHandlers('popups');
createCrudHandlers('images');
createCrudHandlers('blog_posts');
createCrudHandlers('services');

app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(r => {
             if (r.setting_key === 'global') {
                 try { Object.assign(settings, JSON.parse(r.data)); } catch (e) {}
             }
        });
        res.json(settings);
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/settings', async (req, res) => {
    try {
        const dataStr = JSON.stringify(req.body);
        await pool.query(
            "INSERT INTO settings (setting_key, data) VALUES ('global', ?) ON DUPLICATE KEY UPDATE data=VALUES(data)", 
            [dataStr]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

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

// --- Static Files (Frontend) ---
app.use(express.static(distPath));

// Любой другой запрос отправляем на index.html (для React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
