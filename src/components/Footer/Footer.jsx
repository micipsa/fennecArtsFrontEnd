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
