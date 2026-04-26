/**
 * RouteProtegee — composant guard pour les routes nécessitant une authentification.
 *
 * Ce composant vérifie si l'utilisateur est connecté avant de rendre
 * les composants enfants (children). Trois cas possibles :
 *
 * 1. Chargement en cours → affiche un Spinner (le temps de vérifier le token)
 * 2. Utilisateur non connecté → redirige vers /login
 *    - `replace` empêche l'ajout de la page protégée dans l'historique
 *      (le bouton "retour" ne ramènera pas à la page protégée)
 * 3. Utilisateur connecté → affiche les enfants (la page protégée)
 *
 * Utilisation dans App.jsx :
 *   <RouteProtegee>
 *     <ProfilPage />
 *   </RouteProtegee>
 */
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Spinner from "../UI/Spinner";

function RouteProtegee({ children }) {
  const { utilisateur, chargement } = useAuth();

  // Pendant la vérification du token, on affiche un spinner
  if (chargement) {
    return <Spinner />;
  }

  // Si pas d'utilisateur connecté → redirection vers la page de connexion
  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  // Utilisateur connecté → on rend les composants enfants
  return children;
}

export default RouteProtegee;
