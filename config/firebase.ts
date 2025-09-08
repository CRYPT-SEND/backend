import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Vérifier si le fichier de service account existe
const serviceAccountPath = path.resolve(__dirname, './cryptsend-d9089-5cb1e401ce02.json');
console.log('📂 Chemin du fichier service account:', serviceAccountPath);
console.log('📄 Le fichier existe:', fs.existsSync(serviceAccountPath));

// Charger le fichier JSON et vérifier sa structure
let serviceAccount;
try {
  serviceAccount = require('./cryptsend-d9089-5cb1e401ce02.json');
  console.log('🔑 Service account chargé, contient project_id:', !!serviceAccount.project_id);
  console.log('🔑 Service account chargé, contient client_email:', !!serviceAccount.client_email);
  console.log('🔑 Service account chargé, contient private_key:', !!serviceAccount.private_key);
} catch (error) {
  console.error('❌ Erreur lors du chargement du service account:', error);
}

// Initialiser Firebase avec promesse
export const firebaseInitPromise = (async () => {
  try {
    console.log('🔄 Tentative d\'initialisation Firebase...');
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase initialisé avec succès');
      
      // Vérifier si admin.auth() fonctionne
      try {
        await admin.auth().listUsers(1);
        console.log('✅ Connexion à Firebase Auth vérifiée avec succès');
      } catch (authError) {
        console.error('❌ Erreur de connexion à Firebase Auth:', authError);
      }
    } else {
      console.log('✅ Firebase déjà initialisé');
    }
    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
    console.error('❌ Détails:', error.message);
    console.error('❌ Code:', error.code);
    return false;
  }
})();

// Exporter à la fois admin et la promesse
module.exports = { admin, firebaseInitPromise };