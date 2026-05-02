import { Link } from "react-router-dom";
import styles from "./EnConstruction.module.css";

export default function EnConstruction({ titre = "Page en construction" }) {
  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.icon}>🚧</div>
        <h1 className={styles.titre}>{titre}</h1>
        <p className={styles.texte}>
          Cette fonctionnalité est en cours de développement et sera bientôt disponible !
        </p>
        <Link to="/" className={styles.btn}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
