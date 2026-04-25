import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Colonne logo + description */}
        <div className={styles.logoCol}>
          <Link to="/" className={styles.logo}>
            Fennec Arts
          </Link>
          <p>
            Plateforme culturelle dédiée à la promotion des arts et de la
            créativité en Algérie.
          </p>
        </div>

        {/* Navigation rapide */}
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

        {/* Compte */}
        <div>
          <p className={styles.colTitre}>Compte</p>
          <ul className={styles.liensList}>
            <li>
              <Link to="/login">Connexion</Link>
            </li>
            <li>
              <Link to="/register">Inscription</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container">
        <p className={styles.copyright}>
          © {annee} Fennec Arts Platform — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}

export default Footer;
