import { randomBytes } from 'crypto';

export function createId(size = 10): string {
  return randomBytes(size).toString('base64url').slice(0, size);
}

export function createRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}
