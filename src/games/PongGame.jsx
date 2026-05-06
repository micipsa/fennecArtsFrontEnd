import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./GameBoard.module.css";

export default function PongGame({ onGameEnd, socket, roomData, sessionId }) {
  const canvasRef = useRef(null);
  const [scores, setScores] = useState({ j1: 0, j2: 0 });
  const [temps, setTemps] = useState(0);
  const gameOverRef = useRef(false);

  const isOnline = sessionId === "online" && socket && roomData;
  const isJ1 = isOnline ? roomData.j1.socketId === socket.id : true;

  const handleEnd = useCallback((s1, s2) => {
    if (!gameOverRef.current) {
      gameOverRef.current = true;
      if (isOnline) {
        socket.emit("gameEnded", { roomId: roomData.roomId, finalScore: { j1: s1, j2: s2 } });
      }
      onGameEnd(s1, s2);
    }
  }, [onGameEnd, isOnline, socket, roomData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = 800);
    const h = (canvas.height = 400);

    let animId;
    let frameCount = 0;
    let j1Score = 0, j2Score = 0;
    let j1Y = h / 2 - 50, j2Y = h / 2 - 50;
    let ballX = w / 2, ballY = h / 2, ballVX = 4, ballVY = 4;
    const paddleH = 100, paddleW = 12, ballSize = 8;
    const maxScore = 5;

    const keys = {};
    const onKeyDown = (e) => { keys[e.key] = true; };
    const onKeyUp = (e) => { keys[e.key] = false; };
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
      ballVX = 4 * direction;
      ballVY = (Math.random() - 0.5) * 6;
    };

    const gameLoop = () => {
      if (gameOverRef.current) return;

      // Déplacement local (Host ou Guest)
      let oldJ1Y = j1Y;
      let oldJ2Y = j2Y;

      if (!isOnline || isJ1) {
        if (keys["w"] && j1Y > 0) j1Y -= 7;
        if (keys["s"] && j1Y < h - paddleH) j1Y += 7;
        
        if (isOnline && j1Y !== oldJ1Y) {
          socket.emit("playerAction", { roomId: roomData.roomId, action: "movePaddle", data: { y: j1Y } });
        }
      }
      
      if (!isOnline || !isJ1) {
        if (keys["ArrowUp"] && j2Y > 0) j2Y -= 7;
        if (keys["ArrowDown"] && j2Y < h - paddleH) j2Y += 7;

        if (isOnline && j2Y !== oldJ2Y) {
          socket.emit("playerAction", { roomId: roomData.roomId, action: "movePaddle", data: { y: j2Y } });
        }
      }

      // Physique de la balle (Calculé uniquement en local ou par J1)
      if (!isOnline || isJ1) {
        ballX += ballVX;
        ballY += ballVY;

        if (ballY <= 0 || ballY >= h) ballVY *= -1;

        if (ballX <= paddleW + 5 && ballY > j1Y && ballY < j1Y + paddleH) {
          ballVX = Math.abs(ballVX) * 1.05;
          ballX = paddleW + 6;
          const hitPos = (ballY - j1Y) / paddleH - 0.5;
          ballVY = hitPos * 8;
        }
        if (ballX >= w - paddleW - 5 && ballY > j2Y && ballY < j2Y + paddleH) {
          ballVX = -Math.abs(ballVX) * 1.05;
          ballX = w - paddleW - 6;
          const hitPos = (ballY - j2Y) / paddleH - 0.5;
          ballVY = hitPos * 8;
        }

        if (ballX < 0) { j2Score++; resetBall(1); }
        if (ballX > w) { j1Score++; resetBall(-1); }

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
      ctx.fillText(j1Score, w / 4, 60);
      ctx.fillText(j2Score, (3 * w) / 4, 60);

      frameCount++;
      if (frameCount % 30 === 0) {
        setScores({ j1: j1Score, j2: j2Score });
        setTemps(Math.floor(frameCount / 60));
      }

      if (j1Score >= maxScore || j2Score >= maxScore) {
        handleEnd(j1Score, j2Score);
        return;
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
  }, [handleEnd, isOnline, isJ1, socket, roomData]);

  return (
    <div className={styles.gameBoard}>
      <div className={styles.gameHeader}>
        <div className={styles.playerLabel}>
          <span className={styles.playerDot} style={{ background: "#e63946" }} />
          {isOnline ? roomData.j1.pseudo : "Joueur 1"} : <strong>{scores.j1}</strong>
        </div>
        <div className={styles.timer}>⏱ {temps}s</div>
        <div className={styles.playerLabel}>
          <span className={styles.playerDot} style={{ background: "#3498db" }} />
          {isOnline ? roomData.j2.pseudo : "Joueur 2"} : <strong>{scores.j2}</strong>
        </div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.controls}>
        {isOnline 
          ? (isJ1 ? "Vos contrôles: W / S" : "Vos contrôles: Flèches Haut / Bas") 
          : "J1: W/S | J2: ↑/↓"} | Premier à 5 gagne
      </p>
    </div>
  );
}
