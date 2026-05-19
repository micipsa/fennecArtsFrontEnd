import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/UI/Toast";
import styles from "./LootboxPage.module.css";

const COULEURS_RARETE = {
  commun: { couleur: "#b0b0b0", label: "Commun", glow: "0 0 20px rgba(176,176,176,0.4)" },
  rare: { couleur: "#3498db", label: "Rare", glow: "0 0 30px rgba(52,152,219,0.6)" },
  epique: { couleur: "#9b59b6", label: "Épique", glow: "0 0 40px rgba(155,89,182,0.7)" },
  legendaire: { couleur: "#f39c12", label: "Légendaire", glow: "0 0 60px rgba(243,156,18,0.8)" },
};

export default function LootboxPage() {
  const { utilisateur, setUtilisateur } = useAuth();
  const { addToast } = useToast();
  const [phase, setPhase] = useState("idle"); // idle | shaking | opening | reveal
  const [recompense, setRecompense] = useState(null);
  const [soldeFM, setSoldeFM] = useState(utilisateur?.fm || 0);
  const PRIX = 100;

  const ouvrir = async () => {
    if (!utilisateur) return addToast("Connecte-toi d'abord !", "error");
    if (soldeFM < PRIX) return addToast("Fonds FM insuffisants !", "error");

    setPhase("shaking");
    setRecompense(null);

    try {
      const res = await api.post("/api/lootbox/ouvrir");
      const data = res.data.data;

      // Attendre la fin du shake (1.5s) puis ouvrir
      setTimeout(() => {
        setPhase("opening");
        // Attendre l'animation d'ouverture (1s) puis révéler
        setTimeout(() => {
          setRecompense(data.recompense);
          setSoldeFM(data.nouveauSoldeFM);
          setUtilisateur(prev => ({ ...prev, fm: data.nouveauSoldeFM }));
          setPhase("reveal");
        }, 1000);
      }, 1500);
    } catch (err) {
      setPhase("idle");
      addToast(err.response?.data?.message || "Erreur lors de l'ouverture", "error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setRecompense(null);
  };

  const rareteInfo = recompense ? COULEURS_RARETE[recompense.rarete] || COULEURS_RARETE.commun : null;

  return (
    <div className={styles.pageWrapper}>
      {/* Particules de fond */}
      <div className={styles.particules} />
      <div className={styles.particules2} />

      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>LOOTBOX</h1>
        <p className={styles.pageSousTitre}>Tente ta chance, guerrier</p>
      </div>

      <div className={styles.container}>
        {/* Solde */}
        <div className={styles.soldeBar}>
          <span>Ton solde</span>
          <strong>💰 {soldeFM} FM</strong>
          <span className={styles.coutBox}>Coût : {PRIX} FM / box</span>
        </div>

        {/* Zone du coffre */}
        <div className={styles.coffreZone}>
          {phase === "idle" && (
            <div className={styles.coffre} onClick={ouvrir}>
              <div className={styles.coffreIcone}>🎁</div>
              <div className={styles.coffreTexte}>Cliquer pour ouvrir</div>
              <div className={styles.coffrePrix}>💰 {PRIX} FM</div>
            </div>
          )}

          {phase === "shaking" && (
            <div className={`${styles.coffre} ${styles.coffreShake}`}>
              <div className={styles.coffreIcone}>🎁</div>
              <div className={styles.coffreTexte}>Ouverture...</div>
            </div>
          )}

          {phase === "opening" && (
            <div className={`${styles.coffre} ${styles.coffreOpen}`}>
              <div className={styles.explosion} />
              <div className={styles.coffreIcone}>✨</div>
            </div>
          )}

          {phase === "reveal" && recompense && (
            <div
              className={styles.revealCard}
              style={{
                "--rarete-couleur": rareteInfo.couleur,
                "--rarete-glow": rareteInfo.glow,
              }}
            >
              <div className={styles.revealRayons} />
              <span className={styles.revealRarete} style={{ color: rareteInfo.couleur }}>
                ✦ {rareteInfo.label.toUpperCase()}
              </span>
              <div className={styles.revealIcone}>{recompense.icone}</div>
              <h2 className={styles.revealLabel} style={{ color: rareteInfo.couleur }}>
                {recompense.label}
              </h2>
              <p className={styles.revealDesc}>{recompense.description}</p>
              <button className={styles.btnRejouer} onClick={reset}>
                🎁 Ouvrir une autre ({PRIX} FM)
              </button>
              <Link to="/store" className={styles.btnRetour}>
                ← Retour au Store
              </Link>
            </div>
          )}
        </div>

        {/* Taux de drop */}
        <div className={styles.tauxSection}>
          <h3>Taux de drop</h3>
          <div className={styles.tauxGrille}>
            <div className={styles.tauxItem} style={{ borderColor: "#b0b0b0" }}>
              <span style={{ color: "#b0b0b0" }}>Commun</span>
              <strong>50%</strong>
            </div>
            <div className={styles.tauxItem} style={{ borderColor: "#3498db" }}>
              <span style={{ color: "#3498db" }}>Rare</span>
              <strong>30%</strong>
            </div>
            <div className={styles.tauxItem} style={{ borderColor: "#9b59b6" }}>
              <span style={{ color: "#9b59b6" }}>Épique</span>
              <strong>15%</strong>
            </div>
            <div className={styles.tauxItem} style={{ borderColor: "#f39c12" }}>
              <span style={{ color: "#f39c12" }}>Légendaire</span>
              <strong>5%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
