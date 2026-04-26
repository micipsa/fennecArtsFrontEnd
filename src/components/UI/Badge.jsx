/**
 * Badge — composant UI réutilisable pour afficher un petit label coloré.
 *
 * Utilisé partout dans l'application pour afficher des catégories, statuts, rôles, etc.
 *
 * Props :
 * - texte    : le texte à afficher dans le badge
 * - variante : la variante visuelle ("defaut", "primaire", "succes", "info", "avertissement")
 *              qui détermine la couleur via les classes CSS Module.
 *
 * Exemple d'utilisation :
 *   <Badge texte="Peinture" variante="primaire" />
 *   <Badge texte="admin" variante="info" />
 */
import styles from "./Badge.module.css";

function Badge({ texte, variante = "defaut" }) {
  // Combinaison de la classe de base `.badge` + la classe de variante (ex: `.primaire`)
  return <span className={`${styles.badge} ${styles[variante]}`}>{texte}</span>;
}

export default Badge;
