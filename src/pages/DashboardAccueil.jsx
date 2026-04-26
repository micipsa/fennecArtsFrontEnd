/**
 * DashboardAccueil — page d'accueil du panneau d'administration.
 *
 * Affiche une vue d'ensemble avec des cartes statistiques.
 *
 * ⚠️  Note : les valeurs affichées sont actuellement en dur (hardcoded).
 *     Dans une version future, elles devraient être chargées dynamiquement
 *     depuis l'API (ex: GET /api/stats).
 *
 * Structure :
 * - En-tête : titre "Vue d'ensemble" + sous-titre
 * - Grille de 4 cartes colorées avec icône, valeur et label :
 *   - Articles publiés (bleu)
 *   - Événements actifs (vert)
 *   - Utilisateurs inscrits (orange)
 *   - Adhérents (rouge)
 */
import styles from "./DashboardAccueil.module.css";

// Données statiques des cartes de statistiques
// Chaque objet contient : label, valeur, couleur (classe CSS), icône (emoji)
const STATS = [
  { label: "Articles publiés", valeur: 24, couleur: "bleu", icone: "📝" },
  { label: "Événements actifs", valeur: 8, couleur: "vert", icone: "🎮" },
  {
    label: "Utilisateurs inscrits",
    valeur: 137,
    couleur: "orange",
    icone: "👥",
  },
  { label: "Adhérents", valeur: 42, couleur: "rouge", icone: "🏆" },
];

function DashboardAccueil() {
  return (
    <div>
      {/* ── En-tête ── */}
      <div className={styles.entete}>
        <h1 className={styles.titre}>Vue d'ensemble</h1>
        <p className={styles.sousTitre}>
          Bienvenue dans le panneau d'administration
        </p>
      </div>

      {/* ── Grille de cartes statistiques ── */}
      <div className={styles.grille}>
        {STATS.map((stat) => (
          <div
            key={stat.label}
            // La classe de couleur est ajoutée dynamiquement (ex: styles.bleu)
            className={`${styles.carte} ${styles[stat.couleur]}`}>
            <span className={styles.carteIcone}>{stat.icone}</span>
            <p className={styles.carteValeur}>{stat.valeur}</p>
            <p className={styles.carteLabel}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardAccueil;
