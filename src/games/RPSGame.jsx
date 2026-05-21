import { useState, useCallback, useEffect } from "react";
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
  
  // Decks de cartes : 3 de chaque type (total de 9 cartes / 9 rounds)
  const [deck1, setDeck1] = useState({ pierre: 3, papier: 3, ciseaux: 3 });
  const [deck2, setDeck2] = useState({ pierre: 3, papier: 3, ciseaux: 3 });
  const maxRounds = 9;

  // Algorithme de prise de décision du Bot (Minimax simplifié par espérance de gain)
  const getSmartCPUMove = useCallback((myDeck, opponentDeck) => {
    const options = CHOIX.filter(c => myDeck[c.id] > 0);
    if (options.length === 0) return null;

    // Calcul de l'espérance de gain pour chaque choix disponible
    const scoredOptions = options.map(opt => {
      let score = 0;
      CHOIX.forEach(opp => {
        const count = opponentDeck[opp.id];
        if (count > 0) {
          if (opt.bat === opp.id) {
            score += count * 1.5; // Gain si victoire (pondéré par le nombre de cartes restantes)
          } else if (opp.bat === opt.id) {
            score -= count * 1.0; // Perte si défaite
          } else {
            score += count * 0.1; // Neutre/Égalité
          }
        }
      });
      return { id: opt.id, score };
    });

    // Sélectionner le(s) meilleur(s) coup(s)
    const maxScore = Math.max(...scoredOptions.map(o => o.score));
    const bestOptions = scoredOptions.filter(o => o.score === maxScore);
    
    // Si égalité d'espérance, choix au hasard parmi les meilleures options
    const finalChoice = bestOptions[Math.floor(Math.random() * bestOptions.length)].id;
    return finalChoice;
  }, []);

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
      if (round >= maxRounds) {
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

  // Synchronisation socket multijoueur
  useEffect(() => {
    if (isOnline) {
      socket.on("opponentAction", ({ action, data }) => {
        if (action === "choix") {
          const choiceId = data.id;
          if (isJ1) {
            setChoix2(choiceId);
            setDeck2(prev => ({ ...prev, [choiceId]: prev[choiceId] - 1 }));
          } else {
            setChoix1(choiceId);
            setDeck1(prev => ({ ...prev, [choiceId]: prev[choiceId] - 1 }));
          }
        }
      });
    }
    return () => { if (isOnline) socket.off("opponentAction"); };
  }, [isOnline, isJ1, socket]);

  // Déclenchement automatique de la résolution de round dès que les deux choix sont faits
  useEffect(() => {
    if (choix1 && choix2 && phase !== "reveal") {
      setPhase("reveal");
      resolveRound(choix1, choix2);
    }
  }, [choix1, choix2, phase, resolveRound]);

  const jouer = useCallback((choixId) => {
    // Vérification de la disponibilité de la carte
    const deckJoueur = isJ1 ? deck1 : deck2;
    if (deckJoueur[choixId] <= 0) return;

    if (isOnline) {
      if (isJ1) {
        if (choix1) return;
        setChoix1(choixId);
        setDeck1(prev => ({ ...prev, [choixId]: prev[choixId] - 1 }));
        
        // Si c'est un match contre un bot en ligne
        if (isBotMatch) {
          setTimeout(() => {
            const currentDeck2 = { ...deck2 };
            const botChoice = getSmartCPUMove(currentDeck2, { ...deck1, [choixId]: deck1[choixId] - 1 });
            setChoix2(botChoice);
            setDeck2(prev => ({ ...prev, [botChoice]: prev[botChoice] - 1 }));
          }, 600);
        }
      } else {
        if (choix2) return;
        setChoix2(choixId);
        setDeck2(prev => ({ ...prev, [choixId]: prev[choixId] - 1 }));
      }
      socket.emit("playerAction", { roomId: roomData.roomId, action: "choix", data: { id: choixId } });
    } else {
      // Mode local / Solo contre bot
      if (phase === "j1") {
        setChoix1(choixId);
        setDeck1(prev => ({ ...prev, [choixId]: prev[choixId] - 1 }));
        
        const currentDeck2 = { ...deck2 };
        const cpuChoice = getSmartCPUMove(currentDeck2, { ...deck1, [choixId]: deck1[choixId] - 1 });
        
        setChoix2(cpuChoice);
        setDeck2(prev => ({ ...prev, [cpuChoice]: prev[cpuChoice] - 1 }));
      }
    }
  }, [phase, choix1, choix2, isOnline, isJ1, socket, roomData, deck1, deck2, isBotMatch, getSmartCPUMove]);

  return (
    <div className={styles.rpsBoard}>
      {/* En-tête des scores */}
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

      {/* Affichage tactique des Decks de cartes restants */}
      <div className={styles.rpsDecks}>
        <div className={styles.rpsDeck}>
          <div className={styles.rpsDeckTitle}>Tes cartes restantes</div>
          <div className={styles.rpsDeckCards}>
            {CHOIX.map(c => {
              const count = isJ1 ? deck1[c.id] : deck2[c.id];
              return (
                <div key={c.id} className={`${styles.rpsDeckCard} ${count === 0 ? styles.empty : ""}`}>
                  <span>{c.emoji}</span>
                  <strong>x{count}</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.rpsDeck}>
          <div className={styles.rpsDeckTitle}>Cartes CPU / Adversaire</div>
          <div className={styles.rpsDeckCards}>
            {CHOIX.map(c => {
              const count = isJ1 ? deck2[c.id] : deck1[c.id];
              return (
                <div key={c.id} className={`${styles.rpsDeckCard} ${count === 0 ? styles.empty : ""}`}>
                  <span>{c.emoji}</span>
                  <strong>x{count}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statut d'attente multijoueur */}
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        {isOnline && (
          <div className={styles.onlineStatus}>
            {isJ1 ? (
              choix1 ? "✅ Choix envoyé" : "⏳ Choisis une carte..."
            ) : (
              choix2 ? "✅ Choix envoyé" : "⏳ Choisis une carte..."
            )}
            <br />
            {isJ1 ? (
              choix2 ? "✅ L'adversaire a choisi" : "⏳ L'adversaire choisit sa carte..."
            ) : (
              choix1 ? "✅ L'adversaire a choisi" : "⏳ L'adversaire choisit sa carte..."
            )}
          </div>
        )}
      </div>

      {phase === "reveal" ? (
        <div className={styles.rpsReveal}>
          <div className={`${styles.rpsRevealCard} ${resultatRound === "j1" ? styles.winningCard : ""} ${resultatRound === "j2" ? styles.losingCard : ""}`}>
            <span className={styles.rpsRevealEmoji}>{CHOIX.find(c => c.id === choix1)?.emoji}</span>
            <span>J1</span>
            {resultatRound === "j2" && (
              <div className={styles.slashOverlay}>
                <div className={styles.slashLine} />
              </div>
            )}
          </div>
          <div className={styles.rpsVs}>
            {resultatRound === null ? "🤝 Égalité" : resultatRound === "j1" ? "🏆 J1 gagne le pli !" : "🏆 J2 gagne le pli !"}
          </div>
          <div className={`${styles.rpsRevealCard} ${resultatRound === "j2" ? styles.winningCard : ""} ${resultatRound === "j1" ? styles.losingCard : ""}`}>
            <span className={styles.rpsRevealEmoji}>{CHOIX.find(c => c.id === choix2)?.emoji}</span>
            <span>{isOnline ? "J2" : "CPU"}</span>
            {resultatRound === "j1" && (
              <div className={styles.slashOverlay}>
                <div className={styles.slashLine} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.rpsChoixSection}>
          <h2 className={styles.rpsTour}>
            {isOnline ? "Joue une carte tactique !" : "À ton tour de jouer !"}
            <small>Chaque joueur a 3 exemplaires de chaque carte. Élimine celles de l'adversaire !</small>
          </h2>
          <div className={styles.rpsChoix}>
            {CHOIX.map(c => {
              const myDeck = isJ1 ? deck1 : deck2;
              const count = myDeck[c.id];
              return (
                <button 
                  key={c.id} 
                  className={styles.rpsBtn} 
                  onClick={() => jouer(c.id)}
                  disabled={count <= 0}
                >
                  <span className={styles.rpsBtnEmoji}>{c.emoji}</span>
                  <span className={styles.rpsBtnNom}>{c.nom} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
