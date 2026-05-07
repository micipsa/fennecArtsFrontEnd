import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import useAuth from "../hooks/useAuth";
import PongGame from "../games/PongGame";
import SnakeGame from "../games/SnakeGame";
import QuizGame from "../games/QuizGame";
import RPSGame from "../games/RPSGame";
import TypingGame from "../games/TypingGame";
import MemoryGame from "../games/MemoryGame";
import WordleGame from "../games/WordleGame";
import MobileControls from "../components/UI/MobileControls";
import styles from "../games/GameBoard.module.css";

const GAINS = {
  pong:   { xpWin: 25, fmWin: 5, xpLose: 5 },
  snake:  { xpWin: 20, fmWin: 5, xpLose: 3 },
  quiz:   { xpWin: 15, fmWin: 3, xpLose: 2 },
  rps:    { xpWin: 10, fmWin: 2, xpLose: 1 },
  typing: { xpWin: 20, fmWin: 4, xpLose: 2 },
  memory: { xpWin: 20, fmWin: 5, xpLose: 3 },
  wordle: { xpWin: 30, fmWin: 10, xpLose: 5 },
};

const JEUX_COMPOSANTS = {
  pong: PongGame,
  snake: SnakeGame,
  quiz: QuizGame,
  rps: RPSGame,
  typing: TypingGame,
  memory: MemoryGame,
  wordle: WordleGame,
};

const JEUX_NOMS = {
  pong: "Pong", snake: "Snake", quiz: "Quiz Gaming",
  rps: "JAN KEN", typing: "Typing Race", memory: "Memory Geek", wordle: "Fennec Word",
};

