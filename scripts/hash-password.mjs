import { randomBytes, scryptSync } from 'node:crypto';
const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your dashboard password"');
  process.exit(1);
}
const salt = randomBytes(16).toString('base64url');
const hash = scryptSync(password, salt, 32).toString('base64url');
console.log(`scrypt:${Buffer.from(salt).toString('base64url')}:${hash}`);
