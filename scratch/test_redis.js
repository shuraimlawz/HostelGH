const Redis = require('ioredis');
require('dotenv').config();

async function testRedis() {
  const url = process.env.REDIS_URL;
  console.log("Connecting to:", url);
  const redis = new Redis(url);
  
  redis.on('error', (err) => console.error("Redis Error:", err.message));
  
  try {
    await redis.set('test_key', 'Upstash Connection Successful!');
    const val = await redis.get('test_key');
    console.log("Redis Response:", val);
    redis.disconnect();
  } catch (e) {
    console.error("Failed:", e);
  }
}

testRedis();
