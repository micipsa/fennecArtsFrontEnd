/**
 * Pagination — composant UI de navigation entre les pages de résultats.
 *
 * Affiche : bouton "Précédente" | info "Page X sur Y" | bouton "Suivante"
 * Se masque automatiquement s'il n'y a qu'une seule page (totalPages <= 1).
 *
 * Props :
 * - page             : numéro de la page courante
 * - totalPages       : nombre total de pages
 * - onPagePrecedente : callback déclenché au clic sur "Précédente"
 * - onPageSuivante   : callback déclenché au clic sur "Suivante"
 *
 * Les boutons sont automatiquement désactivés (disabled) quand on est
 * sur la première ou dernière page.
 */
import styles from "./Pagination.module.css";

function Pagination({ page, totalPages, onPagePrecedente, onPageSuivante }) {
  // Ne rien afficher s'il n'y a qu'une seule page
  if (totalPages <= 1) return null;

  return (
    <div className={styles.conteneur}>
      {/* Bouton page précédente — désactivé si page === 1 */}
      <button
        className={styles.bouton}
        onClick={onPagePrecedente}
        disabled={page === 1}>
        ← Précédente
      </button>

      {/* Indicateur de la page courante */}
      <span className={styles.info}>
        Page {page} sur {totalPages}
      </span>

      {/* Bouton page suivante — désactivé si on est sur la dernière page */}
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
