"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptPrivateKey = encryptPrivateKey;
exports.decryptPrivateKey = decryptPrivateKey;
const crypto_1 = __importDefault(require("crypto"));
// Clé secrète pour le chiffrement (à stocker dans une variable 
// d'environnement !)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? '';
const IV_LENGTH = 16; // Pour AES, IV = 16 octets
/**
 * Chiffre une clé privée avec AES-256-CBC
 */
function encryptPrivateKey(privateKey, userId) {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const key = crypto_1.default
        .createHash('sha256')
        .update(ENCRYPTION_KEY + userId)
        .digest();
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}
/**
 * Déchiffre une clé privée chiffrée
 */
function decryptPrivateKey(encrypted, userId) {
    const [ivHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto_1.default
        .createHash('sha256')
        .update(ENCRYPTION_KEY + userId)
        .digest();
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
