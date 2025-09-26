"use strict";
// import admin from 'firebase-admin';
// import { Admin, createAdmin, toFirestore } from '../src/models/admin.model';
// import { firebaseInitPromise } from '../config/firebase';
// /**
//  * Initialise la collection des administrateurs avec un compte de test
//  */
// async function initAdminCollection() {
//   try {
//     console.log('Initialisation de la collection admin...');
//     // S'assurer que Firebase est initialisé
//     await firebaseInitPromise;
//     const db = admin.firestore();
//     const auth = admin.auth();
//     // Données de l'admin test avec lastLoginAt explicitement défini
//     const testAdminData: Admin = createAdmin({
//       email: 'maxime@gmail.com',
//       nom: 'maxime',
//       prenom: 'maxime',
//       tel: '+237666666666',
//       role: 'SUPER_ADMIN',
//       isActive: true,
//       lastLoginAt: new Date(), // Met la date actuelle
//     });
//     // Vérifier si l'admin existe déjà dans Firestore
//     const adminSnapshot = await db.collection('admins')
//       .where('email', '==', testAdminData.email)
//       .limit(1)
//       .get();
//     if (!adminSnapshot.empty) {
//       console.log(
//         `L'administrateur ${testAdminData.email} existe déjà dans Firestore.`
//       );
//     } else {
//       // Créer l'utilisateur dans Firebase Auth
//       try {
//         const userRecord = await auth.createUser({
//           email: testAdminData.email,
//           password: 'azerty7895',  // Mot de passe temporaire
//           displayName: `${testAdminData.prenom} ${testAdminData.nom}`,
//           phoneNumber: testAdminData.tel,
//         });
//         console.log(
//           `Utilisateur créé dans Firebase Auth avec UID: ${userRecord.uid}`
//         );
//         // Ajouter des custom claims pour identifier l'admin
//         await auth.setCustomUserClaims(userRecord.uid, { 
//           role: 'SUPER_ADMIN' 
//         });
//         // Convertir tous les undefined en null pour Firestore
//         const firestoreData = toFirestore(testAdminData);
//         const adminDoc = {
//           ...Object.fromEntries(
//             Object.entries(firestoreData).map(([key, value]) => [
//               key, 
//               value === undefined ? null : value
//             ]),
//           ),
//           id: userRecord.uid,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         };
//         // Sauvegarder dans Firestore
//         await db.collection('admins').doc(userRecord.uid).set(adminDoc);
//         console.log(
//           `Admin créé avec succès dans Firestore avec ID: ${userRecord.uid}`
//         );
//       } catch (authError) {
//         // Si l'utilisateur existe déjà dans Auth mais pas dans Firestore
//         if (authError.code === 'auth/email-already-exists') {
//           console.log(`L'email ${testAdminData.email} existe déjà dans Auth.`);
//           // Récupérer l'utilisateur par email
//           const userRecord = await auth.getUserByEmail(testAdminData.email);
//           // Définir les custom claims
//           await auth.setCustomUserClaims(userRecord.uid, { 
//             role: 'SUPER_ADMIN' 
//           });
//           // Convertir tous les undefined en null pour Firestore
//           const firestoreData = toFirestore(testAdminData);
//           const adminDoc = {
//             ...Object.fromEntries(
//               Object.entries(firestoreData).map(([key, value]) => [
//                 key, 
//                 value === undefined ? null : value
//               ]),
//             ),
//             id: userRecord.uid,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//           };
//           // Créer le document Firestore
//           await db.collection('admins').doc(userRecord.uid).set(adminDoc);
//           console.log(`Admin ajouté à Firestore avec ID: ${userRecord.uid}`);
//         } else {
//           throw authError;
//         }
//       }
//     }
//     console.log('Initialisation de la collection admin terminée.');
//   } catch (error) {
//     console.error(
//       'Erreur lors de l\'initialisation de la collection admin:', 
//       error
//     );
//     process.exit(1);
//   }
// }
// // Exécuter la fonction
// initAdminCollection()
//   .then(() => {
//     console.log('Script terminé avec succès.');
//     process.exit(0);
//   })
//   .catch(error => {
//     console.error('Erreur non gérée:', error);
//     process.exit(1);
//   });
