/**
 * AuthProvider — fournit l'état d'authentification à toute l'application.
 *
 * Ce composant est un Provider React Context. Il enveloppe l'application
 * dans <AuthContext.Provider> et expose les valeurs suivantes :
 *
 * - utilisateur : objet de l'utilisateur connecté (ou null si déconnecté).
 * - chargement  : booléen indiquant si la vérification initiale du token est en cours.
 * - connecter() : fonction pour connecter un utilisateur (sauvegarde le token
 *                 dans le localStorage et met à jour le state).
 * - deconnecter() : fonction pour déconnecter (supprime le token et remet
 *                   l'utilisateur à null).
 *
 * Flux d'initialisation :
 * 1. Au montage du composant (useEffect), on vérifie si un token existe
 *    dans le localStorage.
 * 2. Si oui, on appelle l'endpoint GET /api/auth/me pour récupérer les
 *    données de l'utilisateur correspondant au token.
 * 3. Si le token est invalide ou expiré, on le supprime du localStorage.
 * 4. Le state `chargement` passe à false une fois la vérification terminée.
 * 5. Si un streakReward est retourné (première visite du jour), le popup s'affiche.
 */
import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../services/api";
import StreakPopup from "../components/UI/StreakPopup";

function AuthProvider({ children }) {
  // State de l'utilisateur connecté (null = déconnecté)
  const [utilisateur, setUtilisateur] = useState(null);

  // State de chargement initial : true seulement si un token existe
  // (pour éviter un flash de contenu non authentifié)
  const [chargement, setChargement] = useState(
    () => !!localStorage.getItem("token"),
  );

  // State pour le popup de streak quotidien
  const [streakReward, setStreakReward] = useState(null);

  // ── Vérification du token au montage de l'application ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Appel API pour récupérer le profil lié au token stocké
      api
        .get("/api/auth/me")
        .then((res) => {
          setUtilisateur(res.data.user);
          // Si le backend retourne une récompense streak, l'afficher
          if (res.data.streakReward) {
            setStreakReward(res.data.streakReward);
          }
        })
        .catch(() => localStorage.removeItem("token")) // Token invalide → nettoyage
        .finally(() => setChargement(false));
    }
  }, []); // [] = exécuté une seule fois au montage

  /**
   * Fonction de connexion.
   * Appelée après un login ou un register réussi.
   * @param {string} token - Le JWT renvoyé par le backend.
   * @param {object} donneesUtilisateur - L'objet utilisateur renvoyé par le backend.
   */
  const connecter = (token, donneesUtilisateur) => {
    console.log("connecter appelé avec :", donneesUtilisateur);
    localStorage.setItem("token", token); // Persistance du token
    setUtilisateur(donneesUtilisateur);    // Mise à jour du state React
  };

  /**
   * Fonction de déconnexion.
   * Supprime le token du localStorage et remet l'utilisateur à null.
   */
  const deconnecter = () => {
    localStorage.removeItem("token");
    setUtilisateur(null);
  };

  // Objet de valeur fourni à tous les composants enfants via le Context
  const valeur = {
    utilisateur,
    setUtilisateur,
    chargement,
    connecter,
    deconnecter,
  };

  return (
    <AuthContext.Provider value={valeur}>
      {children}
      {/* Popup Streak — s'affiche une seule fois par jour au premier chargement */}
      {streakReward && (
        <StreakPopup
          streakData={streakReward}
          onClose={() => setStreakReward(null)}
        />
      )}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

