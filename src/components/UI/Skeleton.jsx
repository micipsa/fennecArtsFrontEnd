/**
 * Skeleton — composants de chargement squelette pour remplacer les spinners.
 *
 * Variantes :
 * - SkeletonCarte : squelette d'une carte article/événement/tournoi
 * - SkeletonGrille : grille de 3 squelettes (pour les sections de la HomePage)
 * - SkeletonLigne : barre de chargement simple
 */
import styles from "./Skeleton.module.css";

export function SkeletonLigne({ largeur = "100%", hauteur = "1rem" }) {
  return (
    <div
      className={styles.ligne}
      style={{ width: largeur, height: hauteur }}
    />
  );
}

export function SkeletonCarte() {
  return (
    <div className={styles.carte}>
      <div className={styles.carteImage} />
      <div className={styles.carteCorps}>
        <div className={styles.carteEntete}>
          <SkeletonLigne largeur="70px" hauteur="22px" />
          <SkeletonLigne largeur="90px" hauteur="14px" />
        </div>
        <SkeletonLigne largeur="85%" hauteur="1.1rem" />
        <SkeletonLigne largeur="100%" hauteur="0.85rem" />
        <SkeletonLigne largeur="60%" hauteur="0.85rem" />
        <div className={styles.cartePied}>
          <SkeletonLigne largeur="120px" hauteur="14px" />
          <SkeletonLigne largeur="80px" hauteur="14px" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrille({ nombre = 3 }) {
  return (
    <div className={styles.grille}>
      {Array.from({ length: nombre }).map((_, i) => (
        <SkeletonCarte key={i} />
      ))}
    </div>
  );
}
