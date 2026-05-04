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
      
      {/* Particules flottantes */}
      <div className={styles.particulesWrapper}>
        <ParticulesFond couleur="#e63946" densite={15} vitesse={0.3} taille={2} />
        <ParticulesFond couleur="#f4a261" densite={10} vitesse={0.2} taille={1.5} />
      </div>

      {/* Halos de glow autour du personnage */}
      <div className={styles.glowHalo1} />
      <div className={styles.glowHalo2} />

      {/* Contenu principal */}
      <div className={styles.contenuHero}>
        {/* Gauche : texte */}
        <div className={styles.texteSection}>
          <div className={styles.badges}>
            <span>🎮 Gaming</span>
            <span>🏆 Esport</span>
            <span>📚 Manga</span>
            <span>🇩🇿 Culture DZ</span>
          </div>

          <div className={styles.bienvenue}>BIENVENUE AU</div>
          
          <h1 className={styles.titre}>
            Fennec's<br />
            <span className={styles.titreRed}>Clan</span>
            {/* Ligne animée sous le titre */}
            <div className={styles.ligneAnimee} />
          </h1>

          <p className={styles.description}>
            Articles, tournois, événements et WebTV — l'espace du fennec geek algérien.
          </p>

          <div className={styles.boutons}>
            <Link to="/articles" className={styles.btnPrimaire}>
              <span>Articles</span>
              <span className={styles.arrow}>→</span>
            </Link>
            <Link to="/tournaments" className={styles.btnSecondaire}>Tournois</Link>
          </div>

          <div className={styles.stats}>
            <div><strong>100+</strong><p>Articles</p></div>
            <div><strong>100+</strong><p>Événements</p></div>
            <div><strong>200+</strong><p>Membres</p></div>
          </div>

          <div className={styles.ctas}>
            <Link to="/events">📅 Événements</Link>
            <Link to="/webtv">📺 WebTV</Link>
            <Link to="/play">🎮 Dojo Play</Link>
            <Link to="/defis">⚔️ Défis</Link>
            <Link to="/classement">🏅 Classement</Link>
            <Link to="/communaute">👥 Communauté</Link>
            <Link to="/store">🛒 Store</Link>
          </div>
        </div>

        {/* Droite : image personnage */}
        <div className={styles.imageSection}>
          <img src="/fennekage.png" alt="Fennekage" />
          
          {utilisateur ? (
            <Link to="/dashboard/missions" className={styles.rejoindreBtn}>
              ⚔️ Accomplis tes quêtes
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
