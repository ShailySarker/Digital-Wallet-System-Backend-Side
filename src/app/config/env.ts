import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
    PORT: string;
    MONGODB_URL: string;
    NODE_ENV: "development" | "production";
    JWT: {
        JWT_ACCESS_SECRET: string;
        JWT_ACCESS_EXPIRES: string;
        JWT_REFRESH_SECRET: string;
        JWT_REFRESH_EXPIRES: string;
    };
    BCRYPT: {
        BCRYPT_SALT_ROUND: string;
    };
    ADMIN: {
        ADMIN_EMAIL: string;
        ADMIN_PASSWORD: string;
    };
    FRONTEND: {
        FRONTEND_URL: string;
    };
    EMAIL_SENDER: {
        SMTP_HOST: string;
        SMTP_PORT: string;
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_FROM: string;
    };


};

const loadEnvVariables = (): EnvConfig => {

    const requiredEnvVariables: string[] = [
        "PORT",
        "MONGODB_URL",
        "NODE_ENV",
        "JWT_ACCESS_SECRET",
        "JWT_ACCESS_EXPIRES",
        "JWT_REFRESH_SECRET",
        "JWT_REFRESH_EXPIRES",
        "BCRYPT_SALT_ROUND",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
        "FRONTEND_URL",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS",
        "SMTP_FROM",
    ];

    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`)
        }
    });


    return {
        PORT: process.env.PORT as string,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        MONGODB_URL: process.env.MONGODB_URL!,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        JWT: {
            JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
            JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
            JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
            JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
        },
        BCRYPT: {
            BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
        },
        ADMIN: {
            ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
        },
        FRONTEND: {
            FRONTEND_URL: process.env.FRONTEND_URL as string,
        },
        EMAIL_SENDER: {
            SMTP_HOST: process.env.SMTP_HOST as string,
            SMTP_PORT: process.env.SMTP_PORT as string,
            SMTP_USER: process.env.SMTP_USER as string,
            SMTP_PASS: process.env.SMTP_PASS as string,
            SMTP_FROM: process.env.SMTP_FROM as string,
        },
    };
};

export const envVars: EnvConfig = loadEnvVariables();