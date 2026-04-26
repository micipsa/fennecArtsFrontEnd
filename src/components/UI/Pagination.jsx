import styles from "./Pagination.module.css";

function Pagination({ page, totalPages, onPagePrecedente, onPageSuivante }) {
  if (totalPages <= 1) return null;

  return (
    <div className={styles.conteneur}>
      <button
        className={styles.bouton}
        onClick={onPagePrecedente}
        disabled={page === 1}>
        ← Précédente
      </button>

      <span className={styles.info}>
        Page {page} sur {totalPages}
      </span>

      <button
        className={styles.bouton}
        onClick={onPageSuivante}
        disabled={page === totalPages}>
        Suivante →
      </button>
    </div>
  );
}

export default Pagination;
