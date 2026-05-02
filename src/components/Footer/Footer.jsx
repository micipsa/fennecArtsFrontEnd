/**
 * Footer — pied de page affiché en bas de toutes les pages publiques.
 *
 * Structure en quatre colonnes :
 * 1. Logo + description de la plateforme + tags de catégories
 * 2. Liens de navigation rapide
 * 3. Communauté (Tournois, WebTV, Classement)
 * 4. Liens liés au compte
 *
 * En bas : copyright avec l'année dynamique + réseaux sociaux + badge "Made by Suncraft".
 */
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* ── Partie principale : 4 colonnes ── */}
      <div className={`container ${styles.inner}`}>
        {/* Colonne 1 : Logo + description + tags */}
        <div className={styles.logoCol}>
          <Link to="/" className={styles.logo}>
            <img
              src="/fennekagelogo.png"
              alt="Fennec's Clan"
              className={styles.logoImg}
            />
            <div className={styles.logoTextes}>
              <span className={styles.logoNom}>Fennec's</span>
              <span className={styles.logoClan}>Clan</span>
            </div>
          </Link>
          <p>
            La communauté gaming, esport et culture geek algérienne. Articles,
            tournois, événements et WebTV — tout l'univers du fennec.
          </p>
          <div className={styles.tags}>
            <span className={styles.tag}>🎮 Gaming</span>
            <span className={styles.tag}>⚔️ Esport</span>
            <span className={styles.tag}>📖 Manga</span>
            <span className={styles.tag}>🇩🇿 Culture DZ</span>
          </div>
        </div>

        {/* Colonne 2 : Navigation */}
        <div>
          <p className={styles.colTitre}>Navigation</p>
          <ul className={styles.liensList}>
            <li>
              <Link to="/">Accueil</Link>
            </li>
            <li>
              <Link to="/articles">Articles</Link>
            </li>
            <li>
              <Link to="/events">Événements</Link>
            </li>
            <li>
              <Link to="/agenda">Agenda</Link>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : Communauté */}
        <div>
          <p className={styles.colTitre}>Communauté</p>
          <ul className={styles.liensList}>
            <li>
              <Link to="/tournaments">Tournois</Link>
            </li>
            <li>
              <Link to="/webtv">WebTV</Link>
            </li>
            <li>
              <Link to="/classement">Classement</Link>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Compte */}
        <div>
          <p className={styles.colTitre}>Compte</p>
          <ul className={styles.liensList}>
            <li>
              <Link to="/login">Connexion</Link>
            </li>
            <li>
              <Link to="/register">Rejoindre le Clan</Link>
            </li>
            <li>
              <Link to="/profil">Mon profil</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Barre inférieure : copyright + réseaux + badge ── */}
      <div className="container">
        <div className={styles.bas}>
          <p className={styles.copyright}>
            © {annee}{" "}
            <span className={styles.accentCopyright}>Fennec's Clan</span> —
            Tous droits réservés
          </p>

          {/* Réseaux sociaux */}
          <div className={styles.reseaux}>
            <a
              href="https://www.instagram.com/fennecarts/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@FennecArtseSports"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.5 5 12 5 12 5s-4.5 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.5 0 7-.1c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.5V9.5l5.4 2.5-5.4 2.5z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/fnkgamiing"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>

          {/* Badge créateur */}
          <a
            href="https://www.facebook.com/suncraftbejaia"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.badgeFooter}>
            <img
              src="/logo_suncraft.png"
              alt="Suncraft"
              className={styles.suncraftLogo}
            />
            Made by Suncraft
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
