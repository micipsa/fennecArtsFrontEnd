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
import toast from "react-hot-toast";
import { createElement } from "react";

// Création de l'instance Axios avec la baseURL lue depuis le fichier .env.
// En développement : http://localhost:5000 (typiquement).
// En production   : l'URL du backend déployé.
let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
if (apiUrl.includes("localhost") && window.location.hostname !== "localhost") {
  apiUrl = apiUrl.replace("localhost", window.location.hostname);
}

const api = axios.create({
  baseURL: apiUrl,
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

/**
 * Intercepteur de réponse (response interceptor).
 * Déclenche des notifications visuelles (Toasts) si le serveur renvoie
 * des gains d'XP, des badges ou des montées de niveau.
 */
api.interceptors.response.use((response) => {
  const data = response.data;

// Notification Gain d'XP
  if (data.pointsGagnes) {
    toast.success(
      createElement(
        "div",
        { 
          onClick: () => { window.location.href = "/profil"; },
          style: { cursor: "pointer", display: "flex", flexDirection: "column" }
        },
        createElement("strong", null, `+${data.pointsGagnes} XP : ${data.raison || "Activité"}`),
        createElement("small", { style: { textDecoration: "underline", opacity: 0.8, marginTop: "4px" } }, "Cliquez pour voir vos récompenses")
      ),
      {
        icon: "✨",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
        duration: 5000
      }
    );
  }

  // Notification Nouveau Badge
  if (data.nouveauBadge) {
    toast.success(`Nouveau Badge débloqué : ${data.nouveauBadge.nom} !`, {
      icon: "🏆",
      duration: 5000,
      style: {
        border: "1px solid #ffd700",
        padding: "16px",
        color: "#ffd700",
        background: "#1a1a1a",
      },
    });
  }

  // Notification Niveau Supérieur
  if (data.niveauGagne) {
    toast.success(`Félicitations ! Vous êtes passé au rang ${data.niveauGagne} !`, {
      icon: "🚀",
      duration: 6000,
    });
  }

  return response;
}, (error) => {
  return Promise.reject(error);
});

export default api;
