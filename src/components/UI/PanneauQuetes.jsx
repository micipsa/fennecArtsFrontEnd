import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "./Toast";
import styles from "./PanneauQuetes.module.css";

export default function PanneauQuetes() {
  const [quetes, setQuetes] = useState({ journalieres: [], hebdomadaires: [] });
  const [chargement, setChargement] = useState(true);
  const { addToast } = useToast();

  const charger = async () => {
    try {
      const res = await api.get("/api/quetes/mes-quetes");
      setQuetes(res.data.data);
    } finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, []);

  const reclamer = async (queteId) => {
    try {
      await api.post(`/api/quetes/${queteId}/reclamer`);
      charger();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur", "error");
    }
  };

  if (chargement) return <div className={styles.loading}>Chargement quêtes...</div>;

  const renderQuete = (qu) => {
    const pourcent = Math.min(100, (qu.progression / qu.quete.objectif) * 100);
    return (
      <div key={qu._id} className={`${styles.quete} ${qu.complete ? styles.complete : ""} ${qu.reclame ? styles.reclamee : ""}`}>
        <div className={styles.header}>
          <span className={styles.nom}>{qu.quete.nom}</span>
          <span className={styles.recompense}>+{qu.quete.recompenseXP} XP · 💰 +{qu.quete.recompenseFM} FM</span>
        </div>
        <div className={styles.description}>{qu.quete.description}</div>
        <div className={styles.barreWrap}>
          <div className={styles.barre}>
            <div className={styles.barreFill} style={{ width: `${pourcent}%` }} />
          </div>
          <span className={styles.barreLabel}>{qu.progression}/{qu.quete.objectif}</span>
        </div>
        {qu.complete && !qu.reclame && (
          <button className={styles.btnReclamer} onClick={() => reclamer(qu.quete._id)}>
            🎁 Réclamer
          </button>
        )}
        {qu.reclame && <span className={styles.dejaReclamee}>✅ Récompense récupérée</span>}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h3 className={styles.titreSection}>📅 Quêtes journalières</h3>
        {quetes.journalieres.length === 0 ? (
          <p className={styles.vide}>Aucune quête disponible</p>
        ) : quetes.journalieres.map(renderQuete)}
      </section>

      <section className={styles.section}>
        <h3 className={styles.titreSection}>🗓️ Quêtes hebdomadaires</h3>
        {quetes.hebdomadaires.length === 0 ? (
          <p className={styles.vide}>Aucune quête disponible</p>
        ) : quetes.hebdomadaires.map(renderQuete)}
      </section>
    </div>
  );
}
