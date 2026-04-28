import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import styles from "./RedacteurLayout.module.css";
import { Link } from "react-router-dom";

function RedacteurLayout() {
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
          <p className={styles.sidebarSousTitre}>Espace rédacteur</p>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/redacteur"
            end
            className={({ isActive }) =>
              `${styles.navLien} ${isActive ? styles.actif : ""}`
            }>
            Mes articles
          </NavLink>

          <Link to="/" className={styles.navLien}>
            ← Accueil
          </Link>
        </nav>

        <div className={styles.sidebarPied}>
          <p className={styles.nomRedacteur}>{utilisateur?.nom}</p>
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

export default RedacteurLayout;
