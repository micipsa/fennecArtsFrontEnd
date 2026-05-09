import { Link } from "react-router-dom";
import ParticulesFond from "./ParticulesFond";
import useAuth from "../../hooks/useAuth";
import styles from "./Hero.module.css";

function Hero() {
  const { utilisateur } = useAuth();

  return (
    <section className={styles.heroWrapper}>
      {/* Grille de fond */}
      <div className={styles.grilleCyberpunk} />
      
      {/* Particules flottantes (allégées pour un look plus pro) */}
      <div className={styles.particulesWrapper}>
        <ParticulesFond couleur="#e63946" densite={5} vitesse={0.2} taille={2} />
      </div>

      {/* Halos de glow autour du personnage */}
      <div className={styles.glowHalo1} />
      <div className={styles.glowHalo2} />

      {/* Contenu principal */}
      <div className={styles.contenuHero}>
        {/* Gauche : texte */}
        <div className={styles.texteSection}>
          <div className={styles.bienvenue}>BIENVENUE AU</div>
          
          <h1 className={styles.titre}>
            Fennec's<br />
            <span className={styles.titreRed}>Clan</span>
          </h1>

          <p className={styles.description}>
            Articles, tournois, événements et WebTV — l'espace du fennec geek algérien.
          </p>

          <div className={styles.boutons}>
            <Link to="/articles" className={styles.btnPrimaire}>
              <span>Découvrir</span>
              <span className={styles.arrow}>→</span>
            </Link>
            <Link to="/tournaments" className={styles.btnSecondaire}>Tournois</Link>
          </div>
        </div>

        {/* Droite : image personnage */}
        <div className={styles.imageSection}>
          <img src="/fennekage.png" alt="Fennekage" />
          
          {utilisateur ? (
            <Link to="/arcade" className={styles.rejoindreBtn}>
              ⚔️ Entre à la salle d'arcade
            </Link>
          ) : (
            <Link to="/register" className={styles.rejoindreBtn}>
              ⚔️ Rejoins le Clan
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
