import { localStg } from '@/utils/storage';
import { decryptToken, encryptToken } from '@sa/utils';

/** Get token (decrypted) */
export async function getToken() {
  const encrypted = localStg.get('token') || '';
  if (!encrypted) return '';
  const decrypted = await decryptToken(encrypted);
  return decrypted || '';
}

/** Store encrypted token */
export async function setToken(token: string) {
  const encrypted = await encryptToken(token);
  localStg.set('token', encrypted);
}

/** Clear auth storage */
export function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('refreshToken'); // cleanup legacy key
}
