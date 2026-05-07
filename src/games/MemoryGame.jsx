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
  const [essais, setEssais] = useState(0);
  const [bloquee, setBloquee] = useState(false);

  const totalPaires = 8;

  const handleClick = useCallback((index) => {
    if (bloquee || retournees.includes(index) || trouvees.includes(index)) return;

    const newRetournees = [...retournees, index];
    setRetournees(newRetournees);

    if (newRetournees.length === 2) {
      setBloquee(true);
      setEssais(e => e + 1);
      const [a, b] = newRetournees;
      if (cartes[a].emoji === cartes[b].emoji) {
        const newTrouvees = [...trouvees, a, b];
        setTrouvees(newTrouvees);

        setTimeout(() => {
          setRetournees([]);
          setBloquee(false);
          if (newTrouvees.length >= cartes.length) {
            // Calcul du score : max 1000, diminue de 50 par erreur (essais > 8)
            const nbEssaisFinal = essais + 1;
            let finalScore = 1000 - (nbEssaisFinal - totalPaires) * 50;
            if (finalScore < 100) finalScore = 100;
            onGameEnd(finalScore, 0);
          }
        }, 600);
      } else {
        setTimeout(() => {
          setRetournees([]);
          setBloquee(false);
        }, 1000);
      }
    }
  }, [bloquee, retournees, trouvees, cartes, essais, onGameEnd]);

  return (
    <div className={styles.memBoard}>
      <div className={styles.memHeader}>
        <div className={styles.memPlayer}>
          <span style={{ color: "#e63946" }}>●</span> MOI
        </div>
        <div className={styles.memInfo}>
          SOLO — {trouvees.length / 2}/{totalPaires} paires | {essais} essai(s)
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
