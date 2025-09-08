import { vi } from 'vitest';
vi.mock('node-fetch', () => ({
  default: vi.fn((url, opts) => {
    // Vérification du mock
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
    return Promise.resolve({ json: () => Promise.resolve({}) });
  }),
}));

import * as AuthService from '../src/services/auth/auth.service';
describe('node-fetch mock', () => {
  it('should call the fetch mock', async () => {
    const fetch = (await import('node-fetch')).default;
    await fetch('test-url');
    expect(fetch).toHaveBeenCalled();
  });
});

describe('AuthService', () => {
  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      const result = await AuthService.register({
        email: '',
        password: '',
        phone: '',
        country: '',
        preferredCurrency: ''
      });
      expect(result.status).toBe(400);
      expect(result.data.error).toBeDefined();
    });

    it('should register successfully with valid data', async () => {
      const result = await AuthService.register({
        email: 'new@examplee.com',
        password: 'newpass',
        phone: '+33123456789',
        country: 'FR',
        preferredCurrency: "EUR"
      });
      expect(result.status).toBe(200);
      // expect(result.data.token).toBe('token-register');
      expect(result.data.userId).toBe('user-register');
    }, 10000);

    it('should return 409 if email already exists', async () => {
      const result = await AuthService.register({
        email: 'existing@exampleee.com',
        password: 'pass',
        phone: '+33123456789',
        country: 'FR',
        preferredCurrency: "EUR"
      });
      expect(result.status).toBe(409);
      expect(result.data.error).toBeDefined();
    }, 10000);
  });

  // describe('login', () => {
  //   it('should return 400 if email or password is missing', async () => {
  //     const result = await AuthService.login({ email: '', password: '' });
  //     expect(result.status).toBe(400);
  //     expect(result.data.error).toBeDefined();
  //   });

    // it('should login successfully with valid credentials', async () => {
    //   const result = await AuthService.login({ email: 'valid@example.com', password: 'validpass' });
    //   expect(result.status).toBe(200);
    //   expect(result.data.token).toBe('token-login');
    //   expect(result.data.userId).toBe('user-login');
    // }, 10000);

  //   it('should return 401 if credentials are invalid', async () => {
  //     const result = await AuthService.login({ email: 'wrong@example.com', password: 'wrongpass' });
  //     expect(result.status).toBe(401);
  //     expect(result.data.error).toBeDefined();
  //   });
  // });

  describe('logout', () => {
    it('should always return 200', async () => {
      const result = await AuthService.logout({});
      expect(result.status).toBe(200);
      expect(result.data.message).toBeDefined();
    });
  });
});
