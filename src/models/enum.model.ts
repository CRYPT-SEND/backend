// Modèle générique pour les données d'énumération modifiables par l'admin
export interface EnumValue {
  id: string;
  value: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Exemple de modèle pour chaque type d'énumération
// Utiliser directement EnumValue pour les modèles d'énumération

// Les collections Firestore ou SQL pourraient être :
// currencies, networks, paymentMethods, kycLevels, kycStatuses, userStatuses, orderStatuses, walletTypes, walletStatuses
