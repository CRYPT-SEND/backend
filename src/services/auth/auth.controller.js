"use strict";
// controllers/auth.controller.ts (Version mise à jour)
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPhone = exports.verifyEmail = exports.registerGoogle = exports.registerEmail = void 0;
exports.getRegistrationStatus = getRegistrationStatus;
exports.register = register;
exports.logout = logout;
exports.twofaVerify = twofaVerify;
exports.twofaSetup = twofaSetup;
exports.kycProfile = kycProfile;
exports.kycDocuments = kycDocuments;
exports.authenticateFirebaseToken = authenticateFirebaseToken;
exports.getProfile = getProfile;
const AuthService = __importStar(require("./auth.service"));
const registration_service_1 = __importDefault(require("./registration.service"));
const admin = __importStar(require("firebase-admin"));
// Rate limiting map (en production, utiliser Redis)
const rateLimitMap = new Map();
// Middleware de rate limiting simple
function rateLimit(maxRequests, windowMs) {
    return (req, res, next) => {
        const key = req.ip ?? 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        let record = rateLimitMap.get(key);
        if (!record || record.resetTime < windowStart) {
            record = { count: 1, resetTime: now + windowMs };
        }
        else {
            record.count++;
        }
        rateLimitMap.set(key, record);
        if (record.count > maxRequests) {
            return res.status(429).json({
                success: false,
                error: { code: 'RATE_LIMIT', message: 'Trop de requêtes.' },
            });
        }
        next();
    };
}
// Middleware de validation des inputs
function validateInput(requiredFields) {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_FIELDS',
                    message: `Champs manquants: ${missingFields.join(', ')}`,
                },
            });
        }
        next();
    };
}
// ==================== ENDPOINTS D'INSCRIPTION MULTI-ÉTAPES ====================
// ÉTAPE 1A: Inscription par email
exports.registerEmail = [
    rateLimit(5, 60000), // 5 requêtes par minute
    validateInput(['email']),
    async (req, res) => {
        try {
            const body = req.body;
            const request = {
                email: body.email.trim().toLowerCase(),
            };
            const result = await registration_service_1.default.registerWithEmail(request);
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur dans registerEmail:', error);
            return res.status(500).json({
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            });
        }
    },
];
// ÉTAPE 1B: Inscription via Google
exports.registerGoogle = [
    rateLimit(5, 60000),
    validateInput(['googleToken']),
    async (req, res) => {
        try {
            const body = req.body;
            const request = {
                googleToken: body.googleToken,
            };
            const result = await registration_service_1.default.registerWithGoogle(request);
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur dans registerGoogle:', error);
            return res.status(500).json({
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            });
        }
    },
];
// ÉTAPE 2: Vérification du code email
exports.verifyEmail = [
    rateLimit(10, 60000), // 10 tentatives par minute
    validateInput(['sessionId', 'code']),
    async (req, res) => {
        try {
            const body = req.body;
            const request = {
                sessionId: body.sessionId,
                code: body.code.replace(/\s/g, ''),
            };
            const result = await registration_service_1.default.verifyEmail(request);
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur dans verifyEmail:', error);
            return res.status(500).json({
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            });
        }
    },
];
// ÉTAPE 3: Ajout du numéro de téléphone
exports.addPhone = [
    rateLimit(5, 60000),
    validateInput(['sessionId', 'phone', 'country']),
    async (req, res) => {
        try {
            const body = req.body;
            const request = {
                sessionId: body.sessionId,
                phone: body.phone.trim(),
                country: body.country.trim().toUpperCase(),
                preferredCurrency: body.preferredCurrency ?
                    body.preferredCurrency.trim().toUpperCase() :
                    undefined,
            };
            const result = await registration_service_1.default.addPhone(request);
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur dans addPhone:', error);
            return res.status(500).json({
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            });
        }
    },
];
// ÉTAPE 4: Vérification finale du téléphone
// export const verifyPhone = [
//   rateLimit(10, 60000),
//   validateInput(['sessionId', 'code']),
//   async (req: Request, res: Response) => {
//     try {
//       const body = req.body as Record<string, unknown>;
//       const request: VerifyPhoneRequest = {
//         sessionId: body.sessionId as string,
//         code: (body.code as string).replace(/\s/g, ''),
//       };
//       const result = await RegistrationService.verifyPhone(request);
//       const statusCode = result.success ? 200 : 400;
//       return res.status(statusCode).json(result);
//     } catch (error) {
//       // eslint-disable-next-line no-console
//       console.error('Erreur dans verifyPhone:', error);
//       return res.status(500).json({
//         success: false,
//         error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
//       });
//     }
//   },
// ];
// Récupération du statut d'inscription
async function getRegistrationStatus(req, res) {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_SESSION_ID',
                    message: 'ID de session manquant.',
                },
            });
        }
        const result = await registration_service_1.default.getRegistrationStatus(sessionId);
        const statusCode = result.success ? 200 : 400;
        return res.status(statusCode).json(result);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erreur dans getRegistrationStatus:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
        });
    }
}
// ==================== ANCIENS ENDPOINTS (CONSERVÉS) ====================
// Ancien endpoint d'inscription (déprécié mais conservé)
async function register(req, res) {
    try {
        const { email, password, phone, country, preferredCurrency, } = req.body;
        const result = await AuthService.register({
            email,
            password,
            phone,
            country,
            preferredCurrency,
        });
        return res.status(result.status).json(result.data);
    }
    catch (error) {
        const errMsg = (error instanceof Error && error.message)
            ?? 'Erreur serveur.';
        return res.status(500).json({ error: errMsg });
    }
}
async function logout(req, res) {
    try {
        const result = await AuthService.logout(req.body);
        return res.status(result.status).json(result.data);
    }
    catch (error) {
        const errMsg = (error instanceof Error && error.message)
            ?? 'Erreur serveur.';
        return res.status(500).json({ error: errMsg });
    }
}
// Méthodes non implémentées (2FA, KYC)
function twofaVerify(req, res) {
    return res.status(501).json({ error: '2FA Verify non implémenté.' });
}
function twofaSetup(req, res) {
    return res.status(501).json({ error: '2FA Setup non implémenté.' });
}
function kycProfile(req, res) {
    return res.status(501).json({ error: 'KYC Profile non implémenté.' });
}
function kycDocuments(req, res) {
    return res.status(501).json({ error: 'KYC Documents non implémenté.' });
}
// Middleware pour valider le token Firebase envoyé par le frontend
async function authenticateFirebaseToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token manquant.' });
    }
    const idToken = authHeader.split(' ')[1];
    if (!idToken) {
        return res.status(401).json({ error: 'Token invalide.' });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user =
            decodedToken;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Token non valide.' });
    }
}
// Exemple de route protégée
async function getProfile(req, res) {
    await Promise.resolve(); // Pour satisfaire require-await
    const user = req.user;
    return res.status(200).json({
        message: 'Accès autorisé',
        user,
    });
}
