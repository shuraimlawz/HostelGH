const { Pool } = require('pg');

async function check() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.acqsozadtwlwbnqrtroe:Allahcom10HostelGH@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=disable",
  });

  try {
    const res = await pool.query('SELECT id, email, role FROM "User" WHERE email = $1', ['admin@hostelgh.com']);
    console.log('Query result:', res.rows);
  } catch (err) {
    console.error('Query error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
