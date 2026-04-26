import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Spinner from "../UI/Spinner";

function RouteProtegee({ children }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return <Spinner />;
  }

  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RouteProtegee;
