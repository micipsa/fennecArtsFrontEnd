import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const { utilisateur, deconnecter } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const handleDeconnexion = () => {
    deconnecter();
    setMenuOuvert(false);
    navigate("/");
  };

  const fermerMenu = () => setMenuOuvert(false);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={fermerMenu}>
          <img
            src="/FennecArts_eSports_Logo.png"
            alt="Fennec Arts"
            className={styles.logoImg}
          />
          <span className={styles.logoTexte}>Fennec Arts</span>
        </Link>

        {/* Bouton burger — visible uniquement sur mobile */}
        <button
          className={styles.burger}
          onClick={() => setMenuOuvert((v) => !v)}
          aria-label="Menu">
          <span
            className={`${styles.burgerLigne} ${menuOuvert ? styles.burgerLigne1Ouvert : ""}`}
          />
          <span
            className={`${styles.burgerLigne} ${menuOuvert ? styles.burgerLigne2Ouvert : ""}`}
          />
          <span
            className={`${styles.burgerLigne} ${menuOuvert ? styles.burgerLigne3Ouvert : ""}`}
          />
        </button>

        {/* Menu — masqué sur mobile sauf si ouvert */}
        <div
          className={`${styles.menuWrapper} ${menuOuvert ? styles.menuOuvert : ""}`}>
          <ul className={styles.nav}>
            <li>
              <NavLink
                to="/"
                end
                onClick={fermerMenu}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }>
                Accueil
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/articles"
                onClick={fermerMenu}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }>
                Articles
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/events"
                onClick={fermerMenu}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }>
                Événements
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tournaments"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }>
                Tournois
              </NavLink>
            </li>
          </ul>

          <div className={styles.actions}>
            {utilisateur ? (
              <>
                {utilisateur.role === "admin" && (
                  <Link
                    to="/dashboard"
                    className={styles.btnDashboard}
                    onClick={fermerMenu}>
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profil"
                  className={styles.nomUtilisateur}
                  onClick={fermerMenu}>
                  {utilisateur.nom}
                </Link>
                <button
                  className={styles.btnDeconnexion}
                  onClick={handleDeconnexion}>
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={styles.btnConnexion}
                onClick={fermerMenu}>
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
