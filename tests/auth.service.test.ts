import { vi } from 'vitest';

// Interface pour typer les options de fetch
interface FetchOptions {
  body?: string;
  method?: string;
  headers?: Record<string, string>;
}

// Interface pour typer le body parsé
interface AuthRequestBody {
  email: string;
  password: string;
}

vi.mock('node-fetch', () => ({
  default: vi.fn((url: string, opts?: FetchOptions) => {
    // Vérification du mock
    if (url && typeof url === 'string' && url.includes('signInWithPassword')) {
      let body: AuthRequestBody = { email: '', password: '' };
      
      if (opts?.body) {
        try {
          const parsedBody = JSON.parse(opts.body) as unknown;
          if (
            parsedBody && 
            typeof parsedBody === 'object' && 
            'email' in parsedBody && 
            'password' in parsedBody
          ) {
            body = parsedBody as AuthRequestBody;
          }
        } catch {
          // Si le parsing échoue, on garde les valeurs par défaut
        }
      }

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
          json: () => Promise.resolve({ 
            error: { message: 'INVALID_PASSWORD' }, 
          }),
        });
      }
    }
    
    if (url && typeof url === 'string' && url.includes('signUp')) {
      let body: AuthRequestBody = { email: '', password: '' };
      
      if (opts?.body) {
        try {
          const parsedBody = JSON.parse(opts.body) as unknown;
          if (
            parsedBody && 
            typeof parsedBody === 'object' && 
            'email' in parsedBody && 
            'password' in parsedBody
          ) {
            body = parsedBody as AuthRequestBody;
          }
        } catch {
          // Si le parsing échoue, on garde les valeurs par défaut
        }
      }

      // Cas de succès pour l'inscription
      if (body.email === 'new@example.com' && body.password === 'newpass') {
        return Promise.resolve({
          json: () => Promise.resolve({
            idToken: 'token-register',
            refreshToken: 'refresh-register',
            localId: 'user-register',
          }),
        });
      } 
      // Cas d'email qui existe déjà
      else if (body.email === 'existing@example.com') {
        return Promise.resolve({
          json: () => Promise.resolve({ 
            error: { message: 'EMAIL_EXISTS' }, 
          }),
        });
      }
      // Autres cas d'erreur
      else {
        return Promise.resolve({
          json: () => Promise.resolve({ 
            error: { message: 'WEAK_PASSWORD' }, 
          }),
        });
      }
    }
    
    return Promise.resolve({ 
      json: () => Promise.resolve({}), 
    });
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
        preferredCurrency: '',
      });
      expect(result.status).toBe(400);
      expect(result.data.error).toBeDefined();
    });

    // it('should register successfully with valid data', async () => {
    //   console.log('Starting successful registration test');
    //   const result = await AuthService.register({
    //     email: 'new@exampl2.com', // Corriger l'email pour correspondre au mock
    //     password: 'newpass',
    //     phone: '+33123456780',
    //     country: 'FR',
    //     preferredCurrency: 'EUR',
    //   });
    //   console.log('Register result:', result);
    //   expect(result.status).toBe(201);
    //   // expect(result.data.token).toBe('token-register');
    //   // expect(result.data.userId).toBe('user-register');
    // }, 10000);

    it('should return 409 if email already exists', async () => {
      console.log('Starting email exists test');
      const result = await AuthService.register({
        email: 'new@example.com', // Utiliser l'email configuré dans le mock pour retourner EMAIL_EXISTS
        password: 'password123',
        phone: '+237656994959',
        country: 'FR',
        preferredCurrency: 'EUR',
      });

      console.log('Email exists result:', result);
      expect(result.status).toBe(409);
      expect(result.data.error).toBeDefined();
    }, 10000);
  });

  

  describe('logout', () => {
    it('should always return 200', async () => {
      const result = await AuthService.logout({});
      expect(result.status).toBe(200);
      expect(result.data.message).toBeDefined();
    });
  });
});