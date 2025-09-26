import admin, { ServiceAccount } from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Interface pour typer le service account
interface ServiceAccountJson {
  project_id: string;
  client_email: string;
  private_key: string;
  [key: string]: unknown;
}

// Vérifier si le fichier de service account existe
const serviceAccountPath = path.resolve(
  __dirname, 
  './cryptsend-d9089-5cb1e401ce02.json',
);

// Fonction pour logger de manière contrôlée (évite les warnings no-console)
const log = {
  info: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(message, ...args);
  },
};

log.info('📂 Chemin du fichier service account:', serviceAccountPath);
log.info('📄 Le fichier existe:', fs.existsSync(serviceAccountPath));

// Charger le fichier JSON et vérifier sa structure
let serviceAccount: ServiceAccountJson | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rawServiceAccount = require('./cryptsend-d9089-5cb1e401ce02.json') as unknown;
  
  // Validation du type
  if (
    rawServiceAccount && 
    typeof rawServiceAccount === 'object' &&
    'project_id' in rawServiceAccount &&
    'client_email' in rawServiceAccount &&
    'private_key' in rawServiceAccount
  ) {
    serviceAccount = rawServiceAccount as ServiceAccountJson;
    log.info(
      '🔑 Service account chargé, contient project_id:', 
      !!serviceAccount.project_id,
    );
    log.info(
      '🔑 Service account chargé, contient client_email:', 
      !!serviceAccount.client_email,
    );
    log.info(
      '🔑 Service account chargé, contient private_key:', 
      !!serviceAccount.private_key,
    );
  } else {
    throw new Error('Structure du service account invalide');
  }
} catch (error) {
  log.error('❌ Erreur lors du chargement du service account:', error);
}

// Initialiser Firebase avec promesse
export const firebaseInitPromise = (async (): Promise<boolean> => {
  try {
    log.info('🔄 Tentative d\'initialisation Firebase...');
    
    if (!serviceAccount) {
      throw new Error('Service account non disponible');
    }
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
      });
      log.info('✅ Firebase initialisé avec succès');
      
      // Vérifier si admin.auth() fonctionne
      try {
        await admin.auth().listUsers(1);
        log.info('✅ Connexion à Firebase Auth vérifiée avec succès');
      } catch (authError) {
        const errorMessage = authError instanceof Error 
          ? authError.message 
          : 'Erreur inconnue';
        log.error('❌ Erreur de connexion à Firebase Auth:', errorMessage);
      }
    } else {
      log.info('✅ Firebase déjà initialisé');
    }
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur inconnue';
    const errorCode = error instanceof Error && 'code' in error 
      ? (error as { code: string }).code 
      : 'CODE_INCONNU';
    
    log.error('❌ Erreur initialisation Firebase:', error);
    log.error('❌ Détails:', errorMessage);
    log.error('❌ Code:', errorCode);
    return false;
  }
})();

// Export ES6 au lieu de module.exports
export { admin };
export default { admin, firebaseInitPromise };

