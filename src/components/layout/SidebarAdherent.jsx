import { NavLink } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import styles from "./SidebarAdherent.module.css";

export default function SidebarAdherent() {
  const { utilisateur } = useContext(AuthContext);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profil}>
        <div className={styles.avatar}>
          {utilisateur?.nom?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className={styles.nom}>{utilisateur?.nom || "Adhérent"}</span>
        <span className={styles.role}>{utilisateur?.role}</span>
      </div>

      <nav className={styles.nav}>
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            isActive ? `${styles.lien} ${styles.actif}` : styles.lien
          }>
          🏠 Accueil
        </NavLink>

        <NavLink
          to="/missions"
          className={({ isActive }) =>
            isActive ? `${styles.lien} ${styles.actif}` : styles.lien
          }>
          📋 Missions
        </NavLink>
      </nav>
    </aside>
  );
}
