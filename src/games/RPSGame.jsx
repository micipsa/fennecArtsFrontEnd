import { useState, useCallback } from "react";
import styles from "./RPSGame.module.css";

const CHOIX = [
  { id: "pierre", emoji: "🪨", nom: "Pierre", bat: "ciseaux" },
  { id: "papier", emoji: "📄", nom: "Papier", bat: "pierre" },
  { id: "ciseaux", emoji: "✂️", nom: "Ciseaux", bat: "papier" },
];

export default function RPSGame({ onGameEnd, socket, roomData, isOnline }) {
  const isJ1 = isOnline ? roomData.j1.socketId === socket.id : true;
  const isBotMatch = isOnline && (roomData?.j2?.isBot || roomData?.j1?.isBot);
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

  useEffect(() => {
    if (isOnline) {
      socket.on("opponentAction", ({ action, data }) => {
        if (action === "choix") {
          if (isJ1) setChoix2(data.id); else setChoix1(data.id);
        }
      });
    }
    return () => { if (isOnline) socket.off("opponentAction"); };
  }, [isOnline, isJ1, socket]);

  // Vérification de résolution automatique en ligne
  useEffect(() => {
    if (isOnline && choix1 && choix2 && phase !== "reveal") {
      setPhase("reveal");
      resolveRound(choix1, choix2);
    }
  }, [choix1, choix2, phase, isOnline, resolveRound]);

  const jouer = useCallback((choixId) => {
    if (isOnline) {
      if (isJ1) {
        if (choix1) return; // Déjà joué
        setChoix1(choixId);
        
        // Si c'est un match contre un bot, le bot choisit immédiatement
        if (isBotMatch) {
          setTimeout(() => {
            const botChoice = CHOIX[Math.floor(Math.random() * CHOIX.length)].id;
            setChoix2(botChoice);
          }, 500);
        }
      } else {
        if (choix2) return; // Déjà joué
        setChoix2(choixId);
      }
      socket.emit("playerAction", { roomId: roomData.roomId, action: "choix", data: { id: choixId } });
    } else {
      if (phase === "j1") {
        setChoix1(choixId);
        const cpuChoice = CHOIX[Math.floor(Math.random() * CHOIX.length)].id;
        setChoix2(cpuChoice);
        setPhase("reveal");
        resolveRound(choixId, cpuChoice);
      }
    }
  }, [phase, choix1, choix2, isOnline, isJ1, socket, roomData, resolveRound]);

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
          {isOnline ? roomData.j2.pseudo : "CPU"}: <strong>{score2}</strong>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        {isOnline && (
          <div className={styles.onlineStatus}>
            {isJ1 ? (
              choix1 ? "✅ Tu as joué" : "⏳ En attente de ton choix..."
            ) : (
              choix2 ? "✅ Tu as joué" : "⏳ En attente de ton choix..."
            )}
            <br />
            {isJ1 ? (
              choix2 ? "✅ L'adversaire a joué" : "⏳ L'adversaire réfléchit..."
            ) : (
              choix1 ? "✅ L'adversaire a joué" : "⏳ L'adversaire réfléchit..."
            )}
          </div>
        )}
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
            {isOnline ? "À toi de jouer !" : (phase === "j1" ? "Joueur 1, choisis !" : "")}
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
