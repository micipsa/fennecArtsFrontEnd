/**
 * AvatarIcon — Composant réutilisable pour afficher l'avatar + cadre d'un utilisateur.
 *
 * Props :
 * - avatarUrl  : URL de l'icône d'avatar (default: /avatars/fennec-default.png)
 * - cadreStyle : identifiant du cadre CSS (none, fire, neon, electric, diamond, glitch, sakura)
 * - taille     : xs | sm | md | lg | xl
 * - nom        : nom de l'utilisateur (fallback alt text)
 */
import styles from "./AvatarIcon.module.css";

const CADRE_MAP = {
  none: styles.cadreNone,
  fire: styles.cadreFire,
  neon: styles.cadreNeon,
  electric: styles.cadreElectric,
  diamond: styles.cadreDiamond,
  glitch: styles.cadreGlitch,
  sakura: styles.cadreSakura,
  hologram: styles.cadreHologram,
  matrix: styles.cadreMatrix,
  cosmic: styles.cadreCosmic,
  rainbow: styles.cadreRainbow,
  frost: styles.cadreFrost,
};

export default function AvatarIcon({
  avatarUrl = "/avatars/fennec-default.png",
  cadreStyle = "none",
  taille = "sm",
  nom = "Utilisateur",
}) {
  const cadreClass = CADRE_MAP[cadreStyle] || styles.cadreNone;
  const tailleClass = styles[taille] || styles.sm;

  return (
    <div className={`${styles.avatarWrapper} ${tailleClass} ${cadreClass}`}>
      <img
        src={avatarUrl}
        alt={nom}
        className={styles.avatarIcon}
        onError={(e) => { e.target.src = "/avatars/fennec-default.png"; }}
      />
    </div>
  );
}
