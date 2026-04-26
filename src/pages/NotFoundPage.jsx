/**
 * NotFoundPage — page 404 affichée quand l'URL ne correspond à aucune route.
 *
 * Page simple et visuelle avec :
 * - Le logo de Fennec Arts
 * - Le code d'erreur "404" en grand
 * - Un titre "Page introuvable"
 * - Un message explicatif
 * - Un bouton pour retourner à l'accueil
 *
 * Cette page est rendue par la route catch-all `path="*"` dans App.jsx.
 */
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.contenu}>
        {/* Logo de la plateforme */}
        <div className={styles.logoWrapper}>
          <img
            src="/FennecArts_eSports_Logo.png"
            alt="Fennec Arts"
            className={styles.logo}
          />
        </div>

        {/* Code d'erreur 404 en grand */}
        <div className={styles.code}>404</div>

        {/* Message d'information */}
        <h1 className={styles.titre}>Page introuvable</h1>
        <p className={styles.description}>
          Oups — cette page n'existe pas ou a été déplacée.
          <br />
          Le fennec n'a rien trouvé ici.
        </p>

        {/* Bouton de retour à l'accueil */}
        <Link to="/" className={styles.bouton}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
