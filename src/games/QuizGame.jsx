import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./QuizGame.module.css";

import quizData from "../data/quizQuestions.json";

const QUESTIONS = quizData.map(q => ({
  q: q.question,
  opts: q.reponses,
  correct: q.bonneReponseIndex
}));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function QuizGame({ onGameEnd, isOnline, socket, roomData, isHost, userId }) {
  const navigate = useNavigate();
  const isBotMatch = isOnline && (roomData?.j2?.isBot || roomData?.j1?.isBot);
  // ─── ETAT LOCAL ───
  // Si on est en ligne et Client (isHost = false), on lit l'état envoyé par l'Hôte.
  // Si on est Solo ou Hôte, on gère l'état localement.
  const roomId = roomData?.roomId;
  
  const [gameState, setGameState] = useState({
    questions: isHost || !isOnline ? shuffle(QUESTIONS).slice(0, 10) : [],
    indexQ: 0,
    score1: 0,
    score2: 0,
    timer: 10,
    feedback: null, // { correctIndex, j1Choice, j2Choice }
    j1HasAnswered: false,
    j2HasAnswered: false,
    isFinished: false,
  });

  const [hasPlayedToday, setHasPlayedToday] = useState(false);

  useEffect(() => {
    if (!isOnline && userId) {
      const storageKey = `lastLocalQuizDate_${userId}`;
      const lastPlayed = localStorage.getItem(storageKey);
      const today = new Date().toDateString();
      if (lastPlayed === today) {
        setHasPlayedToday(true);
      } else {
        localStorage.setItem(storageKey, today);
      }
    }
  }, [isOnline, userId]);

  // Réf. mutable pour l'Hôte afin de vérifier les réponses
  const stateRef = useRef(gameState);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  // J1 (Hôte) broadcast son état
  const broadcastState = useCallback((newState) => {
    if (isOnline && isHost && socket && roomId) {
      socket.emit("updateGameState", { roomId, state: newState });
    }
  }, [isOnline, isHost, socket, roomId]);

  // Mise à jour de l'état (gérée par Hôte ou Solo)
  const updateState = useCallback((updater) => {
    setGameState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  // ─── INITIALISATION ONLINE ───
  useEffect(() => {
    if (isOnline && socket) {
      if (isHost) {
        // Envoi de l'état initial
        broadcastState(stateRef.current);
      } else {
        // Client écoute les mises à jour
        socket.on("gameStateUpdated", (state) => {
          setGameState(state);
          if (state.isFinished) {
            onGameEnd(state.score1, state.score2);
          }
        });
      }
    }
    return () => {
      if (socket) socket.off("gameStateUpdated");
    };
  }, [isOnline, isHost, socket, broadcastState, onGameEnd]);

  // ─── RESOLUTION DU TOUR (Hôte / Solo) ───
  const resolveRound = useCallback(() => {
    const s = stateRef.current;
    if (s.feedback) return; // Déjà résolu

    const currentQ = s.questions[s.indexQ];
    const correctIndex = currentQ.correct;

    let points1 = 0;
    let points2 = 0;

    if (s.j1Choice === correctIndex) points1 = 1;
    if (isOnline && s.j2Choice === correctIndex) points2 = 1;

    const newScore1 = s.score1 + points1;
    const newScore2 = s.score2 + points2;

    updateState({
      score1: newScore1,
      score2: newScore2,
      feedback: {
        correctIndex,
        j1Choice: s.j1Choice ?? -1,
        j2Choice: s.j2Choice ?? -1
      }
    });

    setTimeout(() => {
      const nextS = stateRef.current;
      if (nextS.indexQ + 1 >= nextS.questions.length) {
        updateState({ isFinished: true });
        onGameEnd(newScore1, newScore2);
      } else {
        updateState({
          indexQ: nextS.indexQ + 1,
          timer: 10,
          feedback: null,
          j1HasAnswered: false,
          j2HasAnswered: false,
          j1Choice: null,
          j2Choice: null
        });
      }
    }, 2500);
  }, [isOnline, updateState, onGameEnd]);

  // ─── GESTION DU TEMPS (Hôte / Solo) ───
  useEffect(() => {
    if ((isOnline && !isHost) || gameState.feedback || gameState.isFinished) return;

    const t = setInterval(() => {
      const s = stateRef.current;
      if (s.timer > 0) {
        updateState({ timer: s.timer - 1 });
      } else {
        // Temps écoulé
        resolveRound();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [isOnline, isHost, gameState.feedback, gameState.isFinished, updateState, resolveRound]);

  // ─── GESTION DU BOT (Hôte / Solo) ───
  useEffect(() => {
    if (isOnline && isHost && isBotMatch && !gameState.j2HasAnswered && !gameState.feedback && !gameState.isFinished) {
      const delay = 3000 + Math.random() * 4000; // Le bot répond entre 3 et 7 secondes
      const t = setTimeout(() => {
        const currentQ = gameState.questions[gameState.indexQ];
        if (!currentQ) return;
        
        // Le bot a 70% de chances de donner la bonne réponse
        const random = Math.random();
        let botChoice;
        if (random < 0.7) {
          botChoice = currentQ.correct;
        } else {
          botChoice = Math.floor(Math.random() * currentQ.opts.length);
        }

        updateState((prev) => {
          const next = { ...prev, j2HasAnswered: true, j2Choice: botChoice };
          if (next.j1HasAnswered) {
            setTimeout(resolveRound, 100);
          }
          return next;
        });
      }, delay);
      return () => clearTimeout(t);
    }
  }, [isOnline, isHost, isBotMatch, gameState, updateState, resolveRound]);

  // ─── GESTION DES ACTIONS ADVERSAIRE ───
  useEffect(() => {
    if (isOnline && isHost && socket) {
      const handleOpponentAction = ({ action, data }) => {
        if (action === "answer") {
          updateState((prev) => {
            const next = { ...prev, j2HasAnswered: true, j2Choice: data.choix };
            if (next.j1HasAnswered) {
              setTimeout(resolveRound, 100);
            }
            return next;
          });
        }
      };
      socket.on("opponentAction", handleOpponentAction);
      return () => socket.off("opponentAction", handleOpponentAction);
    }
  }, [isOnline, isHost, socket, updateState, resolveRound]);

  // ─── ACTION LOCALE ───
  const handleAnswer = useCallback((choix) => {
    if (gameState.feedback) return; // Trop tard
    
    // Solo
    if (!isOnline) {
      if (gameState.j1HasAnswered) return;
      updateState((prev) => {
        const next = { ...prev, j1HasAnswered: true, j1Choice: choix };
        setTimeout(resolveRound, 100);
        return next;
      });
      return;
    }

    // Online - Hôte
    if (isHost) {
      if (gameState.j1HasAnswered) return;
      updateState((prev) => {
        const next = { ...prev, j1HasAnswered: true, j1Choice: choix };
        if (next.j2HasAnswered) {
          setTimeout(resolveRound, 100);
        }
        return next;
      });
    } 
    // Online - Client
    else {
      if (gameState.j2HasAnswered) return;
      socket.emit("playerAction", { roomId, action: "answer", data: { choix } });
      setGameState(prev => ({ ...prev, j2HasAnswered: true }));
    }
  }, [isOnline, isHost, gameState.feedback, gameState.j1HasAnswered, gameState.j2HasAnswered, updateState, resolveRound, socket, roomId]);

  // ─── RENDU ───
  if (hasPlayedToday) {
    return (
      <div className={styles.quizBoard} style={{ textAlign: "center", padding: "3rem" }}>
        <h2 style={{ color: "#fff", fontFamily: "var(--font-manga)", fontSize: "2rem" }}>Quiz Quotidien Terminé</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.2rem", marginTop: "1rem" }}>
          Tu as déjà joué à ton quiz local aujourd'hui !<br/>Reviens demain pour de nouvelles questions.
        </p>
        <button 
          onClick={() => navigate('/arcade')}
          style={{ marginTop: "2rem", padding: "1rem 2rem", fontSize: "1.2rem", background: "#3498db", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          Retour à l'Arcade
        </button>
      </div>
    );
  }

  if (!gameState.questions || gameState.questions.length === 0) return <div style={{ color: "white" }}>Chargement...</div>;
  if (gameState.isFinished) return null; // Le GamePlayPage va afficher les résultats

  const q = gameState.questions[gameState.indexQ];
  const amIHost = isHost || !isOnline;
  const iHaveAnswered = amIHost ? gameState.j1HasAnswered : gameState.j2HasAnswered;
  const oppHasAnswered = amIHost ? gameState.j2HasAnswered : gameState.j1HasAnswered;

  return (
    <div className={styles.quizBoard}>
      <div className={styles.quizHeader}>
        <div className={styles.quizPlayer} style={{ opacity: amIHost ? 1 : 0.6 }}>
          <span style={{ color: "#e63946" }}>● Moi</span> <strong>{amIHost ? gameState.score1 : gameState.score2}</strong>
          {iHaveAnswered && !gameState.feedback && <span style={{ marginLeft: "10px", fontSize: "0.8rem" }}>✔️ Prêt</span>}
        </div>
        <div className={styles.quizInfo}>
          <span className={styles.quizCounter}>Q{gameState.indexQ + 1}/{gameState.questions.length}</span>
          {!isOnline && <span className={styles.quizTour}>SOLO</span>}
        </div>
        {isOnline && (
          <div className={styles.quizPlayer} style={{ opacity: !amIHost ? 1 : 0.6 }}>
            <span style={{ color: "#3498db" }}>● Adv.</span> <strong>{!amIHost ? gameState.score1 : gameState.score2}</strong>
            {oppHasAnswered && !gameState.feedback && <span style={{ marginLeft: "10px", fontSize: "0.8rem" }}>✔️ Prêt</span>}
          </div>
        )}
      </div>

      <div className={styles.quizTimerBar}>
        <div className={styles.quizTimerFill} style={{ width: `${(gameState.timer / 10) * 100}%` }} />
      </div>

      <div className={styles.quizQuestion}>
        <h2>{q.q}</h2>
      </div>

      <div className={styles.quizOptions}>
        {q.opts.map((opt, i) => {
          let cls = styles.quizOpt;
          const { feedback } = gameState;
          
          if (feedback) {
            const wasMyChoice = amIHost ? (feedback.j1Choice === i) : (feedback.j2Choice === i);
            const wasOppChoice = isOnline && (amIHost ? (feedback.j2Choice === i) : (feedback.j1Choice === i));
            
            if (i === feedback.correctIndex) {
              cls += " " + styles.quizCorrect;
            } else if (wasMyChoice) {
              cls += " " + styles.quizWrong;
            } else if (wasOppChoice) {
              // Optionnel: montrer la mauvaise réponse de l'adversaire (bleu)
              cls += " " + styles.quizOppWrong;
            }
          } else if (iHaveAnswered) {
             // Afficher le style sélectionné en attendant que l'autre réponde
             // Le Client stocke localement qu'il a répondu, mais il ne sait pas ce qu'il a répondu (sauf s'il gère un state local ou désactive juste les boutons)
             cls += " " + styles.quizDisabled;
          }

          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={iHaveAnswered || !!feedback}>
              <span className={styles.quizOptLetter}>{["A", "B", "C", "D"][i]}</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
