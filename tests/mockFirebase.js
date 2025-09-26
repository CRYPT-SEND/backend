"use strict";
// import { faker } from '@faker-js/faker';
// import { vi } from 'vitest';
// // Base de données en mémoire pour les tests
// const testDB = {
//   users: new Map(),
//   sessions: new Map()
// };
// // Mock de Firebase Admin
// vi.mock('firebase-admin', () => ({
//   default: {
//     apps: [],
//     initializeApp: vi.fn()
//   },
//   auth: () => ({
//     createUser: vi.fn().mockImplementation((userData) => {
//       const uid = faker.string.uuid();
//       const user = { uid, ...userData };
//       testDB.users.set(uid, user);
//       return Promise.resolve(user);
//     }),
//     getUserByEmail: vi.fn().mockImplementation((email) => {
//       const user = Array.from(testDB.users.values())
//         .find(u => u.email === email);
//       if (!user) {
//         const error = new Error('auth/user-not-found');
//         error.code = 'auth/user-not-found';
//         throw error;
//       }
//       return Promise.resolve(user);
//     }),
//     verifyIdToken: vi.fn().mockImplementation((token) => {
//       // Simulation de JWT décodé avec données Faker
//       if (token.startsWith('valid')) {
//         return Promise.resolve({
//           uid: faker.string.uuid(),
//           email: faker.internet.email(),
//           name: faker.person.fullName()
//         });
//       }
//       throw new Error('auth/invalid-token');
//     })
//   }),
//   firestore: () => ({
//     collection: (collName) => ({
//       doc: (docId = faker.string.uuid()) => ({
//         set: vi.fn().mockImplementation((data) => {
//           const key = `${collName}/${docId}`;
//           testDB[collName] = testDB[collName] || new Map();
//           testDB[collName].set(docId, { id: docId, ...data });
//           return Promise.resolve();
//         }),
//         update: vi.fn().mockImplementation((updates) => {
//           testDB[collName] = testDB[collName] || new Map();
//           const doc = testDB[collName].get(docId);
//           testDB[collName].set(docId, { 
//             ...doc, 
//             ...updates, 
//             updatedAt: new Date()
//           });
//           return Promise.resolve();
//         }),
//         get: vi.fn().mockImplementation(() => {
//           testDB[collName] = testDB[collName] || new Map();
//           const doc = testDB[collName].get(docId);
//           return Promise.resolve({
//             exists: !!doc,
//             data: () => doc,
//             id: docId
//           });
//         })
//       }),
//       where: () => ({
//         limit: () => ({
//           get: vi.fn().mockImplementation(() => {
//             testDB[collName] = testDB[collName] || new Map();
//             const docs = Array.from(testDB[collName].values())
//               .map(data => ({
//                 exists: true,
//                 data: () => data,
//                 id: data.id
//               }));
//             return Promise.resolve({
//               empty: docs.length === 0,
//               docs,
//               forEach: (callback) => docs.forEach(callback)
//             });
//           })
//         }),
//         get: vi.fn().mockImplementation(() => {
//           // Même implémentation que ci-dessus
//         })
//       })
//     })
//   })
// }));
