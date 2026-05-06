const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    let url = process.env.DIRECT_URL;
    if (url && !url.includes('connect_timeout')) {
        url += (url.includes('?') ? '&' : '?') + 'connect_timeout=30';
    }
    console.log("Testing URL:", url);

    if (!url) {
        console.log("No DIRECT_URL set");
        return;
    }

    const pool = new Pool({ connectionString: url });

    try {
        const client = await pool.connect();
        console.log("Connected successfully to DIRECT_URL!");
        const res = await client.query('SELECT NOW()');
        console.log("Current time:", res.rows[0]);
        client.release();
    } catch (err) {
        console.error("Connection failed:", err.message);
    }

    pool.end();
}

testConnection();
