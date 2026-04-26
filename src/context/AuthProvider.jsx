import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../services/api";

function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(
    () => !!localStorage.getItem("token"),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/api/auth/me")
        .then((res) => setUtilisateur(res.data.user))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setChargement(false));
    }
  }, []);

  //const connecter = (token, donneesUtilisateur) => {
  //localStorage.setItem("token", token);
  //setUtilisateur(donneesUtilisateur);
  //};
  const connecter = (token, donneesUtilisateur) => {
    console.log("connecter appelé avec :", donneesUtilisateur); // ← ajoute cette ligne
    localStorage.setItem("token", token);
    setUtilisateur(donneesUtilisateur);
  };

  const deconnecter = () => {
    localStorage.removeItem("token");
    setUtilisateur(null);
  };

  const valeur = {
    utilisateur,
    chargement,
    connecter,
    deconnecter,
  };

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
