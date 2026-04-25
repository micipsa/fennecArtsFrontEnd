import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import styles from "./MainLayout.module.css";

function MainLayout() {
  // Données mockées — remplacées par le Context API au Day 12
  const [utilisateur, setUtilisateur] = useState(null);

  const handleDeconnexion = () => {
    setUtilisateur(null);
    localStorage.removeItem("token");
  };

  return (
    <div className={styles.wrapper}>
      <Navbar utilisateur={utilisateur} onDeconnexion={handleDeconnexion} />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
