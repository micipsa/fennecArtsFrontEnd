/**
 * FortunePage — Page de la Roue de la Fortune.
 * Spin gratuit quotidien avec animation de rotation CSS.
 */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../components/UI/Toast";
import styles from "./FortunePage.module.css";

// 12 segments fixes pour l'affichage de la roue
const SEGMENTS_DISPLAY = [
  { label: "+10 XP",  couleur: "#2c3e50", icone: "⚡" },
  { label: "+50 FM",  couleur: "#d35400", icone: "💎" },
  { label: "+20 XP",  couleur: "#34495e", icone: "⚡" },
  { label: "+75 XP",  couleur: "#2980b9", icone: "✨" },
  { label: "+10 FM",  couleur: "#f39c12", icone: "💰" },
  { label: "+30 XP",  couleur: "#7f8c8d", icone: "⚡" },
  { label: "🎨 Couleur",couleur: "#e74c3c", icone: "🎨" },
  { label: "+50 XP",  couleur: "#3498db", icone: "✨" },
  { label: "+25 FM",  couleur: "#e67e22", icone: "💰" },
  { label: "+100 XP", couleur: "#9b59b6", icone: "🌟" },
  { label: "+200 XP", couleur: "#8e44ad", icone: "💫" },
  { label: "💠 Cadre", couleur: "#00ff88", icone: "💠" },
];

const SEGMENT_COUNT = SEGMENTS_DISPLAY.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

export default function FortunePage() {
  const { utilisateur } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [resultat, setResultat] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (utilisateur) {
      api.get("/api/fortune/status")
        .then(res => setDisponible(res.data.data.disponible))
        .catch(() => {});
    }
  }, [utilisateur]);

  const handleSpin = async () => {
    if (spinning || !disponible) return;
    setSpinning(true);
    setShowResult(false);
    setResultat(null);

    try {
      const res = await api.post("/api/fortune/spin");
      const { recompense, slotIndex } = res.data.data;

      // Calculer l'angle de destination
      // On mappe slotIndex aux 12 segments visuels
      const segmentDestination = slotIndex % SEGMENT_COUNT;
      const angleSegment = segmentDestination * SEGMENT_ANGLE;
      // 5 tours complets + arrêt au bon segment
      const totalRotation = rotation + 1800 + (360 - angleSegment) + (SEGMENT_ANGLE / 2);
      
      setRotation(totalRotation);
      setResultat(recompense);

      // Attendre la fin de l'animation (4s)
      setTimeout(() => {
        setShowResult(true);
        setDisponible(false);
        setSpinning(false);
      }, 4500);

    } catch (err) {
      addToast(err.response?.data?.message || "Erreur lors du spin", "error");
      setSpinning(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>ROUE DE LA FORTUNE</h1>
        <p className={styles.pageSousTitre}>Tente ta chance gratuitement, 1 fois par jour !</p>
      </div>

      <div className={styles.container}>
        {/* La Roue */}
        <div className={styles.wheelSection}>
          <div className={styles.wheelContainer}>
            {/* Indicateur/flèche */}
            <div className={styles.arrow}>▼</div>
            
            {/* La roue SVG */}
            <svg
              viewBox="0 0 400 400"
              className={styles.wheel}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              {SEGMENTS_DISPLAY.map((seg, i) => {
                const startAngle = i * SEGMENT_ANGLE;
                const endAngle = (i + 1) * SEGMENT_ANGLE;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = 200 + 190 * Math.cos(startRad);
                const y1 = 200 + 190 * Math.sin(startRad);
                const x2 = 200 + 190 * Math.cos(endRad);
                const y2 = 200 + 190 * Math.sin(endRad);
                const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180;
                const textX = 200 + 130 * Math.cos(midAngle);
                const textY = 200 + 130 * Math.sin(midAngle);
                const textRotation = (startAngle + endAngle) / 2;

                return (
                  <g key={i}>
                    <path
                      d={`M200,200 L${x1},${y1} A190,190 0 0,1 ${x2},${y2} Z`}
                      fill={seg.couleur}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize="10"
                      fontWeight="700"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    >
                      {seg.icone} {seg.label}
                    </text>
                  </g>
                );
              })}
              {/* Centre */}
              <circle cx="200" cy="200" r="30" fill="#1a1a2e" stroke="rgba(255,215,0,0.5)" strokeWidth="3" />
              <text x="200" y="200" textAnchor="middle" dominantBaseline="middle" fill="#ffd700" fontSize="16" fontWeight="900">🎡</text>
            </svg>
          </div>

          {/* Bouton Spin */}
          <button
            className={`${styles.btnSpin} ${spinning ? styles.btnSpinning : ""} ${!disponible ? styles.btnDisabled : ""}`}
            onClick={handleSpin}
            disabled={spinning || !disponible || !utilisateur}
          >
            {!utilisateur ? "Connecte-toi pour jouer" :
             !disponible ? "Reviens demain ! ⏰" :
             spinning ? "La roue tourne..." :
             "🎡 TOURNER LA ROUE"}
          </button>

          {/* Bouton retour */}
          <button className={styles.btnBack} onClick={() => navigate("/store")}>
            ← Retour à la boutique
          </button>
        </div>

        {/* Résultat */}
        {showResult && resultat && createPortal(
          <div className={styles.resultOverlay} onClick={() => setShowResult(false)}>
            <div className={styles.resultCard} onClick={e => e.stopPropagation()}>
              <div className={styles.resultIcone}>{resultat.icone}</div>
              <h2 className={styles.resultTitre}>Félicitations !</h2>
              <div className={styles.resultRecompense} style={{ color: resultat.couleur }}>
                {resultat.label}
              </div>
              <p className={styles.resultDesc}>
                {resultat.type === "xp" && "De l'expérience pour progresser !"}
                {resultat.type === "fm" && "Des Fennec Money en plus !"}
                {resultat.type === "cosmetic" && "Un objet cosmétique rare ! 🎉"}
              </p>
              <button className={styles.resultBtn} onClick={() => setShowResult(false)}>
                Super ! 🎮
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
