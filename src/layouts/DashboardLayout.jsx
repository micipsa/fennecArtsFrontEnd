/**
 * DashboardLayout — layout de l'espace d'administration.
 *
 * Ce composant structure la partie admin du site avec :
 * - Une sidebar (barre latérale) contenant :
 *   - Le titre de l'application et le sous-titre "Administration"
 *   - Les liens de navigation vers les sections CRUD (articles, événements, etc.)
 *   - Le nom de l'admin connecté et un bouton de déconnexion
 * - Une zone de contenu principale (<Outlet />) qui rend la page dashboard active.
 *
 * Chaque lien utilise <NavLink> de React Router, qui ajoute automatiquement
 * la classe CSS "actif" quand le lien correspond à la route courante.
 * Le prop `end` sur le premier NavLink empêche qu'il soit actif pour les sous-routes.
 */
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import styles from "./DashboardLayout.module.css";
import { Link } from "react-router-dom";

function DashboardLayout() {
  // Récupération de l'utilisateur connecté et de la fonction de déconnexion
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();

  /**
   * Gestionnaire de déconnexion : supprime le token, remet l'état auth à null,
   * puis redirige vers la page d'accueil.
   */
  const handleDeconnexion = () => {
    deconnecter();
    navigate("/");
  };

  // Navigation entre les sections du dashboard
  const estAdmin = utilisateur?.role === "admin";
  const estOrganisateur =
    utilisateur?.role === "organisateur" || utilisateur?.estOrganisateur;

  return (
    <div className={styles.wrapper}>
      {/* ── Sidebar (barre latérale) ── */}
      <aside className={styles.sidebar}>
        {/* En-tête de la sidebar */}
        <div className={styles.sidebarEntete}>
          <p className={styles.sidebarTitre}>Fennec's Clan</p>
          <p className={styles.sidebarSousTitre}>
            {estAdmin ? "Administration" : "Espace Organisateur"}
          </p>
        </div>

        {/* Navigation entre les sections du dashboard */}
        <nav className={styles.nav}>
          {/* Vue d'ensemble : admin uniquement */}
          {estAdmin && (
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `${styles.navLien} ${isActive ? styles.actif : ""}`
              }>
              Vue d'ensemble
            </NavLink>
          )}

          {estAdmin && (
            <>
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
                to="/dashboard/chaines"
                className={({ isActive }) =>
                  `${styles.navLien} ${isActive ? styles.actif : ""}`
                }>
                Chaînes WebTV
              </NavLink>
              <NavLink
                to="/dashboard/store"
                className={({ isActive }) =>
                  `${styles.navLien} ${isActive ? styles.actif : ""}`
                }>
                Store
              </NavLink>
              <NavLink
                to="/dashboard/quetes"
                className={({ isActive }) =>
                  `${styles.navLien} ${isActive ? styles.actif : ""}`
                }>
                Quêtes
              </NavLink>
              <NavLink
                to="/dashboard/codes"
                className={({ isActive }) =>
                  `${styles.navLien} ${isActive ? styles.actif : ""}`
                }>
                🎟️ Codes Promo
              </NavLink>
              <NavLink
                to="/dashboard/animations"
                className={({ isActive }) =>
                  `${styles.navLien} ${isActive ? styles.actif : ""}`
                }>
                🎮 Dojo Play
              </NavLink>
            </>
          )}

          {(estAdmin || estOrganisateur) && (
            <NavLink
              to="/dashboard/tournois"
              className={({ isActive }) =>
                `${styles.navLien} ${isActive ? styles.actif : ""}`
              }>
              Tournois
            </NavLink>
          )}

          <NavLink
            to="/dashboard/missions"
            className={({ isActive }) =>
              `${styles.navLien} ${isActive ? styles.actif : ""}`
            }>
            Missions
          </NavLink>
          <Link to="/" className={styles.navLien}>
            ← Retour au site
          </Link>
        </nav>

        {/* Pied de la sidebar : nom de l'admin + bouton déconnexion */}
        <div className={styles.sidebarPied}>
          {/* Optional chaining (?.) au cas où utilisateur n'est pas encore chargé */}
          <p className={styles.nomAdmin}>{utilisateur?.nom}</p>
          <button className={styles.btnDeconnexion} onClick={handleDeconnexion}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Zone de contenu principal du dashboard ── */}
      <main className={styles.contenu}>
        {/* Outlet rend la page correspondant à la sous-route active */}
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
