import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; 

app.enable('trust proxy');
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

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

    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
        await initTables(connection);
        connection.release();
    } catch (err) {
        console.error('❌ DATABASE CONNECTION FAILED', err.message);
        pool = null; 
    }
};

const initTables = async (connection) => {
    try {
        await connection.query(`CREATE TABLE IF NOT EXISTS leads (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), phone VARCHAR(255), service VARCHAR(255), status VARCHAR(50), date DATETIME)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS cases (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), data LONGTEXT)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS services (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), data LONGTEXT)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS packages (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), data LONGTEXT)`);
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

// --- HELPER FOR EMAIL ---
const sendEmailNotification = async (lead) => {
    if (!pool) return;
    try {
        const [rows] = await pool.query("SELECT data FROM settings WHERE setting_key = 'global'");
        if (rows.length === 0) return;
        const settings = JSON.parse(rows[0].data);
        const mailConfig = settings.mailConfig;
        if (!mailConfig || !mailConfig.enabled) return;

        const transporter = nodemailer.createTransport({
            host: mailConfig.host,
            port: parseInt(mailConfig.port) || 465,
            secure: parseInt(mailConfig.port) === 465,
            auth: { user: mailConfig.user, pass: mailConfig.pass },
        });

        await transporter.sendMail({
            from: `"Valstand Bot" <${mailConfig.user}>`,
            to: mailConfig.receiverEmail,
            subject: `🔥 Новая заявка: ${lead.name}`,
            html: `<h2>Новая заявка на сайте Valstand</h2><p><strong>Имя:</strong> ${lead.name}</p><p><strong>Телефон:</strong> ${lead.phone}</p><p><strong>Услуга:</strong> ${lead.service}</p><p><strong>Дата:</strong> ${lead.date}</p><br /><a href="https://valstand.ru/admin">Перейти в админку</a>`,
        });
    } catch (error) { console.error("Error sending email:", error); }
};

// --- API ROUTES ---
const dbCheck = (req, res, next) => {
    if (!pool) {
        if (req.method === 'GET') return res.json([]);
        return res.status(503).json({ error: "Database unavailable", success: false });
    }
    next();
};

app.get('/api/status', (req, res) => res.json({ status: 'ok', db: pool ? 'connected' : 'disconnected' }));

app.get('/robots.txt', async (req, res) => {
    const defaultRobots = "User-agent: *\nAllow: /";
    try {
        if (!pool) return res.type('text/plain').send(defaultRobots);
        const [rows] = await pool.query('SELECT data FROM settings WHERE setting_key = "robots_txt"');
        res.type('text/plain').send(rows.length > 0 ? rows[0].data : defaultRobots);
    } catch (e) { res.type('text/plain').send(defaultRobots); }
});

app.get('/sitemap.xml', async (req, res) => {
    const defaultSitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
    try {
        if (!pool) return res.type('application/xml').send(defaultSitemap);
        const [rows] = await pool.query('SELECT data FROM settings WHERE setting_key = "sitemap_xml"');
        res.type('application/xml').send(rows.length > 0 ? rows[0].data : defaultSitemap);
    } catch (e) { res.type('application/xml').send(defaultSitemap); }
});

app.get('/api/seo-files', dbCheck, async (req, res) => {
    const [rows] = await pool.query('SELECT setting_key, data FROM settings WHERE setting_key IN ("robots_txt", "sitemap_xml")');
    const result = { robots_txt: '', sitemap_xml: '' };
    rows.forEach(r => { result[r.setting_key] = r.data; });
    res.json(result);
});

app.post('/api/seo-files', dbCheck, async (req, res) => {
    const { robots_txt, sitemap_xml } = req.body;
    if (robots_txt !== undefined) await pool.query('INSERT INTO settings (setting_key, data) VALUES ("robots_txt", ?) ON DUPLICATE KEY UPDATE data=VALUES(data)', [robots_txt]);
    if (sitemap_xml !== undefined) await pool.query('INSERT INTO settings (setting_key, data) VALUES ("sitemap_xml", ?) ON DUPLICATE KEY UPDATE data=VALUES(data)', [sitemap_xml]);
    res.json({ success: true });
});

// Generic CRUD
const createCrudHandlers = (table) => {
    app.get(`/api/${table}`, dbCheck, async (req, res) => {
        const [rows] = await pool.query(`SELECT * FROM ${table}`);
        if (table === 'images') return res.json(rows.map(r => ({ id: r.id, name: r.name, data: r.data })));
        res.json(rows.map(r => JSON.parse(r.data)));
    });
    app.post(`/api/${table}`, dbCheck, async (req, res) => {
        const item = req.body;
        const dataStr = JSON.stringify(item);
        if (table === 'blog_posts') await pool.query(`INSERT INTO ${table} (id, title, category, data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), data=VALUES(data)`, [item.id, item.title, item.category, dataStr]);
        else if (['cases', 'services', 'packages'].includes(table)) await pool.query(`INSERT INTO ${table} (id, title, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), data=VALUES(data)`, [item.id, item.title, dataStr]);
        else if (table === 'images') await pool.query(`INSERT INTO ${table} (id, name, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), data=VALUES(data)`, [item.id, item.name, item.data]);
        else await pool.query(`INSERT INTO ${table} (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data=VALUES(data)`, [item.id, dataStr]);
        res.json({ success: true });
    });
    app.delete(`/api/${table}/:id`, dbCheck, async (req, res) => {
        await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    });
};

createCrudHandlers('cases');
createCrudHandlers('testimonials');
createCrudHandlers('team');
createCrudHandlers('popups');
createCrudHandlers('images');
createCrudHandlers('blog_posts');
createCrudHandlers('services'); 
createCrudHandlers('packages'); 

app.get('/api/leads', dbCheck, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM leads ORDER BY date DESC');
    res.json(rows);
});
app.post('/api/leads', dbCheck, async (req, res) => {
    const { id, name, phone, service, status, date } = req.body;
    const validDate = date ? date : new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.query('INSERT INTO leads (id, name, phone, service, status, date) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status)', [id, name, phone, service, status, validDate]);
    sendEmailNotification({ name, phone, service, date: validDate });
    res.json({ success: true });
});
app.put('/api/leads/:id', dbCheck, async (req, res) => {
    await pool.query('UPDATE leads SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ success: true });
});
app.delete('/api/leads/:id', dbCheck, async (req, res) => {
    await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

app.get('/api/settings', dbCheck, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM settings WHERE setting_key = "global"');
    res.json(rows.length > 0 ? JSON.parse(rows[0].data) : {});
});
app.post('/api/settings', dbCheck, async (req, res) => {
    await pool.query("INSERT INTO settings (setting_key, data) VALUES ('global', ?) ON DUPLICATE KEY UPDATE data=VALUES(data)", [JSON.stringify(req.body)]);
    res.json({ success: true });
});

app.get('/api/categories', dbCheck, async (req, res) => {
    const [rows] = await pool.query('SELECT name FROM categories');
    res.json(rows.map(r => r.name));
});
app.post('/api/categories', dbCheck, async (req, res) => {
    await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [req.body.name]);
    res.json({ success: true });
});
app.delete('/api/categories/:name', dbCheck, async (req, res) => {
    await pool.query('DELETE FROM categories WHERE name = ?', [req.params.name]);
    res.json({ success: true });
});

// --- STATIC FILES & SEO INJECTION ---
app.use(express.static(distPath, { index: false }));

app.get('*', async (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) return res.status(500).send('Build not found.');

    let html = fs.readFileSync(indexPath, 'utf8');

    // Default SEO values
    let seo = {
        title: 'Valstand | Маркетинговое Агентство',
        description: 'Комплексное маркетинговое агентство: Таргет, SEO, Контент-стратегии.',
        keywords: 'маркетинг, агентство, продвижение',
        ogImage: '/logo.png'
    };

    try {
        if (pool) {
            const [rows] = await pool.query('SELECT data FROM settings WHERE setting_key = "global"');
            if (rows.length > 0) {
                const settings = JSON.parse(rows[0].data);
                const urlPath = req.path;
                
                // Determine Page Key
                let pageKey = 'home';
                if (urlPath === '/') pageKey = 'home';
                else if (urlPath.startsWith('/services/')) pageKey = `service:${urlPath.split('/')[2]}`;
                else if (urlPath.startsWith('/packages/')) pageKey = `package:${urlPath.split('/')[2]}`;
                else if (urlPath.startsWith('/cases/')) pageKey = `case:${urlPath.split('/')[2]}`;
                else if (urlPath.startsWith('/blog/')) pageKey = `blog:${urlPath.split('/')[2]}`;
                else pageKey = urlPath.substring(1);

                const pageSeo = settings.seo?.[pageKey];
                if (pageSeo) {
                    if (pageSeo.title) seo.title = pageSeo.title;
                    if (pageSeo.description) seo.description = pageSeo.description;
                    if (pageSeo.keywords) seo.keywords = pageSeo.keywords;
                    if (pageSeo.ogImage) seo.ogImage = pageSeo.ogImage;
                }
            }
        }
    } catch (e) { console.error("SEO Injection Error:", e); }

    // Inject into HTML
    html = html.replace(/<title>.*?<\/title>/, `<title>${seo.title}</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${seo.description}" />`);
    html = html.replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${seo.keywords}" />`);
    
    // Open Graph
    html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${seo.title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${seo.description}" />`);
    html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${seo.ogImage}" />`);
    
    // Twitter
    html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${seo.title}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${seo.description}" />`);
    html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${seo.ogImage}" />`);

    res.send(html);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));