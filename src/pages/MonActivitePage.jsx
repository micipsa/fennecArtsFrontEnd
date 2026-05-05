import { useState, useEffect } from "react";
import api from "../services/api";
import { calculerRang } from "../utils/rangs";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/UI/Spinner";
import styles from "./MonActivitePage.module.css";

const TYPE_CONFIG = {
  mission: { icon: "📋", label: "Missions", color: "#38b2ac" },
  article: { icon: "📰", label: "Articles", color: "#4299e1" },
  commentaire: { icon: "💬", label: "Commentaires", color: "#805ad5" },
  evenement: { icon: "📅", label: "Événements", color: "#e53e3e" },
  tournoi: { icon: "⚔️", label: "Tournois", color: "#d69e2e" },
  bonus: { icon: "🎁", label: "Bonus", color: "#48bb78" },
};

export default function MonActivitePage() {
  const { utilisateur } = useAuth();
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get("/api/users/mon-activite")
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <Spinner />;
  if (!data) return <div className="container"><p>Impossible de charger l'activité.</p></div>;

  const { stats, historique, parType, graphique } = data;
  const rang = calculerRang(stats.xpTotal);
  const maxXpJour = Math.max(...graphique.map(j => j.xp), 1);

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.titre}>Mon Activité</h1>
        <p className={styles.sousTitre}>Résumé de ta progression sur Fennec's Clan</p>

        {/* ── Stats Cards ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcone}>⚡</span>
            <div className={styles.statInfo}>
              <span className={styles.statValeur}>{stats.xpSemaine}</span>
              <span className={styles.statLabel}>XP cette semaine</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcone}>💰</span>
            <div className={styles.statInfo}>
              <span className={styles.statValeur}>{stats.fmSemaine}</span>
              <span className={styles.statLabel}>FM cette semaine</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcone}>🎯</span>
            <div className={styles.statInfo}>
              <span className={styles.statValeur}>{stats.actionsSemaine}</span>
              <span className={styles.statLabel}>Actions cette semaine</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcone} style={{ color: rang.couleur }}>🏅</span>
            <div className={styles.statInfo}>
              <span className={styles.statValeur} style={{ color: rang.couleur }}>{rang.nom}</span>
              <span className={styles.statLabel}>{stats.xpTotal} XP total</span>
            </div>
          </div>
        </div>

        {/* ── Compteurs globaux ── */}
        <div className={styles.compteurs}>
          <div className={styles.compteur}>
            <span className={styles.compteurVal}>{stats.nbCommentaires}</span>
            <span className={styles.compteurLabel}>💬 Commentaires</span>
          </div>
          <div className={styles.compteur}>
            <span className={styles.compteurVal}>{stats.nbQuizz}</span>
            <span className={styles.compteurLabel}>🎮 Quiz joués</span>
          </div>
          <div className={styles.compteur}>
            <span className={styles.compteurVal}>{stats.nbTournois}</span>
            <span className={styles.compteurLabel}>⚔️ Tournois</span>
          </div>
          <div className={styles.compteur}>
            <span className={styles.compteurVal}>{stats.fmTotal}</span>
            <span className={styles.compteurLabel}>💰 FM total</span>
          </div>
        </div>

        {/* ── Graphique d'activité (30 jours) ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitre}>📊 Activité des 30 derniers jours</h3>
          <div className={styles.graphique}>
            {graphique.map((jour, i) => {
              const height = jour.xp > 0 ? Math.max((jour.xp / maxXpJour) * 100, 4) : 0;
              const isToday = i === graphique.length - 1;
              return (
                <div key={jour.date} className={styles.graphBarre} title={`${jour.date}: ${jour.xp} XP, ${jour.actions} actions`}>
                  <div
                    className={`${styles.barre} ${isToday ? styles.barreAujourdhui : ""}`}
                    style={{ height: `${height}%` }}
                  />
                  {i % 7 === 0 && (
                    <span className={styles.graphLabel}>
                      {new Date(jour.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Répartition par type ── */}
        {Object.keys(parType).length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitre}>📈 Répartition par type</h3>
            <div className={styles.typesGrille}>
              {Object.entries(parType).map(([type, data]) => {
                const cfg = TYPE_CONFIG[type] || { icon: "📌", label: type, color: "#666" };
                return (
                  <div key={type} className={styles.typeCard}>
                    <div className={styles.typeIcone} style={{ background: `${cfg.color}22`, color: cfg.color }}>
                      {cfg.icon}
                    </div>
                    <div className={styles.typeInfo}>
                      <span className={styles.typeNom}>{cfg.label}</span>
                      <span className={styles.typeDetail}>{data.count} actions · +{data.xp} XP · +{data.fm} FM</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitre}>🕐 Historique récent</h3>
          {historique.length === 0 ? (
            <p className={styles.vide}>Aucune activité enregistrée pour le moment.</p>
          ) : (
            <div className={styles.timeline}>
              {historique.map((h) => {
                const cfg = TYPE_CONFIG[h.type] || { icon: "📌", color: "#666" };
                return (
                  <div key={h._id} className={styles.timelineItem}>
                    <div className={styles.timelineDot} style={{ background: cfg.color }} />
                    <div className={styles.timelineCorps}>
                      <div className={styles.timelineEntete}>
                        <span className={styles.timelineIcone}>{cfg.icon}</span>
                        <span className={styles.timelineRaison}>{h.raison}</span>
                        <span className={styles.timelineDate}>{formatDate(h.createdAt)}</span>
                      </div>
                      <div className={styles.timelineGains}>
                        {h.points > 0 && <span className={styles.gainXP}>+{h.points} XP</span>}
                        {h.fm > 0 && <span className={styles.gainFM}>+{h.fm} FM</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
