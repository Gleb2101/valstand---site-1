
import mysql from 'mysql2/promise';
import fs from 'fs';

const config = {
    user: 'root_1',
    password: 'BZjAFGph7c',
    database: 'root_1'
};

console.log("=== DIAGNOSTIC TOOL FOR VALSTAND ===");
console.log("Testing Database Connections...");

async function testConnection(name, specificConfig) {
    console.log(`\nTesting strategy: [${name}]`);
    try {
        const conn = await mysql.createConnection({
            ...config,
            ...specificConfig,
            connectTimeout: 5000
        });
        console.log(`✅ SUCCESS! Connected using ${name}`);
        await conn.end();
        return true;
    } catch (err) {
        console.log(`❌ FAILED (${name}). Error: ${err.code} - ${err.message}`);
        return false;
    }
}

(async () => {
    // 1. Test Standard TCP (localhost)
    await testConnection('Localhost (TCP/Standard)', { host: 'localhost', port: 3306 });

    // 2. Test 127.0.0.1 explicitly
    await testConnection('IP 127.0.0.1 (Force TCP)', { host: '127.0.0.1', port: 3306 });

    // 3. Test Common Sockets
    const sockets = [
        '/var/run/mysqld/mysqld.sock',
        '/tmp/mysql.sock',
        '/var/lib/mysql/mysql.sock'
    ];

    let socketFound = false;
    for (const socket of sockets) {
        if (fs.existsSync(socket)) {
            console.log(`\nFound socket file at: ${socket}`);
            await testConnection(`Socket: ${socket}`, { socketPath: socket });
            socketFound = true;
        }
    }
    
    if (!socketFound) {
        console.log("\n⚠️ No common MySQL socket files found in system paths.");
    }

    console.log("\n=== DIAGNOSIS FINISHED ===");
    process.exit(0);
})();
