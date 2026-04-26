import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const { utilisateur, deconnecter } = useAuth();

  const handleDeconnexion = () => {
    deconnecter();
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          Fennec Arts
          <span className={styles.logoPoint} />
        </Link>

        <ul className={styles.nav}>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }>
              Accueil
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/articles"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }>
              Articles
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }>
              Événements
            </NavLink>
          </li>
        </ul>

        <div className={styles.actions}>
          {utilisateur ? (
            <>
              {utilisateur.role === "admin" && (
                <Link to="/dashboard" className={styles.btnDashboard}>
                  Dashboard
                </Link>
              )}
              <Link to="/profil" className={styles.nomUtilisateur}>
                {utilisateur.nom}
              </Link>
              <button
                className={styles.btnDeconnexion}
                onClick={handleDeconnexion}>
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.btnConnexion}>
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
