import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure we have a 32-byte key. Fallback for local development.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32)
  : Buffer.from('v3-prisha-solar-key-hardened-32b'); // 32 bytes placeholder

const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
  if (!text) return '';
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift() || '', 'hex');
    const hexText = parts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(hexText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return '[Decryption Error]';
  }
}
