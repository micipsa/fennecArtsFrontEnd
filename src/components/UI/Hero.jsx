/**
 * Hero — section d'en-tête visuelle de la page d'accueil.
 *
 * C'est la première chose que voit le visiteur. Elle contient :
 * - Un badge textuel présentant les thématiques (Gaming, Esport, Culture Geek)
 * - Un titre principal (<h1>) avec le mot "culturelle" accentué visuellement
 * - Une description courte de la plateforme
 * - Deux boutons d'action (CTA) : "Explorer les articles" et "Voir les événements"
 * - Des statistiques visuelles (nombre d'articles, événements, membres)
 * - Le logo de Fennec Arts avec un effet de glow (luminosité) en arrière-plan
 *
 * Ce composant n'a pas de state, c'est un composant purement présentationnel.
 */
import { Link } from "react-router-dom";
import styles from "./Hero.module.css";
function Hero() {
  return (
    <section className={styles.hero}>
      {/* Grille à deux colonnes : contenu textuel + logo */}
      <div className={styles.grille}>
        {/* ── Colonne gauche : texte et CTA ── */}
        <div className={`container ${styles.contenu}`}>
          {/* Badge décoratif des thématiques */}
          <div className={styles.badge}>🎮 Gaming · Esport · Culture Geek</div>
          {/* Titre principal de la page d'accueil */}
          <h1 className={styles.titre}>
            Fennec Arts —<br />
            là où la culture geek
            <br />
            <span className={styles.accentue}>prend vie en Algérie.</span>
          </h1>
          {/* Description courte */}
          <p className={styles.description}>
            Articles, événements, tournois et WebTV —<br />
            tout ce qui fait vivre la scène geek algérienne.
          </p>
          {/* Boutons d'action (Call-to-Action) */}
          <div className={styles.actions}>
            <Link to="/articles" className={styles.btnPrimaire}>
              Explorer les articles
            </Link>
            <Link to="/events" className={styles.btnSecondaire}>
              Voir les événements
            </Link>
          </div>
          {/* Compteurs statistiques décoratifs */}
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
        {/* ── Colonne droite : logo avec effet glow ── */}
        <div className={styles.logoSection}>
          <div className={styles.logoWrapper}>
            <img
              src="/FennecArts_eSports_Logo.png"
              alt="Fennec Arts"
              className={styles.logoImage}
            />
            {/* Div vide qui crée l'effet de luminosité derrière le logo (CSS) */}
            <div className={styles.logoGlow} />
          </div>
        </div>
      </div>
    </section>
  );
}
export default Hero;
