import { useState, useEffect, useCallback } from "react";
import styles from "./MemoryGame.module.css";

const PAIRES = [
  "🎮", "🕹️", "🎧", "💎", "🐉", "⚔️", "🏆", "🎯",
  "🦊", "🔥", "⚡", "🌟", "🎵", "🎨", "🚀", "👾",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function MemoryGame({ onGameEnd }) {
  const [cartes] = useState(() => {
    const selected = shuffle(PAIRES).slice(0, 8);
    return shuffle([...selected, ...selected].map((emoji, i) => ({ id: i, emoji, found: false })));
  });
  const [retournees, setRetournees] = useState([]);
  const [trouvees, setTrouvees] = useState([]);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [tour, setTour] = useState(1);
  const [bloquee, setBloquee] = useState(false);

  const totalPaires = 8;

  const handleClick = useCallback((index) => {
    if (bloquee || retournees.includes(index) || trouvees.includes(index)) return;

    const newRetournees = [...retournees, index];
    setRetournees(newRetournees);

    if (newRetournees.length === 2) {
      setBloquee(true);
      const [a, b] = newRetournees;
      if (cartes[a].emoji === cartes[b].emoji) {
        const newTrouvees = [...trouvees, a, b];
        setTrouvees(newTrouvees);
        if (tour === 1) setScore1(s => s + 1);
        else setScore2(s => s + 1);

        setTimeout(() => {
          setRetournees([]);
          setBloquee(false);
          if (newTrouvees.length >= cartes.length) {
            const finalS1 = tour === 1 ? score1 + 1 : score1;
            const finalS2 = tour === 2 ? score2 + 1 : score2;
            onGameEnd(finalS1, finalS2);
          }
        }, 600);
      } else {
        setTimeout(() => {
          setRetournees([]);
          setBloquee(false);
          setTour(t => t === 1 ? 2 : 1);
        }, 1000);
      }
    }
  }, [bloquee, retournees, trouvees, cartes, tour, score1, score2, onGameEnd]);

  return (
    <div className={styles.memBoard}>
      <div className={styles.memHeader}>
        <div className={styles.memPlayer} style={{ opacity: tour === 1 ? 1 : 0.4 }}>
          <span style={{ color: "#e63946" }}>●</span> J1: <strong>{score1}</strong>
        </div>
        <div className={styles.memInfo}>
          Tour J{tour} — {trouvees.length / 2}/{totalPaires} paires
        </div>
        <div className={styles.memPlayer} style={{ opacity: tour === 2 ? 1 : 0.4 }}>
          <span style={{ color: "#3498db" }}>●</span> J2: <strong>{score2}</strong>
        </div>
      </div>

      <div className={styles.memGrid}>
        {cartes.map((carte, i) => {
          const isFlipped = retournees.includes(i) || trouvees.includes(i);
          const isFound = trouvees.includes(i);
          return (
            <div
              key={carte.id}
              className={`${styles.memCard} ${isFlipped ? styles.memFlipped : ""} ${isFound ? styles.memFound : ""}`}
              onClick={() => handleClick(i)}
            >
              <div className={styles.memCardInner}>
                <div className={styles.memCardFront}>
                  <span>🎴</span>
                </div>
                <div className={styles.memCardBack}>
                  <span>{carte.emoji}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
