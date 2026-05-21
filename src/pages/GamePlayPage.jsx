import { useState, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
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
import ArcadeLeaderboardTable from "../components/Arcade/ArcadeLeaderboardTable";
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

function SearchingScreen({ navigate }) {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "4rem", color: "#fff", fontFamily: "var(--font-titre)" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "spin 2s linear infinite" }}>⏳</div>
      <h3>Recherche d'un adversaire...</h3>
      <p style={{ marginTop: "1rem", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
        {countdown > 0 
          ? `Un bot sera assigné dans ${countdown}s si personne ne rejoint`
          : "🤖 Attribution d'un bot en cours..."
        }
      </p>
      <div style={{ marginTop: "1.5rem", width: "200px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "99px", margin: "1.5rem auto" }}>
        <div style={{ height: "100%", width: `${((15 - countdown) / 15) * 100}%`, background: "linear-gradient(90deg, #e63946, #f4a261)", borderRadius: "99px", transition: "width 1s linear" }} />
      </div>
      <button 
        onClick={() => navigate("/arcade")} 
        style={{ marginTop: "1rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", padding: "0.5rem 1.5rem", color: "#fff", borderRadius: "8px", cursor: "pointer" }}
      >
        Annuler
      </button>
    </div>
  );
}

export default function GamePlayPage() {
  const { jeu, sessionId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { utilisateur } = useAuth();
  const [resultat, setResultat] = useState(null);
  
  // États Multijoueur
  const [matchStatus, setMatchStatus] = useState(() => {
    if (sessionId === "online") return "searching";
    if ((sessionId === "local" || sessionId === "solo") && jeu !== "pong") return "paying";
    return "playing";
  });
  const [roomData, setRoomData] = useState(null);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const chargerLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await api.get(`/api/arcade/leaderboard/${jeu}`);
      setLeaderboard(res.data.data);
    } catch (err) {
      console.error("Erreur de chargement du leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [jeu]);

  useEffect(() => {
    chargerLeaderboard();
  }, [chargerLeaderboard]);

  const paymentInProgress = useRef(false);

  const handleSoloPayment = useCallback(async () => {
    if (!utilisateur) {
      toast.error("Connecte-toi pour participer au classement (2 FM).");
      navigate("/login");
      return false;
    }
    if (paymentInProgress.current) return false;
    paymentInProgress.current = true;
    try {
      await api.post("/api/arcade/payer-solo", { jeu });
      toast.success("Ticket Arcade validé : -2 FM 🪙");
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Fonds insuffisants ou erreur de ticket.";
      toast.error(errMsg);
      return false;
    } finally {
      paymentInProgress.current = false;
    }
  }, [jeu, utilisateur, navigate]);

  useEffect(() => {
    if ((sessionId === "local" || sessionId === "solo") && matchStatus === "paying") {
      if (!utilisateur) {
        toast.error("Connecte-toi pour participer au classement (2 FM).");
        navigate("/login");
        return;
      }
      
      if (paymentInProgress.current) return;
      paymentInProgress.current = true;
      
      api.post("/api/arcade/payer-solo", { jeu })
        .then(() => {
          toast.success("Ticket Arcade validé : -2 FM 🪙");
          setMatchStatus("playing");
        })
        .catch((err) => {
          const errMsg = err.response?.data?.message || "Fonds insuffisants ou erreur de ticket.";
          toast.error(errMsg);
          navigate("/arcade");
        })
        .finally(() => {
          paymentInProgress.current = false;
        });
    }
  }, [sessionId, matchStatus, jeu, utilisateur, navigate]);

  useEffect(() => {
    if (sessionId === "online" && !utilisateur) {
      toast.error("Connecte-toi pour jouer en ligne.");
      navigate("/login");
      return;
    }
    if (sessionId !== "online" || !socket || !utilisateur) return;

    socket.emit("joinQueue", { jeu, userId: utilisateur._id });

    socket.on("matchFound", (data) => {
      setRoomData(data);
      setMatchStatus("found");
      setTimeout(() => setMatchStatus("playing"), 2000); // Animation "Match Found" pendant 2s
    });

    socket.on("notEnoughFM", () => {
      toast.error("Fonds insuffisants — jouer en ligne coûte 5 FM.");
      navigate("/arcade");
    });

    socket.on("queueStatus", (data) => {
      console.log("[Queue]", data.message);
    });

    return () => {
      socket.emit("leaveQueue", { jeu, userId: utilisateur?._id });
      socket.off("matchFound");
      socket.off("notEnoughFM");
      socket.off("queueStatus");
    };
  }, [sessionId, socket, jeu, utilisateur]);

  const handleGameEnd = useCallback(async (scoreJ1, scoreJ2, extras = {}) => {
    const gains = GAINS[jeu];
    const isJ1Win = scoreJ1 > scoreJ2 || scoreJ1 === 1; // Wordle renvoie 1 pour win

    if (sessionId === "online") {
      if (roomData?.roomId) {
        try {
          await api.post(`/api/arcade/terminer-partie/${roomData.roomId}`, { scoreJ1, scoreJ2, temps: extras.temps });
        } catch {}
      }
    } else if (sessionId === "local" || sessionId === "solo") {
      try {
        await api.post(`/api/arcade/terminer-solo`, {
          jeu,
          isWin: isJ1Win,
          temps: extras.temps,
          score: (jeu === "pong" && extras.mode !== "survival") ? 0 : scoreJ1,
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

    // Actualiser le classement après un court délai pour laisser l'écriture en BDD se faire
    setTimeout(() => {
      chargerLeaderboard();
    }, 800);
  }, [jeu, sessionId, roomData, chargerLeaderboard]);

  const rejouer = () => {
    setResultat(null);
    if (sessionId === "local" || sessionId === "solo") {
      if (jeu === "pong") {
        setMatchStatus("playing");
      } else {
        setMatchStatus("paying");
      }
    }
  };

  if (sessionId === "leaderboard") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a, #1a1a2e)", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <h1 style={{ fontFamily: "var(--font-manga)", color: "#fff", fontSize: "2.5rem", margin: 0 }}>
              🏆 CLASSEMENT {JEUX_NOMS[jeu] ? JEUX_NOMS[jeu].toUpperCase() : jeu.toUpperCase()}
            </h1>
            <button
              onClick={() => navigate("/arcade")}
              style={{
                padding: "0.6rem 1.5rem",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                fontFamily: "var(--font-titre)",
                fontWeight: 700,
                cursor: "pointer",
                transition: "var(--transition)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--couleur-primaire)";
                e.currentTarget.style.background = "rgba(230, 57, 70, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
            >
              ← Retour à l'Arcade
            </button>
          </div>

          <ArcadeLeaderboardTable 
            jeu={jeu}
            leaderboard={leaderboard}
            chargement={loadingLeaderboard}
            rafraichir={chargerLeaderboard}
          />
        </div>
      </div>
    );
  }

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
        <SearchingScreen navigate={navigate} />
      )}

      {matchStatus === "paying" && (
        <div style={{ textAlign: "center", padding: "4rem", color: "#fff", fontFamily: "var(--font-titre)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "spin 2s linear infinite" }}>🪙</div>
          <h3>Validation du ticket arcade (2 FM)...</h3>
          <p style={{ marginTop: "1rem", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            Insertion de la pièce dans la borne...
          </p>
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
            isHost={roomData ? roomData.j1.socketId === socket.id : true}
            userId={utilisateur?._id}
            onPaySolo={handleSoloPayment}
          />
          {(jeu === "pong" || jeu === "snake" || jeu === "pacman") && <MobileControls />}
        </>
      )}

      {resultat && (
        <div style={{ display: "flex", justifyContent: "center", margin: "1rem auto 2.5rem", width: "90%", maxWidth: "850px" }}>
          <div className={styles.resultCard} style={{ width: "100%", maxWidth: "500px", boxShadow: "0 0 45px rgba(230,57,70,0.35)" }}>
            <span className={styles.resultEmoji}>
              {resultat.gagnant === "Joueur 1" ? "🏆" : "💀"}
            </span>
            <h2 className={styles.resultTitle}>
              {jeu === "wordle" ? (
                resultat.scoreJ1 === 1 ? "Félicitations !" : "Perdu..."
              ) : (jeu === "pong" && resultat.mode === "survival") ? (
                "Survie Terminée !"
              ) : (
                `${resultat.gagnant} gagne !`
              )}
            </h2>
            
            {(jeu === "pong" && resultat.mode === "survival") ? (
              <div style={{ margin: "1.5rem 0", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>Score de survie</p>
                <h3 style={{ fontFamily: "var(--font-manga)", fontSize: "2.2rem", color: "#f39c12", margin: "0.5rem 0" }}>
                  {resultat.scoreJ1} renvois
                </h3>
                {resultat.temps > 0 && <p style={{ color: "rgba(255,255,255,0.6)" }}>⏱ Temps survécu: {resultat.temps}s</p>}
              </div>
            ) : jeu === "wordle" ? (
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

      {/* Arcade Leaderboard tout en bas pour tous les jeux */}
      <ArcadeLeaderboardTable 
        jeu={jeu}
        leaderboard={leaderboard}
        chargement={loadingLeaderboard}
        rafraichir={chargerLeaderboard}
      />
    </div>
  );
}
