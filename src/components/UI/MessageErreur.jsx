import styles from "./MessageErreur.module.css";

function MessageErreur({ message = "Une erreur est survenue.", onReessayer }) {
  return (
    <div className={styles.conteneur}>
      <div className={styles.icone}>✕</div>
      <p className={styles.message}>{message}</p>
      {onReessayer && (
        <button className={styles.bouton} onClick={onReessayer}>
          Réessayer
        </button>
      )}
    </div>
  );
}

export default MessageErreur;
