
import * as Joi from 'joi';

export const envSchema = Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().min(16).required(),
    JWT_REFRESH_SECRET: Joi.string().min(16).required(),
    PAYSTACK_SECRET_KEY: Joi.string().required(),
    PORT: Joi.number().default(3000),
});

export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
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
});

