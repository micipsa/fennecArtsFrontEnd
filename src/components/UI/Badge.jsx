import styles from "./Badge.module.css";

function Badge({ texte, variante = "defaut" }) {
  return <span className={`${styles.badge} ${styles[variante]}`}>{texte}</span>;
}

export default Badge;
