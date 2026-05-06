const { Client } = require('pg');

async function test() {
    const url = "postgresql://postgres.acqsozadtwlwbnqrtroe:Allah.com10@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require";
    const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
    try {
        await client.connect();
        console.log("SUCCESS with Allah.com10");
        await client.end();
    } catch (err) {
        console.log("FAILED with Allah.com10:", err.message);
    }
}

test();
