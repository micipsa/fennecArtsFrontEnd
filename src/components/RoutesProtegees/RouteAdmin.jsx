/**
 * RouteAdmin — composant guard pour les routes réservées aux administrateurs.
 *
 * Similaire à RouteProtegee, mais avec une vérification supplémentaire
 * du rôle de l'utilisateur. Quatre cas possibles :
 *
 * 1. Chargement en cours → affiche un Spinner
 * 2. Utilisateur non connecté → redirige vers /login
 * 3. Utilisateur connecté MAIS pas admin → redirige vers l'accueil (/)
 * 4. Utilisateur admin → affiche les composants enfants (le dashboard)
 *
 * Utilisation dans App.jsx :
 *   <RouteAdmin>
 *     <DashboardLayout />
 *   </RouteAdmin>
 */
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Spinner from "../UI/Spinner";

function RouteAdmin({ children }) {
  const { utilisateur, chargement } = useAuth();

  // Pendant la vérification du token, on affiche un spinner
  if (chargement) {
    return <Spinner />;
  }

  // Si pas d'utilisateur connecté → redirection vers login
  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur n'est pas admin → redirection vers l'accueil
  if (utilisateur.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Utilisateur admin → on rend les composants enfants
  return children;
}

export default RouteAdmin;
