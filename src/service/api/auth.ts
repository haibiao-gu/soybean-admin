import { request } from '../request';

/** SHA-256 hex digest */
async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Fetch user salt by username (public endpoint) */
export async function fetchSalt(userName: string) {
  return request<string>({
    url: '/auth/salt',
    params: { userName }
  });
}

/**
 * Login — two-step: get salt → SHA-256(password + salt) → send
 *
 * @param userName User name (phone)
 * @param password Plaintext password
 */
export async function fetchLogin(userName: string, password: string) {
  const { data: salt } = await fetchSalt(userName);
  const passwordHash = await sha256(password + salt);

  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password: passwordHash
    }
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/auth/getUserInfo' });
}

/**
 * Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * Change password — get salt → SHA-256(old+salt) & SHA-256(new+salt) → send
 */
export async function fetchChangePassword(oldPassword: string, newPassword: string, userName: string) {
  const { data: salt } = await fetchSalt(userName);

  const [oldPasswordHash, newPasswordHash] = await Promise.all([
    sha256(oldPassword + salt),
    sha256(newPassword + salt)
  ]);

  return request({ url: '/auth/changePassword', data: { oldPassword: oldPasswordHash, newPassword: newPasswordHash } });
}
