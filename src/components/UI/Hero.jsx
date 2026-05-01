import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      {/* Grille cyberpunk */}
      <div className={styles.grille}>
        {/* ── Colonne gauche : texte ── */}
        <div className={styles.contenu}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            🎮 Gaming · ⚔️ Esport · 📖 Manga · 🇩🇿 Culture DZ
          </div>

          <div className={styles.entree}>
            <span className={styles.entreeTexte}>
              {">>> ENTER THE DOJO <<<"}
            </span>
          </div>

          <h1 className={styles.titre}>
            <span className={styles.titreSub}>Bienvenue au</span>
            <span className={styles.titreMain}>Fennec's</span>
            <span className={styles.titreDojo}>Clan</span>
          </h1>

          <p className={styles.description}>
            Articles, tournois, événements et WebTV —<br />
            l'espace du fennec geek algérien.
          </p>

          <div className={styles.actions}>
            <Link to="/articles" className={styles.btnPrimaire}>
              Explorer →
            </Link>
            <Link to="/events" className={styles.btnSecondaire}>
              Événements
            </Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNombre}>100+</span>
              <span className={styles.statLabel}>Articles</span>
            </div>
            <div className={styles.separateur} />
            <div className={styles.statItem}>
              <span className={styles.statNombre}>100+</span>
              <span className={styles.statLabel}>Événements</span>
            </div>
            <div className={styles.separateur} />
            <div className={styles.statItem}>
              <span className={styles.statNombre}>200+</span>
              <span className={styles.statLabel}>Membres</span>
            </div>
          </div>

          {/* Tags flottants */}
          <div className={styles.tags}>
            <span className={styles.tag}>⚔️ Tournois</span>
            <span className={styles.tag}>📺 WebTV</span>
            <span className={styles.tag}>🏆 Classements</span>
            <span className={styles.tag}>🎌 Otaku</span>
          </div>
        </div>

        {/* ── Colonne droite : Fennekage ── */}
        <div className={styles.personnageSection}>
          {/* Aura de chakra */}
          <div className={styles.aura} />
          <div className={styles.aura2} />

          {/* Lignes scan manga */}
          <div className={styles.scanLines} />

          {/* Le personnage */}
          <img
            src="/fennekage.png"
            alt="Fennekage"
            className={styles.personnage}
          />

          {/* Icônes orbitantes */}

          {/* Badge rang */}
          {/* Lien Rejoindre */}
          <Link
            to="/register"
            className={styles.rejoindreBtn}
            onClick={() => {}}>
            ⚔️ Rejoins le Clan
          </Link>
        </div>
      </div>

      {/* Grille de fond perspective */}
      <div className={styles.grid3D} />
    </section>
  );
}

export default Hero;
