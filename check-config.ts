import config from './prisma.config';
console.log('Loaded Config:', JSON.stringify(config, (key, value) => {
    if (key === 'url' || key === 'directUrl') return '[REDACTED]';
    return value;
}, 2));
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('DIRECT_URL present:', !!process.env.DIRECT_URL);
