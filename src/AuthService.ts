// backendAuthService.ts
import bcrypt from 'bcryptjs';

const SERVER_SALT_ROUNDS = 12;

export async function hashPasswordServer(frontPassword: string): Promise<string> {
  return bcrypt.hash(frontPassword, SERVER_SALT_ROUNDS);
}

export async function verifyPasswordServer(
  frontPassword: string,
  storedHash: string
): Promise<boolean> {
  const ok = bcrypt.compare(frontPassword, storedHash);
    if (!ok) {
        throw new Error('Password verification failed');
    }
  return true;
}