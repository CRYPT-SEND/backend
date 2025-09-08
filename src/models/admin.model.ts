/**
 * Interface représentant un administrateur dans l'application
 */
export interface Admin {
  id?: string;
  email: string;
  nom: string;
  prenom: string;
  password?: string; // Optionnel car ne devrait pas être stocké en clair
  tel: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date | null;
  isActive?: boolean;
}

/**
 * Interface représentant un document Firestore d'administrateur
 */
export interface AdminDocument extends Admin {
  id: string; // Id est requis pour un document
}

// Interface pour typer les documents Firestore
interface FirestoreDocument {
  id: string;
  data: () => Record<string, unknown> | undefined;
}

/**
 * Crée un nouvel objet Admin à partir des données fournies
 * @param data Les données de l'administrateur
 * @returns Un objet Admin
 */
export function createAdmin(data: Partial<Admin>): Admin {
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
export function fromFirestore(doc: FirestoreDocument): Admin | null {
  const data = doc.data();
  if (!data) return null;
  
  return {
    id: doc.id,
    ...data as unknown as Admin,
  };
}

/**
 * Convertit un objet Admin en format compatible Firestore
 * @param admin Objet Admin
 * @returns Données à stocker dans Firestore
 */
export function toFirestore(admin: Admin): Record<string, unknown> {
  const { id: _id, password: _password, ...data } = admin;
  return {
    ...data,
    updatedAt: new Date(),
  };
}

