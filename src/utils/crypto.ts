import crypto from 'crypto';

// Clé secrète pour le chiffrement (à stocker dans une variable 
// d'environnement !)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? ''; 
const IV_LENGTH = 16; // Pour AES, IV = 16 octets

/**
 * Chiffre une clé privée avec AES-256-CBC
 */
export function encryptPrivateKey(
  privateKey: string, 
  userId: string,
): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto
    .createHash('sha256')
    .update(ENCRYPTION_KEY + userId)
    .digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Déchiffre une clé privée chiffrée
 */
export function decryptPrivateKey(
  encrypted: string, 
  userId: string,
): string {
  const [ivHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto
    .createHash('sha256')
    .update(ENCRYPTION_KEY + userId)
    .digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}