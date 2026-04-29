import { useState, useEffect } from "react";
import axios from "axios";
import WebTVContext from "./WebTVContext";

function WebTVProvider({ children }) {
  const [estEnLive, setEstEnLive] = useState(false);

  const verifierLive = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/webtv`);
      setEstEnLive(res.data.estEnLive);
    } catch {
      // silencieux — pas d'erreur affichée
    }
  };

  useEffect(() => {
    verifierLive();
    // Revérifie toutes les 5 minutes
    const intervalle = setInterval(verifierLive, 5 * 60 * 1000);
    return () => clearInterval(intervalle);
  }, []);

  return (
    <WebTVContext.Provider value={{ estEnLive }}>
      {children}
    </WebTVContext.Provider>
  );
}

export default WebTVProvider;
