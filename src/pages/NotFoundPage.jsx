import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.contenu}>
        <div className={styles.logoWrapper}>
          <img
            src="/FennecArts_eSports_Logo.png"
            alt="Fennec Arts"
            className={styles.logo}
          />
        </div>

        <div className={styles.code}>404</div>

        <h1 className={styles.titre}>Page introuvable</h1>
        <p className={styles.description}>
          Oups — cette page n'existe pas ou a été déplacée.
          <br />
          Le fennec n'a rien trouvé ici.
        </p>

        <Link to="/" className={styles.bouton}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
