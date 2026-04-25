import { NavLink, Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar({ utilisateur, onDeconnexion }) {
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    onDeconnexion();
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          Fennec Arts
          <span className={styles.logoPoint} />
        </Link>

        {/* Liens de navigation */}
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

        {/* Actions droite */}
        <div className={styles.actions}>
          {utilisateur ? (
            <>
              {utilisateur.role === "admin" && (
                <Link to="/dashboard" className={styles.btnDashboard}>
                  Dashboard
                </Link>
              )}
              <span className={styles.nomUtilisateur}>{utilisateur.nom}</span>
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
