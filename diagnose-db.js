const { Client } = require('pg');
require('dotenv').config();

async function diagnose() {
    const urls = {
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECT_URL: process.env.DIRECT_URL
    };

    for (const [name, url] of Object.entries(urls)) {
        console.log(`\nTesting ${name}...`);
        if (!url) {
            console.log(`${name} is not set.`);
            continue;
        }

        const client = new Client({
            connectionString: url,
            connectionTimeoutMillis: 5000,
        });

        try {
            await client.connect();
            console.log(`Successfully connected to ${name}!`);
            const res = await client.query('SELECT version()');
            console.log(`Version: ${res.rows[0].version}`);
            await client.end();
        } catch (err) {
            console.error(`Failed to connect to ${name}:`);
            console.error(`  Code: ${err.code}`);
            console.error(`  Message: ${err.message}`);
            console.error(`  Detail: ${err.detail}`);
        }
    }
}

diagnose();
