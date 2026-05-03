import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Spinner from "../UI/Spinner";

/**
 * RouteAdherent — protège les routes réservées aux adhérents.
 * Autorise également les administrateurs et organisateurs.
 */
function RouteAdherent({ children }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) return <Spinner />;
  if (!utilisateur) return <Navigate to="/login" replace />;

  if (utilisateur.role === "utilisateur") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RouteAdherent;
