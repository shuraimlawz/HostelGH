const { Client } = require('pg');
require('dotenv').config();

async function test() {
  const client = new Client({
    connectionString: "postgresql://postgres.acqsozadtwlwbnqrtroe:Allahcom10HostelGH@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require",
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

test();
