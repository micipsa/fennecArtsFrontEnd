import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./GameBoard.module.css";

export default function PongGame({ onGameEnd, socket, roomData, sessionId }) {
  const canvasRef = useRef(null);
  const isOnline = sessionId === "online" && socket && roomData;
  const isJ1 = isOnline ? roomData.j1.socketId === socket.id : true;
  const isBotMatch = isOnline && (roomData?.j2?.isBot || roomData?.j1?.isBot);

  const [gameMode, setGameMode] = useState(isOnline ? "online" : "menu"); // "menu", "survival", "local_2p", "online"
  const [scores, setScores] = useState({ j1: 0, j2: 0 });
  const [temps, setTemps] = useState(0);
  const [goalAnim, setGoalAnim] = useState(false);
  const gameOverRef = useRef(false);

  const handleEnd = useCallback((s1, s2, survivalTime = 0) => {
    if (!gameOverRef.current) {
      gameOverRef.current = true;
      if (isOnline) {
        socket.emit("gameEnded", { roomId: roomData.roomId, finalScore: { j1: s1, j2: s2 } });
      }
      onGameEnd(s1, s2, { mode: gameMode, temps: survivalTime });
    }
  }, [onGameEnd, isOnline, socket, roomData, gameMode]);

  useEffect(() => {
    if (gameMode === "menu") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = 800);
    const h = (canvas.height = 400);

    let animId;
    let frameCount = 0;
    let j1Score = 0, j2Score = 0;
    let survivalScore = 0;
    let j1Y = h / 2 - 50, j2Y = h / 2 - 50;
    let ballX = w / 2, ballY = h / 2, ballVX = 4, ballVY = 4;
    let speedMultiplier = 1.0;
    let botSpeed = 4.5;
    const paddleH = 100, paddleW = 12, ballSize = 8;
    const maxScore = 5;

    const keys = {};
    const onKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
      keys[e.key] = true;
      keys[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e) => {
      keys[e.key] = false;
      keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Écouteurs Socket.io
    if (isOnline) {
      socket.on("opponentAction", ({ action, data }) => {
        if (action === "movePaddle") {
          if (isJ1) j2Y = data.y; // Hôte reçoit J2
          else j1Y = data.y; // J2 reçoit J1
        }
      });

      socket.on("gameStateUpdated", (state) => {
        if (!isJ1) {
          // J2 reçoit la balle et le score
          ballX = state.ballX;
          ballY = state.ballY;
          j1Score = state.j1Score;
          j2Score = state.j2Score;
        }
      });
      
      socket.on("opponentDisconnected", () => {
        if (!gameOverRef.current) {
          handleEnd(isJ1 ? 5 : 0, isJ1 ? 0 : 5); // Victoire par forfait
        }
      });
    }

    const resetBall = (direction) => {
      ballX = w / 2;
      ballY = h / 2;
      const baseSpeed = gameMode === "survival" ? 4 * speedMultiplier : 4;
      ballVX = baseSpeed * direction;
      ballVY = (Math.random() - 0.5) * 6 * (gameMode === "survival" ? speedMultiplier : 1.0);
    };

    let isPaused = false;
    const triggerGoal = (direction) => {
      isPaused = true;
      setGoalAnim(true);
      if (gameMode === "survival") {
        setScores({ j1: survivalScore, j2: Math.round(botSpeed * 10) / 10 });
      } else {
        setScores({ j1: j1Score, j2: j2Score });
      }
      setTimeout(() => {
        setGoalAnim(false);
        resetBall(direction);
        isPaused = false;
        animId = requestAnimationFrame(gameLoop);
      }, 1000);
    };

    const gameLoop = () => {
      if (gameOverRef.current || isPaused) return;

      // Déplacement local (Host ou Guest)
      let oldJ1Y = j1Y;
      let oldJ2Y = j2Y;

      // Logique mouvement J1
      if (gameMode === "local_2p") {
        if (keys["w"] && j1Y > 0) j1Y -= 7;
        if (keys["s"] && j1Y < h - paddleH) j1Y += 7;
      } else if (gameMode === "survival") {
        if ((keys["w"] || keys["ArrowUp"]) && j1Y > 0) j1Y -= 7;
        if ((keys["s"] || keys["ArrowDown"]) && j1Y < h - paddleH) j1Y += 7;
      } else if (!isOnline || isJ1) {
        if (keys["w"] && j1Y > 0) j1Y -= 7;
        if (keys["s"] && j1Y < h - paddleH) j1Y += 7;
        
        if (isOnline && j1Y !== oldJ1Y) {
          socket.emit("playerAction", { roomId: roomData.roomId, action: "movePaddle", data: { y: j1Y } });
        }
      }
      
      // Logique mouvement J2 / Bot
      if (gameMode === "local_2p") {
        if (keys["ArrowUp"] && j2Y > 0) j2Y -= 7;
        if (keys["ArrowDown"] && j2Y < h - paddleH) j2Y += 7;
      } else if (gameMode === "survival") {
        const paddleCenter = j2Y + paddleH / 2;
        if (ballY < paddleCenter - 15 && j2Y > 0) {
          j2Y -= botSpeed;
        } else if (ballY > paddleCenter + 15 && j2Y < h - paddleH) {
          j2Y += botSpeed;
        }
      } else if (!isOnline || !isJ1 || (isOnline && isBotMatch)) {
        if (!isOnline || isBotMatch) {
          // CPU Standard Logic
          const paddleCenter = j2Y + paddleH / 2;
          if (ballY < paddleCenter - 15 && j2Y > 0) {
            j2Y -= 5;
          } else if (ballY > paddleCenter + 15 && j2Y < h - paddleH) {
            j2Y += 5;
          }
        } else {
          // Human J2 Online
          if (keys["ArrowUp"] && j2Y > 0) j2Y -= 7;
          if (keys["ArrowDown"] && j2Y < h - paddleH) j2Y += 7;

          if (isOnline && j2Y !== oldJ2Y) {
            socket.emit("playerAction", { roomId: roomData.roomId, action: "movePaddle", data: { y: j2Y } });
          }
        }
      }

      // Physique de la balle (Calculé uniquement en local ou par J1)
      if (!isOnline || isJ1) {
        ballX += ballVX;
        ballY += ballVY;

        if (ballY <= 0 || ballY >= h) ballVY *= -1;

        if (ballX <= paddleW + 5 && ballY > j1Y && ballY < j1Y + paddleH) {
          if (gameMode === "survival") {
            survivalScore += 1;
            speedMultiplier *= 1.05;
            botSpeed += 0.3;
            setScores({ j1: survivalScore, j2: Math.round(botSpeed * 10) / 10 });
          }
          ballVX = Math.abs(ballVX) * 1.05;
          ballX = paddleW + 6;
          const hitPos = (ballY - j1Y) / paddleH - 0.5;
          ballVY = hitPos * 8 * (gameMode === "survival" ? speedMultiplier : 1.0);
        }
        if (ballX >= w - paddleW - 5 && ballY > j2Y && ballY < j2Y + paddleH) {
          ballVX = -Math.abs(ballVX) * (gameMode === "survival" ? 1.02 : 1.05);
          ballX = w - paddleW - 6;
          const hitPos = (ballY - j2Y) / paddleH - 0.5;
          ballVY = hitPos * 8 * (gameMode === "survival" ? speedMultiplier : 1.0);
        }

        if (ballX < 0) {
          if (gameMode === "survival") {
            handleEnd(survivalScore, 0, Math.floor(frameCount / 60));
            return;
          } else {
            j2Score++;
            triggerGoal(1);
            return;
          }
        }
        if (ballX > w) {
          if (gameMode === "survival") {
            survivalScore += 10;
            triggerGoal(-1);
            return;
          } else {
            j1Score++;
            triggerGoal(-1);
            return;
          }
        }

        // Sync état aux autres joueurs tous les 2 frames pour fluidité
        if (isOnline && frameCount % 2 === 0) {
          socket.emit("updateGameState", {
            roomId: roomData.roomId,
            state: { ballX, ballY, j1Score, j2Score }
          });
        }
      }

      // Rendu Graphique
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, w, h);

      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      const gradient1 = ctx.createLinearGradient(0, j1Y, paddleW, j1Y + paddleH);
      gradient1.addColorStop(0, "#e63946");
      gradient1.addColorStop(1, "#ff6b6b");
      ctx.fillStyle = gradient1;
      ctx.shadowColor = "#e63946";
      ctx.shadowBlur = 15;
      ctx.fillRect(5, j1Y, paddleW, paddleH);

      const gradient2 = ctx.createLinearGradient(w - paddleW - 5, j2Y, w - 5, j2Y + paddleH);
      gradient2.addColorStop(0, "#3498db");
      gradient2.addColorStop(1, "#2ecc71");
      ctx.fillStyle = gradient2;
      ctx.shadowColor = "#3498db";
      ctx.fillRect(w - paddleW - 5, j2Y, paddleW, paddleH);

      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = "bold 48px 'Oxanium', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.textAlign = "center";
      
      if (gameMode === "survival") {
        ctx.fillText(survivalScore, w / 4, 60);
        ctx.font = "bold 20px 'Oxanium', monospace";
        ctx.fillText(`BOT (DIF: ${Math.round((botSpeed - 4.5) * 10) / 10})`, (3 * w) / 4, 50);
      } else {
        ctx.fillText(j1Score, w / 4, 60);
        ctx.fillText(j2Score, (3 * w) / 4, 60);
      }

      frameCount++;
      if (frameCount % 30 === 0) {
        setTemps(Math.floor(frameCount / 60));
        if (gameMode === "survival") {
          setScores({ j1: survivalScore, j2: Math.round(botSpeed * 10) / 10 });
        } else {
          setScores({ j1: j1Score, j2: j2Score });
        }
      }

      if (gameMode !== "survival") {
        if (j1Score >= maxScore || j2Score >= maxScore) {
          handleEnd(j1Score, j2Score);
          return;
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (isOnline) {
        socket.off("opponentAction");
        socket.off("gameStateUpdated");
        socket.off("opponentDisconnected");
      }
    };
  }, [handleEnd, isOnline, isJ1, socket, roomData, gameMode]);

  if (gameMode === "menu") {
    return (
      <div style={{
        width: "100%",
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "2.5rem",
        background: "rgba(10, 10, 26, 0.9)",
        border: "2px dashed var(--couleur-primaire, #e63946)",
        borderRadius: "20px",
        boxShadow: "0 0 30px rgba(230, 57, 70, 0.15)",
        textAlign: "center",
        fontFamily: "var(--font-titre, sans-serif)",
        color: "#fff"
      }}>
        <h2 style={{
          fontFamily: "var(--font-manga, sans-serif)",
          fontSize: "2.2rem",
          marginBottom: "0.5rem",
          textShadow: "0 0 15px #e63946",
          color: "#fff"
        }}>
          PONG ARCADE
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.95rem", marginBottom: "2rem" }}>
          SÉLECTIONNE TON MODE DE JEU LOCAL
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Mode Survie */}
          <button
            onClick={() => setGameMode("survival")}
            style={{
              background: "linear-gradient(135deg, rgba(230, 57, 70, 0.15), rgba(244, 162, 97, 0.15))",
              border: "1px solid rgba(230, 57, 70, 0.4)",
              borderRadius: "12px",
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textAlign: "left",
              color: "#fff",
              position: "relative"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "var(--couleur-primaire, #e63946)";
              e.currentTarget.style.boxShadow = "0 5px 15px rgba(230, 57, 70, 0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(230, 57, 70, 0.4)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold", fontFamily: "var(--font-manga)" }}>💀 MODE SURVIE</span>
              <span style={{ fontSize: "0.8rem", background: "#e63946", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>CLASSEMENT</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: "1.4" }}>
              Tiens le maximum de temps contre le Bot. La vitesse de la balle et la rapidité du Bot augmentent à chaque renvoi. Mort subite !
            </p>
          </button>

          {/* Mode Local 2J */}
          <button
            onClick={() => setGameMode("local_2p")}
            style={{
              background: "linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(46, 204, 113, 0.15))",
              border: "1px solid rgba(52, 152, 219, 0.4)",
              borderRadius: "12px",
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textAlign: "left",
              color: "#fff"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "#3498db";
              e.currentTarget.style.boxShadow = "0 5px 15px rgba(52, 152, 219, 0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.4)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold", fontFamily: "var(--font-manga)" }}>⚔️ LOCAL 2 JOUEURS</span>
              <span style={{ fontSize: "0.8rem", background: "#3498db", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>FUN</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: "1.4" }}>
              Affronte un ami sur le même clavier. Premier à 5 points gagne.
              <br />
              <strong style={{ color: "#ffc107" }}>Contrôles :</strong> J1 (Gauche) : <kbd>W</kbd> / <kbd>S</kbd> | J2 (Droite) : <kbd>↑</kbd> / <kbd>↓</kbd>
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameBoard}>
      <div className={styles.gameHeader}>
        <div className={styles.playerLabel}>
          <span className={styles.playerDot} style={{ background: "#e63946" }} />
          {isOnline ? roomData.j1.pseudo : (gameMode === "survival" ? "Joueur 1 (Survie)" : "Joueur 1")} : <strong>{scores.j1}</strong>
        </div>
        <div className={styles.timer}>⏱ {temps}s</div>
        <div className={styles.playerLabel}>
          <span className={styles.playerDot} style={{ background: "#3498db" }} />
          {gameMode === "survival" ? `BOT (VITESSE: ${scores.j2})` : (isOnline ? roomData.j2.pseudo : "Joueur 2")} : <strong>{gameMode === "survival" ? "" : scores.j2}</strong>
        </div>
      </div>
      <div className={`${styles.canvasContainer} ${goalAnim ? styles.shake : ""}`}>
        {goalAnim && <div className={styles.goalOverlay}>GOAAAALLL !!!!</div>}
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <p className={styles.controls}>
        {gameMode === "online" && (isJ1 ? "Vos contrôles: W / S" : "Vos contrôles: Flèches Haut / Bas")}
        {gameMode === "local_2p" && "Contrôles - J1: W / S | J2: Flèches Haut / Bas | Premier à 5 gagne"}
        {gameMode === "survival" && "Contrôles - W / S ou Flèches Haut / Bas | Mode Survie Mort Subite !"}
      </p>
    </div>
  );
}
