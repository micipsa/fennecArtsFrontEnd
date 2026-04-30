/**
 * Navbar — barre de navigation principale visible sur toutes les pages publiques.
 *
 * Fonctionnalités :
 * - Logo cliquable qui ramène à l'accueil.
 * - Menu hamburger (burger) responsive pour mobile :
 *   - Un state `menuOuvert` contrôle l'affichage du menu mobile.
 *   - Les trois barres du burger s'animent quand le menu est ouvert.
 * - Liens de navigation vers : Accueil, Articles, Événements, Tournois.
 *   - Chaque lien utilise <NavLink> qui ajoute la classe `active`
 *     quand il correspond à la route courante.
 * - Zone d'actions contextuelle selon l'état d'authentification :
 *   - Non connecté : bouton "Connexion"
 *   - Connecté : nom de l'utilisateur (lien vers profil) + bouton "Déconnexion"
 *   - Admin : lien supplémentaire vers le Dashboard
 */
import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useWebTV from "../../hooks/useWebTV";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  // Récupération de l'utilisateur connecté et de la fonction de déconnexion
  const { utilisateur, deconnecter } = useAuth();
  const { estEnLive } = useWebTV();
  // State pour le menu mobile (ouvert/fermé)
  const [menuOuvert, setMenuOuvert] = useState(false);

  /**
   * Gestionnaire de déconnexion :
   * 1. Appelle deconnecter() (supprime token + reset state)
   * 2. Ferme le menu mobile
   * 3. Redirige vers la page d'accueil
   */
  const handleDeconnexion = () => {
    deconnecter();
    setMenuOuvert(false);
    navigate("/");
  };

  // Ferme le menu mobile (utilisé dans les onClick des liens)
  const fermerMenu = () => setMenuOuvert(false);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        {/* ── Logo ── */}
        <Link to="/" className={styles.logo} onClick={fermerMenu}>
          <img
            src="/FennecArts_eSports_Logo.png"
            alt="Fennec Arts"
            className={styles.logoImg}
          />
          <span className={styles.logoTexte}>Fennec Arts</span>
        </Link>

        {/* ── Bouton burger — visible uniquement sur mobile (via CSS) ── */}
        <button
          className={styles.burger}
          onClick={() => setMenuOuvert((v) => !v)}
          aria-label="Menu">
          {/* Les trois lignes du burger s'animent quand menuOuvert est true */}
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

        {/* ── Menu — masqué sur mobile sauf si ouvert ── */}
        <div
          className={`${styles.menuWrapper} ${menuOuvert ? styles.menuOuvert : ""}`}>
          {/* Liens de navigation principaux */}
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
                to="/webtv"
                onClick={fermerMenu}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }>
                WebTV
                {estEnLive && <span className={styles.badgeLive} />}
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
                onClick={fermerMenu}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }>
                Tournois
              </NavLink>
            </li>
          </ul>

          {/* ── Zone d'actions (connexion / profil / déconnexion) ── */}
          <div className={styles.actions}>
            {utilisateur ? (
              <>
                {/* Lien Dashboard visible seulement pour les admins */}
                {utilisateur.role === "admin" && (
                  <Link
                    to="/dashboard"
                    className={styles.btnDashboard}
                    onClick={fermerMenu}>
                    Dashboard
                  </Link>
                )}

                {/* Lien Dashboard pour les organisateurs (non-admins) */}
                {(utilisateur.estOrganisateur ||
                  utilisateur.role === "organisateur") &&
                  utilisateur.role !== "admin" && (
                    <Link
                      to="/dashboard/missions"
                      className={styles.btnDashboard}
                      onClick={fermerMenu}>
                      Dashboard
                    </Link>
                  )}

                {/* Lien Dashboard visible seulement pour les redacteurs */}
                {utilisateur.role === "redacteur" && (
                  <Link
                    to="/redacteur"
                    className={styles.btnDashboard}
                    onClick={fermerMenu}>
                    Mes articles
                  </Link>
                )}

                {/* Lien Missions visible pour tous les rôles sauf admin (car admin l'a dans son dashboard) */}
                {utilisateur.role !== "admin" &&
                  utilisateur.role !== "utilisateur" && (
                    <Link
                      to="/missions"
                      className={styles.btnDashboard}
                      onClick={fermerMenu}>
                      Missions
                    </Link>
                  )}
                {/* Nom de l'utilisateur cliquable → page profil */}
                <Link
                  to="/profil"
                  className={styles.nomUtilisateur}
                  onClick={fermerMenu}>
                  {utilisateur.nom}
                </Link>
                {/* Bouton de déconnexion */}
                <button
                  className={styles.btnDeconnexion}
                  onClick={handleDeconnexion}>
                  Déconnexion
                </button>
              </>
            ) : (
              /* Si non connecté : bouton de connexion */
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
