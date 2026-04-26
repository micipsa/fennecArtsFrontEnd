/**
 * Création du Context d'authentification.
 *
 * React Context permet de partager des données (ici l'état d'authentification)
 * à travers tout l'arbre de composants, sans avoir à passer les props
 * manuellement à chaque niveau (prop drilling).
 *
 * Ce fichier crée uniquement le Context (le "conteneur").
 * Les valeurs sont fournies par le Provider (voir AuthProvider.jsx).
 * Les composants consomment ces valeurs via le hook useAuth (voir useAuth.js).
 */
import { createContext } from "react";

// Création du Context avec une valeur par défaut undefined.
const AuthContext = createContext();

export default AuthContext;
