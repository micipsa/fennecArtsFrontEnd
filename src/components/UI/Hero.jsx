import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.contenu}`}>
        <div className={styles.badge}>🎨 Plateforme culturelle algérienne</div>

        <h1 className={styles.titre}>
          Découvrez les arts <br />
          <span className={styles.accentue}>qui nous rassemblent</span>
        </h1>

        <p className={styles.description}>
          Fennec Arts est un espace dédié à la promotion de la création
          artistique en Algérie — expositions, concerts, articles et événements
          culturels réunis en un seul endroit.
        </p>

        <div className={styles.actions}>
          <Link to="/articles" className="btn btn-primaire">
            Lire les articles
          </Link>
          <Link to="/events" className="btn btn-outline">
            Voir les événements
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
