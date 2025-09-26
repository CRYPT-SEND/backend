"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.firebaseInitPromise = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Vérifier si le fichier de service account existe
const serviceAccountPath = path_1.default.resolve(__dirname, './cryptsend-d9089-5cb1e401ce02.json');
// Fonction pour logger de manière contrôlée (évite les warnings no-console)
const log = {
    info: (message, ...args) => {
        // eslint-disable-next-line no-console
        console.log(message, ...args);
    },
    error: (message, ...args) => {
        // eslint-disable-next-line no-console
        console.error(message, ...args);
    },
};
log.info('📂 Chemin du fichier service account:', serviceAccountPath);
log.info('📄 Le fichier existe:', fs_1.default.existsSync(serviceAccountPath));
// Charger le fichier JSON et vérifier sa structure
let serviceAccount = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rawServiceAccount = require('./cryptsend-d9089-5cb1e401ce02.json');
    // Validation du type
    if (rawServiceAccount &&
        typeof rawServiceAccount === 'object' &&
        'project_id' in rawServiceAccount &&
        'client_email' in rawServiceAccount &&
        'private_key' in rawServiceAccount) {
        serviceAccount = rawServiceAccount;
        log.info('🔑 Service account chargé, contient project_id:', !!serviceAccount.project_id);
        log.info('🔑 Service account chargé, contient client_email:', !!serviceAccount.client_email);
        log.info('🔑 Service account chargé, contient private_key:', !!serviceAccount.private_key);
    }
    else {
        throw new Error('Structure du service account invalide');
    }
}
catch (error) {
    log.error('❌ Erreur lors du chargement du service account:', error);
}
// Initialiser Firebase avec promesse
exports.firebaseInitPromise = (async () => {
    try {
        log.info('🔄 Tentative d\'initialisation Firebase...');
        if (!serviceAccount) {
            throw new Error('Service account non disponible');
        }
        if (firebase_admin_1.default.apps.length === 0) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
            });
            log.info('✅ Firebase initialisé avec succès');
            // Vérifier si admin.auth() fonctionne
            try {
                await firebase_admin_1.default.auth().listUsers(1);
                log.info('✅ Connexion à Firebase Auth vérifiée avec succès');
            }
            catch (authError) {
                const errorMessage = authError instanceof Error
                    ? authError.message
                    : 'Erreur inconnue';
                log.error('❌ Erreur de connexion à Firebase Auth:', errorMessage);
            }
        }
        else {
            log.info('✅ Firebase déjà initialisé');
        }
        return true;
    }
    catch (error) {
        const errorMessage = error instanceof Error
            ? error.message
            : 'Erreur inconnue';
        const errorCode = error instanceof Error && 'code' in error
            ? error.code
            : 'CODE_INCONNU';
        log.error('❌ Erreur initialisation Firebase:', error);
        log.error('❌ Détails:', errorMessage);
        log.error('❌ Code:', errorCode);
        return false;
    }
})();
exports.default = { admin: firebase_admin_1.default, firebaseInitPromise: exports.firebaseInitPromise };
