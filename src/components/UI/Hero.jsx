import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.grille}>
        <div className={`container ${styles.contenu}`}>
          <div className={styles.badge}>🎮 Gaming · Esport · Culture Geek</div>

          <h1 className={styles.titre}>
            La plateforme <br />
            <span className={styles.accentue}>culturelle</span> de la <br />
            scène algérienne
          </h1>

          <p className={styles.description}>
            Articles, événements, tournois et actualités — tout ce qui fait
            vivre la culture numérique, le gaming et l'esport en Algérie.
          </p>

          <div className={styles.actions}>
            <Link to="/articles" className={styles.btnPrimaire}>
              Explorer les articles
            </Link>
            <Link to="/events" className={styles.btnSecondaire}>
              Voir les événements
            </Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNombre}>100+</span>
              <span className={styles.statLabel}>Articles</span>
            </div>
            <div className={styles.separateur} />
            <div className={styles.statItem}>
              <span className={styles.statNombre}>50+</span>
              <span className={styles.statLabel}>Événements</span>
            </div>
            <div className={styles.separateur} />
            <div className={styles.statItem}>
              <span className={styles.statNombre}>500+</span>
              <span className={styles.statLabel}>Membres</span>
            </div>
          </div>
        </div>

        <div className={styles.logoSection}>
          <div className={styles.logoWrapper}>
            <img
              src="/FennecArts_eSports_Logo.png"
              alt="Fennec Arts"
              className={styles.logoImage}
            />
            <div className={styles.logoGlow} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