export default function GamePlayPage() {
  const { jeu, sessionId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { utilisateur } = useAuth();
  const [resultat, setResultat] = useState(null);
  
  // États Multijoueur
  const [matchStatus, setMatchStatus] = useState(sessionId === "online" ? "searching" : "playing");
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    if (sessionId !== "online" || !socket || !utilisateur) return;

    socket.emit("joinQueue", { jeu, userId: utilisateur._id });

    socket.on("matchFound", (data) => {
      setRoomData(data);
      setMatchStatus("found");
      setTimeout(() => setMatchStatus("playing"), 2000); // Animation "Match Found" pendant 2s
    });

    socket.on("notEnoughFM", (data) => {
      alert("❌ Fonds insuffisants ! Jouer en ligne coûte 5 FM.");
      navigate("/arcade");
    });

    return () => {
      socket.emit("leaveQueue", { jeu, userId: utilisateur?._id });
      socket.off("matchFound");
      socket.off("notEnoughFM");
    };
  }, [sessionId, socket, jeu, utilisateur]);

  const handleGameEnd = useCallback(async (scoreJ1, scoreJ2, extras = {}) => {
    const gains = GAINS[jeu];
    const isJ1Win = scoreJ1 > scoreJ2 || scoreJ1 === 1; // Wordle renvoie 1 pour win

    if (sessionId && sessionId !== "solo") {
      try {
        await api.post(`/api/arcade/terminer-partie/${sessionId}`, { scoreJ1, scoreJ2, temps: extras.temps });
      } catch {}
    } else if (sessionId === "local" || sessionId === "solo") {
      // Pour les jeux solo comme Fennec Word, on envoie le score au leaderboard
      try {
        await api.post(`/api/arcade/terminer-solo`, { 
          jeu, 
          isWin: isJ1Win,
          temps: extras.temps 
        });
      } catch {}
    }

    setResultat({
      scoreJ1,
      scoreJ2,
      gagnant: isJ1Win ? "Joueur 1" : (jeu === "wordle" ? "Perdu..." : "Joueur 2"),
      xp: isJ1Win ? gains.xpWin : gains.xpLose,
      fm: isJ1Win ? gains.fmWin : 0,
      ...extras // Contient potentiellement { temps, motDuJour, edition, langue }
    });
  }, [jeu, sessionId]);

  const rejouer = () => {
    setResultat(null);
  };

  const GameComponent = JEUX_COMPOSANTS[jeu];

  if (!GameComponent) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a, #1a1a2e)", padding: "3rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-manga)", color: "#fff", fontSize: "2.5rem", marginBottom: "1rem" }}>
          🚧 {JEUX_NOMS[jeu] || jeu}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Ce jeu arrive bientôt ! Reste connecté.
        </p>
        <button
          onClick={() => navigate("/arcade")}
          style={{
            padding: "0.8rem 2rem", background: "linear-gradient(135deg, var(--couleur-primaire), #ff6b6b)",
            color: "#fff", border: "none", borderRadius: "10px", fontFamily: "var(--font-titre)",
            fontWeight: 700, cursor: "pointer", fontSize: "1rem",
          }}
        >
          ← Retour à l'Arcade
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a, #1a1a2e)", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-manga)", color: "#fff", fontSize: "2rem", margin: 0 }}>
          {JEUX_NOMS[jeu]} {sessionId === "online" && "— EN LIGNE"}
        </h2>
      </div>

      {matchStatus === "searching" && (
        <div style={{ textAlign: "center", padding: "4rem", color: "#fff", fontFamily: "var(--font-titre)" }}>
          <div className={styles.spinner} style={{ fontSize: "3rem", marginBottom: "1rem", animation: "spin 2s linear infinite" }}>⏳</div>
          <h3>Recherche d'un adversaire...</h3>
          <button 
            onClick={() => navigate("/arcade")} 
            style={{ marginTop: "2rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", padding: "0.5rem 1.5rem", color: "#fff", borderRadius: "8px", cursor: "pointer" }}
          >
            Annuler
          </button>
        </div>
      )}

      {matchStatus === "found" && roomData && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#fff", background: "rgba(46, 204, 113, 0.1)", border: "1px solid #2ecc71", borderRadius: "16px", animation: "pulse 1s infinite" }}>
          <h2 style={{ fontFamily: "var(--font-manga)", fontSize: "2.5rem", color: "#2ecc71" }}>MATCH TROUVÉ !</h2>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", marginTop: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <img src={roomData.j1.avatar} alt="J1" style={{ width: "80px", borderRadius: "50%", border: "3px solid #e63946" }} />
              <p style={{ fontWeight: "bold", marginTop: "0.5rem" }}>{roomData.j1.pseudo}</p>
            </div>
            <h3 style={{ fontSize: "2rem", color: "rgba(255,255,255,0.5)" }}>VS</h3>
            <div style={{ textAlign: "center" }}>
              <img src={roomData.j2.avatar} alt="J2" style={{ width: "80px", borderRadius: "50%", border: "3px solid #3498db" }} />
              <p style={{ fontWeight: "bold", marginTop: "0.5rem" }}>{roomData.j2.pseudo}</p>
            </div>
          </div>
          <p style={{ marginTop: "2rem", opacity: 0.7 }}>Préparation de l'arène...</p>
        </div>
      )}

      {matchStatus === "playing" && !resultat && (
        <>
          <GameComponent 
            sessionId={sessionId} 
            onGameEnd={handleGameEnd} 
            roomData={roomData}
            socket={socket}
            isOnline={sessionId === "online"}
            isHost={roomData ? roomData.j1.userId === utilisateur?._id : true}
            userId={utilisateur?._id}
          />
          {(jeu === "pong" || jeu === "snake" || jeu === "pacman") && <MobileControls />}
        </>
      )}

      {resultat && (
        <div className={styles.resultOverlay}>
          <div className={styles.resultCard}>
            <span className={styles.resultEmoji}>
              {resultat.gagnant === "Joueur 1" ? "🏆" : "💀"}
            </span>
            <h2 className={styles.resultTitle}>
              {jeu === "wordle" ? (resultat.scoreJ1 === 1 ? "Félicitations !" : "Perdu...") : `${resultat.gagnant} gagne !`}
            </h2>
            
            {jeu === "wordle" ? (
              <div style={{ margin: "1.5rem 0", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>Mot du jour ({resultat.langue === "FR" ? "🇫🇷" : "🇬🇧"})</p>
                <h3 style={{ fontFamily: "var(--font-manga)", fontSize: "2rem", letterSpacing: "5px", color: resultat.scoreJ1 === 1 ? "#538d4e" : "#e63946" }}>
                  {resultat.motDuJour}
                </h3>
                {resultat.temps > 0 && <p style={{ marginTop: "0.5rem", color: "#f39c12" }}>⏱ Temps: {resultat.temps}s</p>}
              </div>
            ) : (
              <p className={styles.resultScore}>
                {resultat.scoreJ1} — {resultat.scoreJ2}
              </p>
            )}

            <div className={styles.resultGains}>
              <span>⚡ +{resultat.xp} XP</span>
              {resultat.fm > 0 && <span>💰 +{resultat.fm} FM</span>}
            </div>
            <div className={styles.resultActions}>
              {jeu !== "wordle" && (
                <button className={styles.btnRejouer} onClick={rejouer}>
                  🔄 Rejouer
                </button>
              )}
              <button className={styles.btnRetour} onClick={() => navigate("/arcade")}>
                ← Arcade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
