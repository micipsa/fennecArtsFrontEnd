import { useState, useCallback } from "react";
import styles from "./RPSGame.module.css";

const CHOIX = [
  { id: "pierre", emoji: "🪨", nom: "Pierre", bat: "ciseaux" },
  { id: "papier", emoji: "📄", nom: "Papier", bat: "pierre" },
  { id: "ciseaux", emoji: "✂️", nom: "Ciseaux", bat: "papier" },
];

export default function RPSGame({ onGameEnd, isOnline }) {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [round, setRound] = useState(1);
  const [choix1, setChoix1] = useState(null);
  const [choix2, setChoix2] = useState(null);
  const [phase, setPhase] = useState("j1");
  const [resultatRound, setResultatRound] = useState(null);
  const maxRounds = 5;

  const resolveRound = useCallback((c1Id, c2Id) => {
    const c1 = CHOIX.find(c => c.id === c1Id);
    const c2 = CHOIX.find(c => c.id === c2Id);
    let gagnant = null;
    if (c1.bat === c2.id) gagnant = "j1";
    else if (c2.bat === c1.id) gagnant = "j2";

    let newS1 = score1, newS2 = score2;
    if (gagnant === "j1") { newS1++; setScore1(newS1); }
    if (gagnant === "j2") { newS2++; setScore2(newS2); }
    setResultatRound(gagnant);

    setTimeout(() => {
      if (round >= maxRounds || newS1 >= 3 || newS2 >= 3) {
        onGameEnd(newS1, newS2);
      } else {
        setRound(r => r + 1);
        setChoix1(null);
        setChoix2(null);
        setResultatRound(null);
        setPhase("j1");
      }
    }, 2000);
  }, [score1, score2, round, maxRounds, onGameEnd]);

  const jouer = useCallback((choixId) => {
    if (phase === "j1") {
      setChoix1(choixId);
      if (!isOnline) {
        const cpuChoice = CHOIX[Math.floor(Math.random() * CHOIX.length)].id;
        setChoix2(cpuChoice);
        setPhase("reveal");
        resolveRound(choixId, cpuChoice);
      } else {
        setPhase("j2");
      }
    } else if (phase === "j2" && isOnline) {
      setChoix2(choixId);
      setPhase("reveal");
      resolveRound(choix1, choixId);
    }
  }, [phase, choix1, isOnline, resolveRound]);

  const joueurActif = phase === "j1" ? "Joueur 1" : phase === "j2" ? "Joueur 2" : "";

  return (
    <div className={styles.rpsBoard}>
      <div className={styles.rpsHeader}>
        <div className={styles.rpsPlayer}>
          <span className={styles.rpsDot} style={{ background: "#e63946" }} />
          J1: <strong>{score1}</strong>
        </div>
        <div className={styles.rpsRound}>Round {round}/{maxRounds}</div>
        <div className={styles.rpsPlayer}>
          <span className={styles.rpsDot} style={{ background: "#3498db" }} />
          {isOnline ? "J2" : "CPU"}: <strong>{score2}</strong>
        </div>
      </div>

      {phase === "reveal" ? (
        <div className={styles.rpsReveal}>
          <div className={styles.rpsRevealCard}>
            <span className={styles.rpsRevealEmoji}>{CHOIX.find(c => c.id === choix1)?.emoji}</span>
            <span>J1</span>
          </div>
          <div className={styles.rpsVs}>
            {resultatRound === null ? "🤝 Égalité" : resultatRound === "j1" ? "🏆 J1 gagne !" : "🏆 J2 gagne !"}
          </div>
          <div className={styles.rpsRevealCard}>
            <span className={styles.rpsRevealEmoji}>{CHOIX.find(c => c.id === choix2)?.emoji}</span>
            <span>{isOnline ? "J2" : "CPU"}</span>
          </div>
        </div>
      ) : (
        <div className={styles.rpsChoixSection}>
          <h2 className={styles.rpsTour}>
            {joueurActif}, choisis ! {phase === "j2" && <small>(J1 ne regarde pas 👀)</small>}
          </h2>
          <div className={styles.rpsChoix}>
            {CHOIX.map(c => (
              <button key={c.id} className={styles.rpsBtn} onClick={() => jouer(c.id)}>
                <span className={styles.rpsBtnEmoji}>{c.emoji}</span>
                <span className={styles.rpsBtnNom}>{c.nom}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
