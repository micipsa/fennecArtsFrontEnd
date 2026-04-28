/**
 * Footer — pied de page affiché en bas de toutes les pages publiques.
 *
 * Structure en trois colonnes :
 * 1. Logo + description de la plateforme + tags de catégories
 * 2. Liens de navigation rapide (Accueil, Articles, Événements)
 * 3. Liens liés au compte (Connexion, Inscription, Mon profil)
 *
 * En bas : copyright avec l'année dynamique + badge "Made by Suncraft".
 */
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
  // Récupère l'année actuelle pour le copyright dynamique
  const annee = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* ── Partie principale : 3 colonnes ── */}
      <div className={`container ${styles.inner}`}>
        {/* Colonne 1 : Logo + description + tags */}
        <div className={styles.logoCol}>
          <Link to="/" className={styles.logo}>
            <img
              src="/FennecArts_eSports_Logo.png"
              alt="Fennec Arts"
              className={styles.logoImg}
            />
            Fennec Arts
          </Link>
          <p>
            Plateforme culturelle dédiée au gaming, à l'esport et à la culture
            numérique en Algérie.
          </p>
          {/* Tags visuels des thématiques couvertes */}
          <div className={styles.tags}>
            <span className={styles.tag}>🎮 Gaming</span>
            <span className={styles.tag}>🏆 Esport</span>
            <span className={styles.tag}>🎨 Culture</span>
            <span className={styles.tag}>🤖 Geek</span>
          </div>
          {/* Réseaux sociaux */}
          <div className={styles.reseaux}>
            <a
              href="https://www.instagram.com/fennecarts/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
                width="20"
                height="20"
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
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Colonne 2 : Liens de navigation rapide */}
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
          </ul>
        </div>

        {/* Colonne 3 : Liens liés au compte utilisateur */}
        <div>
          <p className={styles.colTitre}>Compte</p>
          <ul className={styles.liensList}>
            <li>
              <Link to="/login">Connexion</Link>
            </li>
            <li>
              <Link to="/register">Inscription</Link>
            </li>
            <li>
              <Link to="/profil">Mon profil</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Barre inférieure : copyright + badge créateur ── */}
      <div className="container">
        <div className={styles.bas}>
          <p className={styles.copyright}>
            © {annee}{" "}
            <span className={styles.accentCopyright}>Fennec Arts</span> — Tous
            droits réservés
          </p>
          {/* Lien vers la page Facebook de Suncraft (créateur du site) */}
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
