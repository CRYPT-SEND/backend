// jest.setup.ts

// IMPORTANT : Définir les variables d'environnement AVANT tout import
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.HOST = 'localhost';
process.env.JET_LOGGER_MODE = 'CONSOLE';
process.env.JET_LOGGER_FILEPATH = 'jet-logger.log';
process.env.JET_LOGGER_TIMESTAMP = 'TRUE';
process.env.JET_LOGGER_FORMAT = 'LINE';
import dotenv from 'dotenv';

// charge le .env (ou .env.test si tu préfères)
dotenv.config({ path: ".env.test" });
console.log(">>> JEST ENV:", process.env.PORT, process.env.NODE_ENV);
// console.log(">>> JEST ENV raw:", JSON.stringify(process.env, null, 2));
