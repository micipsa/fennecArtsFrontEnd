import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import styles from "./DashboardLayout.module.css";

function DashboardLayout() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnecter();
    navigate("/");
  };

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarEntete}>
          <p className={styles.sidebarTitre}>Fennec Arts</p>
          <p className={styles.sidebarSousTitre}>Administration</p>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `${styles.navLien} ${isActive ? styles.actif : ""}`
            }>
            Vue d'ensemble
          </NavLink>
          <NavLink
            to="/dashboard/articles"
            className={({ isActive }) =>
              `${styles.navLien} ${isActive ? styles.actif : ""}`
            }>
            Articles
          </NavLink>
          <NavLink
            to="/dashboard/evenements"
            className={({ isActive }) =>
              `${styles.navLien} ${isActive ? styles.actif : ""}`
            }>
            Événements
          </NavLink>
          <NavLink
            to="/dashboard/utilisateurs"
            className={({ isActive }) =>
              `${styles.navLien} ${isActive ? styles.actif : ""}`
            }>
            Utilisateurs
          </NavLink>
          <NavLink
            to="/dashboard/tournois"
            className={({ isActive }) =>
              `${styles.navLien} ${isActive ? styles.actif : ""}`
            }>
            Tournois
          </NavLink>
        </nav>

        <div className={styles.sidebarPied}>
          <p className={styles.nomAdmin}>{utilisateur?.nom}</p>
          <button className={styles.btnDeconnexion} onClick={handleDeconnexion}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className={styles.contenu}>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
