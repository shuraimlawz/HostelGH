
import * as Joi from 'joi';

export const envSchema = Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().min(16).required(),
    JWT_REFRESH_SECRET: Joi.string().min(16).required(),
    PAYSTACK_SECRET_KEY: Joi.string().required(),
    PORT: Joi.number().default(3001),
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    GOOGLE_CALLBACK_URL: Joi.string().optional(),
    FRONTEND_URL: Joi.string().default('http://localhost:3000'),
});

export default () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
    },
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET_KEY,
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    app: {
        frontendUrl: process.env.FRONTEND_URL,
    },
});

