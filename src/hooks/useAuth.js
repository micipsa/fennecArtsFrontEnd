/**
 * Hook personnalisé useAuth — raccourci pour consommer le Context d'authentification.
 *
 * Au lieu d'écrire à chaque fois :
 *   import { useContext } from "react";
 *   import AuthContext from "../context/AuthContext";
 *   const { utilisateur } = useContext(AuthContext);
 *
 * On utilise simplement :
 *   import useAuth from "../hooks/useAuth";
 *   const { utilisateur } = useAuth();
 *
 * Ce hook retourne l'objet contenant : utilisateur, chargement, connecter, deconnecter.
 */
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function useAuth() {
  return useContext(AuthContext);
}

export default useAuth;
