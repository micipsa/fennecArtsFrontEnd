import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import WebTVContext from "./WebTVContext";

function WebTVProvider({ children }) {
  const [estEnLive, setEstEnLive] = useState(false);

  const verifierLive = useCallback(async () => {
    try {
      const res = await api.get("/api/webtv");
      setEstEnLive(res.data.estEnLive);
    } catch {
      // silencieux — pas d'erreur affichée
    }
  }, []);

  useEffect(() => {
    let actif = true;
    const run = async () => {
      await Promise.resolve();
      if (actif) {
        verifierLive();
      }
    };
    run();
    // Revérifie toutes les 5 minutes
    const intervalle = setInterval(() => {
      if (actif) {
        verifierLive();
      }
    }, 5 * 60 * 1000);
    return () => {
      actif = false;
      clearInterval(intervalle);
    };
  }, [verifierLive]);

  return (
    <WebTVContext.Provider value={{ estEnLive }}>
      {children}
    </WebTVContext.Provider>
  );
}

export default WebTVProvider;
