/**
 * Spinner — indicateur de chargement visuel (animation de rotation).
 *
 * Composant purement présentationnel, sans props ni state.
 * Le style (animation CSS @keyframes `tourner`) est défini dans index.css
 * car les classes `.spinner-conteneur` et `.spinner` sont globales.
 *
 * Utilisé dans toute l'application quand des données sont en cours de chargement.
 */
function Spinner() {
  return (
    <div className="spinner-conteneur">
      <div className="spinner" />
    </div>
  );
}

export default Spinner;
