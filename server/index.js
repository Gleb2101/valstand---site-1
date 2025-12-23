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
        console.log('✅ DATABASE CONNECTED');
        await initTables(connection);
        connection.release();
    } catch (err) {
        console.error('❌ DATABASE FAILED', err.message);
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
    } catch (e) { console.error("Table init error:", e.message); }
};

connectDB();

// API handlers (generic crud)
const dbCheck = (req, res, next) => {
    if (!pool) {
        if (req.method === 'GET') return res.json([]);
        return res.status(503).json({ error: "Database unavailable" });
    }
    next();
};

const createCrudHandlers = (table) => {
    app.get(`/api/${table}`, dbCheck, async (req, res) => {
        const [rows] = await pool.query(`SELECT * FROM ${table}`);
        if (table === 'images') return res.json(rows.map(r => ({ id: r.id, name: r.name, data: r.data })));
        res.json(rows.map(r => {
            try { return JSON.parse(r.data); } catch(e) { return {}; }
        }));
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

app.get('/api/settings', dbCheck, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM settings WHERE setting_key = "global"');
    res.json(rows.length > 0 ? JSON.parse(rows[0].data) : {});
});
app.post('/api/settings', dbCheck, async (req, res) => {
    await pool.query("INSERT INTO settings (setting_key, data) VALUES ('global', ?) ON DUPLICATE KEY UPDATE data=VALUES(data)", [JSON.stringify(req.body)]);
    res.json({ success: true });
});

// --- STATIC FILES & PURE SERVER-SIDE SEO ---
app.use(express.static(distPath, { index: false }));

app.get('*', async (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) return res.status(500).send('Build not found.');

    let html = fs.readFileSync(indexPath, 'utf8');
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const siteUrl = `${protocol}://${host}`;
    const fullUrl = `${siteUrl}${req.originalUrl}`;

    // Default SEO values
    let seo = {
        title: 'Valstand | Маркетинговое Агентство',
        description: 'Комплексное маркетинговое агентство Valstand: Таргет, SEO, Контент-стратегии. Современные решения для бизнеса.',
        keywords: 'маркетинг, агентство, продвижение',
        ogImage: `${siteUrl}/logo.png`
    };

    try {
        if (pool) {
            const [settingsRows] = await pool.query('SELECT data FROM settings WHERE setting_key = "global"');
            const settings = settingsRows.length > 0 ? JSON.parse(settingsRows[0].data) : {};
            
            const rawPath = req.path.replace(/\/$/, ""); 
            const urlPath = rawPath === "" ? "/" : rawPath;
            
            let pageKey = urlPath === "/" ? "home" : urlPath.substring(1);
            let dynamicId = '';
            let table = '';

            if (urlPath.startsWith('/services/')) { dynamicId = urlPath.split('/')[2]; pageKey = `service:${dynamicId}`; table = 'services'; }
            else if (urlPath.startsWith('/packages/')) { dynamicId = urlPath.split('/')[2]; pageKey = `package:${dynamicId}`; table = 'packages'; }
            else if (urlPath.startsWith('/cases/')) { dynamicId = urlPath.split('/')[2]; pageKey = `case:${dynamicId}`; table = 'cases'; }
            else if (urlPath.startsWith('/blog/')) { dynamicId = urlPath.split('/')[2]; pageKey = `blog:${dynamicId}`; table = 'blog_posts'; }

            // 1. Try manual SEO from Admin Panel
            const manualSeo = settings.seo?.[pageKey];
            if (manualSeo) {
                if (manualSeo.title) seo.title = manualSeo.title;
                if (manualSeo.description) seo.description = manualSeo.description;
                if (manualSeo.keywords) seo.keywords = manualSeo.keywords;
                if (manualSeo.ogImage) {
                    // Force Absolute URL for images (Messengers requirement)
                    seo.ogImage = manualSeo.ogImage.startsWith('http') ? manualSeo.ogImage : `${siteUrl}${manualSeo.ogImage.startsWith('/') ? '' : '/'}${manualSeo.ogImage}`;
                }
            } 
            
            // 2. Fallback to dynamic content if no manual SEO
            if ((!manualSeo || !manualSeo.title) && table && dynamicId) {
                const [itemRows] = await pool.query(`SELECT data FROM ${table} WHERE id = ?`, [dynamicId]);
                if (itemRows.length > 0) {
                    const itemData = JSON.parse(itemRows[0].data);
                    seo.title = (itemData.title || itemData.name) + ' | Valstand';
                    seo.description = itemData.excerpt || itemData.description || seo.description;
                    if (itemData.image) {
                        seo.ogImage = itemData.image.startsWith('http') ? itemData.image : `${siteUrl}${itemData.image.startsWith('/') ? '' : '/'}${itemData.image}`;
                    }
                }
            }
        }
    } catch (e) { console.error("SEO Error:", e); }

    // --- REPLACEMENT ENGINE ---
    // Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${seo.title}</title>`);
    
    // Function for clean meta replacement
    const injectMeta = (htmlContent, attrName, attrVal, content) => {
        const regex = new RegExp(`<meta\\s+[^>]*?${attrName}=["']${attrVal}["'][^>]*?>`, "i");
        const newTag = `<meta ${attrName}="${attrVal}" content="${content}">`;
        if (regex.test(htmlContent)) {
            return htmlContent.replace(regex, newTag);
        } else {
            return htmlContent.replace(/<\/head>/i, `${newTag}\n</head>`);
        }
    };

    html = injectMeta(html, 'name', 'description', seo.description);
    html = injectMeta(html, 'name', 'keywords', seo.keywords);
    
    // Open Graph (Absolute priority for messengers)
    html = injectMeta(html, 'property', 'og:title', seo.title);
    html = injectMeta(html, 'property', 'og:description', seo.description);
    html = injectMeta(html, 'property', 'og:image', seo.ogImage);
    html = injectMeta(html, 'property', 'og:url', fullUrl);
    
    // Twitter
    html = injectMeta(html, 'name', 'twitter:title', seo.title);
    html = injectMeta(html, 'name', 'twitter:description', seo.description);
    html = injectMeta(html, 'name', 'twitter:image', seo.ogImage);

    res.send(html);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));