import styles from "./DashboardAccueil.module.css";

const STATS = [
  { label: "Articles publiés", valeur: 24, couleur: "bleu" },
  { label: "Événements actifs", valeur: 8, couleur: "vert" },
  { label: "Utilisateurs inscrits", valeur: 137, couleur: "orange" },
  { label: "Adhérents", valeur: 42, couleur: "rouge" },
];

function DashboardAccueil() {
  return (
    <div>
      <div className={styles.entete}>
        <h1 className={styles.titre}>Vue d'ensemble</h1>
        <p className={styles.sousTitre}>
          Bienvenue dans le panneau d'administration
        </p>
      </div>

      <div className={styles.grille}>
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`${styles.carte} ${styles[stat.couleur]}`}>
            <p className={styles.carteValeur}>{stat.valeur}</p>
            <p className={styles.carteLabel}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardAccueil;
