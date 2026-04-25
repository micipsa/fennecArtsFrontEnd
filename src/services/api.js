import axios from "axios";

// On crée une instance Axios avec une configuration de base.
// Toute l'application utilisera cette instance, jamais axios directement.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Intercepteur de requête.
// Cette fonction s'exécute AVANT chaque appel API.
// Elle regarde dans localStorage si un token JWT existe,
// et si oui, l'ajoute automatiquement dans le header Authorization.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
