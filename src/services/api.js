/**
 * Service API — instance Axios centralisée.
 *
 * Toutes les requêtes HTTP de l'application passent par cette instance.
 * Cela permet :
 * - De définir une baseURL unique (variable d'environnement VITE_API_URL).
 * - D'attacher automatiquement le token JWT à chaque requête via un interceptor.
 *
 * ⚠️  Ne jamais utiliser `axios` directement dans l'application,
 *     toujours passer par `api` (cette instance).
 */
import axios from "axios";

// Création de l'instance Axios avec la baseURL lue depuis le fichier .env.
// En développement : http://localhost:5000 (typiquement).
// En production   : l'URL du backend déployé.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/**
 * Intercepteur de requête (request interceptor).
 *
 * Cette fonction s'exécute AVANT chaque appel API.
 * Elle vérifie dans le localStorage si un token JWT existe,
 * et si oui, l'ajoute automatiquement dans le header `Authorization`
 * au format `Bearer <token>`.
 *
 * Cela évite de passer manuellement le token dans chaque appel.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
