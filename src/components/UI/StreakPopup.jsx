/**
 * StreakPopup — Popup animé qui s'affiche au premier chargement du jour
 * pour célébrer le streak de connexion et montrer les FM gagnés.
 */
import { useState, useEffect } from "react";
import styles from "./StreakPopup.module.css";

const PALIERS = [
  { jour: 1, label: "Jour 1", fm: 10 },
  { jour: 3, label: "3 jours", fm: 30 },
  { jour: 7, label: "1 semaine", fm: 100 },
  { jour: 14, label: "2 semaines", fm: 200 },
  { jour: 30, label: "1 mois", fm: 500 },
];

export default function StreakPopup({ streakData, onClose }) {
  const [phase, setPhase] = useState("enter"); // enter → show → exit
  const [compteurFm, setCompteurFm] = useState(0);

  useEffect(() => {
    // Animation d'entrée
    const t1 = setTimeout(() => setPhase("show"), 100);
    return () => clearTimeout(t1);
  }, []);

  // Compteur animé pour les FM gagnés
  useEffect(() => {
    if (phase !== "show") return;
    const target = streakData.fmGagne;
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCompteurFm(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [phase, streakData.fmGagne]);

  const handleClose = () => {
    setPhase("exit");
    setTimeout(onClose, 400);
  };

  // Trouver le prochain palier
  const prochainPalier = PALIERS.find(p => p.jour > streakData.streak);
  const streakPercent = prochainPalier
    ? Math.min((streakData.streak / prochainPalier.jour) * 100, 100)
    : 100;

  return (
    <div className={`${styles.overlay} ${styles[phase]}`} onClick={handleClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        {/* Particules décoratives */}
        <div className={styles.particules}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={styles.particule} style={{ "--i": i }} />
          ))}
        </div>

        {/* Flamme animée */}
        <div className={styles.flammeWrapper}>
          <div className={styles.flamme}>
            <span className={styles.flammeEmoji}>🔥</span>
          </div>
          <div className={styles.streakNombre}>{streakData.streak}</div>
        </div>

        {/* Titre */}
        <h2 className={styles.titre}>
          {streakData.streak === 1 ? "Première connexion !" : `${streakData.streak} jours de streak !`}
        </h2>
        <p className={styles.label}>{streakData.label}</p>

        {/* Récompense FM */}
        <div className={styles.recompense}>
          <span className={styles.fmIcone}>💰</span>
          <span className={styles.fmMontant}>+{compteurFm} FM</span>
        </div>

        {/* Barre de progression vers le prochain palier */}
        {prochainPalier && (
          <div className={styles.progressSection}>
            <div className={styles.progressLabel}>
              <span>Prochain palier : {prochainPalier.label}</span>
              <span className={styles.progressReward}>+{prochainPalier.fm} FM</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${streakPercent}%` }}
              />
            </div>
            <p className={styles.progressDays}>
              Encore {prochainPalier.jour - streakData.streak} jour{prochainPalier.jour - streakData.streak > 1 ? "s" : ""} !
            </p>
          </div>
        )}

        {/* Calendrier streak (7 derniers jours) */}
        <div className={styles.calendrier}>
          {Array.from({ length: 7 }).map((_, i) => {
            const jourNum = i + 1;
            const isActive = jourNum <= (streakData.streak % 7 || 7);
            const isToday = jourNum === (streakData.streak % 7 || 7);
            return (
              <div
                key={i}
                className={`${styles.jourCase} ${isActive ? styles.jourActif : ""} ${isToday ? styles.jourAujourdhui : ""}`}
              >
                <span className={styles.jourLabel}>J{jourNum}</span>
                {isActive && <span className={styles.jourCheck}>✓</span>}
              </div>
            );
          })}
        </div>

        {/* Bouton fermer */}
        <button className={styles.btnFermer} onClick={handleClose}>
          Continuer 🎮
        </button>
      </div>
    </div>
  );
}
