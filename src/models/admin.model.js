"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = createAdmin;
exports.fromFirestore = fromFirestore;
exports.toFirestore = toFirestore;
/**
 * Crée un nouvel objet Admin à partir des données fournies
 * @param data Les données de l'administrateur
 * @returns Un objet Admin
 */
function createAdmin(data) {
    const now = new Date();
    return {
        email: data.email ?? '',
        nom: data.nom ?? '',
        prenom: data.prenom ?? '',
        tel: data.tel ?? '',
        role: data.role ?? 'ADMIN',
        isActive: data.isActive ?? true,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
        lastLoginAt: data.lastLoginAt ?? null,
    };
}
/**
 * Convertit un document Firestore en objet Admin
 * @param doc Document Firestore
 * @returns Un objet Admin
 */
function fromFirestore(doc) {
    const data = doc.data();
    if (!data)
        return null;
    return {
        id: doc.id,
        ...data,
    };
}
/**
 * Convertit un objet Admin en format compatible Firestore
 * @param admin Objet Admin
 * @returns Données à stocker dans Firestore
 */
function toFirestore(admin) {
    const { id: _id, password: _password, ...data } = admin;
    return {
        ...data,
        updatedAt: new Date(),
    };
}
