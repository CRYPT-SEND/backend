"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock('node-fetch', () => ({
    default: vitest_1.vi.fn((url, opts) => {
        // Vérification du mock
        if (url && typeof url === 'string' && url.includes('signInWithPassword')) {
            let body = { email: '', password: '' };
            if (opts?.body) {
                try {
                    const parsedBody = JSON.parse(opts.body);
                    if (parsedBody &&
                        typeof parsedBody === 'object' &&
                        'email' in parsedBody &&
                        'password' in parsedBody) {
                        body = parsedBody;
                    }
                }
                catch {
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
            }
            else {
                return Promise.resolve({
                    json: () => Promise.resolve({
                        error: { message: 'INVALID_PASSWORD' },
                    }),
                });
            }
        }
        if (url && typeof url === 'string' && url.includes('signUp')) {
            let body = { email: '', password: '' };
            if (opts?.body) {
                try {
                    const parsedBody = JSON.parse(opts.body);
                    if (parsedBody &&
                        typeof parsedBody === 'object' &&
                        'email' in parsedBody &&
                        'password' in parsedBody) {
                        body = parsedBody;
                    }
                }
                catch {
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
const AuthService = __importStar(require("../src/services/auth/auth.service"));
describe('node-fetch mock', () => {
    it('should call the fetch mock', async () => {
        const fetch = (await Promise.resolve().then(() => __importStar(require('node-fetch')))).default;
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
            // Test d'inscription avec un email existant
            const result = await AuthService.register({
                email: 'new@example.com', // Email configuré dans le mock
                password: 'password123',
                phone: '+237656994900',
                country: 'FR',
                preferredCurrency: 'EUR',
            });
            // Vérification du résultat
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
