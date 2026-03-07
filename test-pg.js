const { Pool } = require('pg');

async function testConnection() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.log("No DATABASE_URL set");
        return;
    }

    const pool = new Pool({ connectionString: url });

    try {
        const client = await pool.connect();
        console.log("Connected successfully without explicit SSL flag!");
        const res = await client.query('SELECT NOW()');
        console.log(res.rows[0]);
        client.release();
    } catch (err) {
        console.error("Connection failed:", err.message);
    }

    pool.end();
}

testConnection();
