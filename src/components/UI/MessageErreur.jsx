/**
 * MessageErreur — composant UI pour afficher un message d'erreur stylisé.
 *
 * Utilisé quand une requête API échoue ou quand une page ne peut pas charger ses données.
 *
 * Props :
 * - message     : le texte de l'erreur à afficher (défaut : "Une erreur est survenue.")
 * - onReessayer : callback optionnel. Si fourni, un bouton "Réessayer" apparaît
 *                 et appelle cette fonction au clic (pour relancer le chargement).
 */
import styles from "./MessageErreur.module.css";

function MessageErreur({ message = "Une erreur est survenue.", onReessayer }) {
  return (
    <div className={styles.conteneur}>
      {/* Icône d'erreur */}
      <div className={styles.icone}>✕</div>

      {/* Message d'erreur */}
      <p className={styles.message}>{message}</p>

      {/* Bouton "Réessayer" affiché uniquement si le callback est fourni */}
      {onReessayer && (
        <button className={styles.bouton} onClick={onReessayer}>
          Réessayer
        </button>
      )}
    </div>
  );
}

export default MessageErreur;
