import { useEffect, useState } from "react";
import styles from "./LevelUpAnimation.module.css";

export default function LevelUpAnimation({ xpGagne, onClose }) {
  const [etape, setEtape] = useState("start");

  useEffect(() => {
    // Jouer un son (optionnel, si le fichier existe)
    try {
      const audio = new Audio("/sounds/levelup.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {}

    // Séquence d'animation
    const t1 = setTimeout(() => setEtape("show"), 100);
    const t2 = setTimeout(() => setEtape("fadeout"), 2500);
    const t3 = setTimeout(() => onClose(), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onClose]);

  return (
    <div className={`${styles.overlay} ${styles[etape]}`}>
      <div className={styles.lumiere} />
      <div className={styles.contenu}>
        <div className={styles.fleche}>⬆️</div>
        <h2 className={styles.titre}>LEVEL UP !</h2>
        <p className={styles.xpTexte}>+{xpGagne} XP gagnés</p>
      </div>
    </div>
  );
}
