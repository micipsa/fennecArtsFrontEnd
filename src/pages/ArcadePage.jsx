import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "./ArcadePage.module.css";

const JEUX_ICONS_BG = {
  pong:   { bg: "linear-gradient(135deg, #e63946, #ff6b6b)", glow: "rgba(230,57,70,0.4)" },
  snake:  { bg: "linear-gradient(135deg, #2ecc71, #27ae60)", glow: "rgba(46,204,113,0.4)" },
  quiz:   { bg: "linear-gradient(135deg, #9b59b6, #8e44ad)", glow: "rgba(155,89,182,0.4)" },
  rps:    { bg: "linear-gradient(135deg, #f39c12, #e67e22)", glow: "rgba(243,156,18,0.4)" },
  typing: { bg: "linear-gradient(135deg, #3498db, #2980b9)", glow: "rgba(52,152,219,0.4)" },
  memory: { bg: "linear-gradient(135deg, #1abc9c, #16a085)", glow: "rgba(26,188,156,0.4)" },
};

export default function ArcadePage() {
  const [jeux, setJeux] = useState([]);
  const [mesStats, setMesStats] = useState([]);
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/api/arcade/jeux"),
      api.get("/api/arcade/mes-stats").catch(() => ({ data: { data: [] } })),
    ]).then(([jeuxRes, statsRes]) => {
      setJeux(jeuxRes.data.data);
      setMesStats(statsRes.data.data);
      setChargement(false);
    });
  }, []);

  const getStatPourJeu = (jeuId) => mesStats.find(s => s.jeu === jeuId);

  const creerPartie = async (jeuId) => {
    try {
      const res = await api.post("/api/arcade/creer-partie", { jeu: jeuId });
      navigate(`/arcade/${jeuId}/${res.data.data._id}`);
    } catch {
      navigate(`/arcade/${jeuId}/solo`);
    }
  };

  if (chargement) return <div className={styles.loading}>Chargement arcade...</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <h1 className={styles.titre}>🎮 ARCADE FENNEC</h1>
        <p className={styles.sousTitre}>
          Affronte un autre joueur — le vainqueur reste, le perdant laisse sa place
        </p>
      </div>

      <div className={styles.jeuxGrille}>
        {jeux.map(jeu => {
          const config = JEUX_ICONS_BG[jeu.id] || JEUX_ICONS_BG.pong;
          const stat = getStatPourJeu(jeu.id);
          return (
            <div
              key={jeu.id}
              className={styles.jeuCard}
              style={{ "--card-glow": config.glow }}
            >
              <div className={styles.jeuIconeWrapper} style={{ background: config.bg }}>
                <span className={styles.jeuIcone}>{jeu.icone}</span>
              </div>
              <h3 className={styles.jeuNom}>{jeu.nom}</h3>
              <p className={styles.jeuDesc}>{jeu.description}</p>
              <div className={styles.jeuMeta}>
                <span className={styles.jeuTag}>{jeu.temps}</span>
                <span className={styles.jeuTag}>{jeu.type}</span>
              </div>
              {stat && (
                <div className={styles.jeuStats}>
                  <span>🏆 {stat.victoires}W</span>
                  <span>💀 {stat.defaites}L</span>
                  <span>{stat.tauxVictoire}%</span>
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  className={styles.btnJouer}
                  style={{ background: config.bg, flex: 2, padding: "0.6rem" }}
                  onClick={() => navigate(`/arcade/${jeu.id}/online`)}
                >
                  🌐 EN LIGNE
                </button>
                <button
                  className={styles.btnJouer}
                  style={{ background: "rgba(255,255,255,0.1)", flex: 1, padding: "0.6rem", border: "1px solid rgba(255,255,255,0.2)" }}
                  onClick={() => navigate(`/arcade/${jeu.id}/local`)}
                >
                  👥 LOCAL
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
