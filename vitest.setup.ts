import { vi } from 'vitest';

vi.mock('node-fetch', () => ({
  default: vi.fn((url, opts) => {
    // Mock pour login
    if (url && typeof url === 'string' && url.includes('signInWithPassword')) {
      const body = opts && opts.body ? JSON.parse(opts.body) : {};
      if (body.email === 'valid@example.com' && body.password === 'validpass') {
        return Promise.resolve({
          json: () => Promise.resolve({
            idToken: 'token-login',
            refreshToken: 'refresh-login',
            localId: 'user-login',
          }),
        });
      } else {
        return Promise.resolve({
          json: () => Promise.resolve({ error: { message: 'INVALID_PASSWORD' } }),
        });
      }
    }
    // Mock pour register
    if (url && typeof url === 'string' && url.includes('signUp')) {
      const body = opts && opts.body ? JSON.parse(opts.body) : {};
      if (body.email === 'new@example.com' && body.password === 'newpass') {
        return Promise.resolve({
          json: () => Promise.resolve({
            idToken: 'token-register',
            refreshToken: 'refresh-register',
            localId: 'user-register',
          }),
        });
      } else {
        return Promise.resolve({
          json: () => Promise.resolve({ error: { message: 'EMAIL_EXISTS' } }),
        });
      }
    }
    // Default
    return Promise.resolve({ json: () => Promise.resolve({}) });
  }),
}));
