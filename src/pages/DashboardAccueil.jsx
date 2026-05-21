import { useState, useEffect } from "react";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import styles from "./DashboardAccueil.module.css";

function DashboardAccueil() {
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const [resArticles, resEvents, resUsers, resTournois] =
          await Promise.all([
            api.get("/api/articles?limit=1"),
            api.get("/api/events?limit=1"),
            api.get("/api/users"),
            api.get("/api/tournaments?limit=1"),
          ]);

        setStats({
          articles: resArticles.data.total ?? 0,
          events: resEvents.data.total ?? resEvents.data.count ?? 0,
          users: resUsers.data.total ?? resUsers.data.data?.length ?? 0,
          tournois: resTournois.data.total ?? resTournois.data.count ?? 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  if (chargement) return <Spinner />;

  const CARDS = [
    {
      label: "Articles publiés",
      valeur: stats?.articles ?? 0,
      couleur: "bleu",
      icone: "📝",
    },
    {
      label: "Événements",
      valeur: stats?.events ?? 0,
      couleur: "vert",
      icone: "🎮",
    },
    {
      label: "Utilisateurs inscrits",
      valeur: stats?.users ?? 0,
      couleur: "orange",
      icone: "👥",
    },
    {
      label: "Tournois",
      valeur: stats?.tournois ?? 0,
      couleur: "rouge",
      icone: "🏆",
    },
  ];

  return (
    <div>
      <div className={styles.entete}>
        <h1 className={styles.titre}>Vue d'ensemble</h1>
        <p className={styles.sousTitre}>Statistiques en temps réel</p>
      </div>

      <div className={styles.grille}>
        {CARDS.map((card) => (
          <div
            key={card.label}
            className={`${styles.carte} ${styles[card.couleur]}`}>
            <span className={styles.carteIcone}>{card.icone}</span>
            <p className={styles.carteValeur}>{card.valeur}</p>
            <p className={styles.carteLabel}>{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardAccueil;
