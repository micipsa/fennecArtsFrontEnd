import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Spinner from "../UI/Spinner";

function RouteRedacteur({ children }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) return <Spinner />;
  if (!utilisateur) return <Navigate to="/login" replace />;
  if (utilisateur.role !== "redacteur" && utilisateur.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RouteRedacteur;
