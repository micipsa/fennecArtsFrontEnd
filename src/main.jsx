/**
 * Point d'entrée de l'application React.
 *
 * Ce fichier est le premier code JavaScript exécuté par le navigateur
 * (chargé depuis index.html).
 *
 * Il effectue trois choses :
 * 1. Import des styles globaux (index.css).
 * 2. Insertion du composant racine <App /> dans la balise HTML #root.
 * 3. Enveloppement de toute l'application dans les providers nécessaires :
 *    - <StrictMode> : active les vérifications de développement de React
 *      (double render en dev, avertissements sur les API dépréciées, etc.).
 *    - <AuthProvider> : fournit le Context d'authentification à tous les
 *      composants enfants (voir src/context/AuthProvider.jsx).
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./context/AuthProvider";

// createRoot() créé la racine React, render() lance le premier rendu.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
