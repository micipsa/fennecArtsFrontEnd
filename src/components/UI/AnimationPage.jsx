/**
 * AnimationPage — wrapper qui ajoute une animation fade-in + slide-up
 * à chaque page lors de son montage.
 *
 * Utilisation :
 *   <AnimationPage>
 *     <MonContenu />
 *   </AnimationPage>
 *
 * Pas de dépendances externes (framer-motion) — utilise CSS animations.
 */
import { useEffect, useRef, useState } from "react";
import styles from "./AnimationPage.module.css";

function AnimationPage({ children }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Petit délai pour que le DOM soit prêt avant de lancer l'animation
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div ref={ref} className={`${styles.page} ${visible ? styles.visible : ""}`}>
      {children}
    </div>
  );
}

export default AnimationPage;
