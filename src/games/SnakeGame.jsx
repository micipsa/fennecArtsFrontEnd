import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./GameBoard.module.css";

export default function SnakeGame({ onGameEnd, isOnline }) {
  const canvasRef = useRef(null);
  const [scores, setScores] = useState({ j1: 0, j2: 0 });
  const [temps, setTemps] = useState(0);
  const gameOverRef = useRef(false);

  const handleEnd = useCallback((s1, s2) => {
    if (!gameOverRef.current) {
      gameOverRef.current = true;
      onGameEnd(s1, s2);
    }
  }, [onGameEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = 800);
    const h = (canvas.height = 400);
    const taille = 20;
    const cols = w / taille;
    const rows = h / taille;

    let s1 = [{ x: 5, y: 10 }], d1 = { x: 1, y: 0 }, score1 = 0;
    let s2 = [{ x: 35, y: 10 }], d2 = { x: -1, y: 0 }, score2 = 0;
    let food = spawnFood();
    let frameCount = 0;
    let interval;

    function spawnFood() {
      return { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    }

    function collides(head, snake) {
      return snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y);
    }

    const keys = {};
    const onKD = (e) => { keys[e.key] = true; e.preventDefault(); };
    const onKU = (e) => { keys[e.key] = false; };
    window.addEventListener("keydown", onKD);
    window.addEventListener("keyup", onKU);

    function updateDirection() {
      // J1 (Human)
      if (keys["ArrowUp"] && d1.y !== 1) d1 = { x: 0, y: -1 };
      if (keys["ArrowDown"] && d1.y !== -1) d1 = { x: 0, y: 1 };
      if (keys["ArrowLeft"] && d1.x !== 1) d1 = { x: -1, y: 0 };
      if (keys["ArrowRight"] && d1.x !== -1) d1 = { x: 1, y: 0 };

      // J2 (Human if Online, otherwise CPU)
      if (isOnline) {
        if (keys["ArrowUp"] && d2.y !== 1) d2 = { x: 0, y: -1 };
        if (keys["ArrowDown"] && d2.y !== -1) d2 = { x: 0, y: 1 };
        if (keys["ArrowLeft"] && d2.x !== 1) d2 = { x: -1, y: 0 };
        if (keys["ArrowRight"] && d2.x !== -1) d2 = { x: 1, y: 0 };
      } else {
        // CPU logic (very basic heuristic)
        let possibleDirs = [
          { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
        ].filter(dir => !(dir.x === -d2.x && dir.y === -d2.y));

        const h2 = s2[0];
        let bestDir = d2;
        let bestDist = Infinity;

        possibleDirs.forEach(dir => {
          const nextH = { x: (h2.x + dir.x + cols) % cols, y: (h2.y + dir.y + rows) % rows };
          const collisionSelf = collides(nextH, s2);
          const collisionOpponent = s1.some(s => s.x === nextH.x && s.y === nextH.y);
          
          if (!collisionSelf && !collisionOpponent) {
            // Calculate Manhattan distance to food
            const dist = Math.abs(nextH.x - food.x) + Math.abs(nextH.y - food.y);
            if (dist < bestDist) {
              bestDist = dist;
              bestDir = dir;
            }
          }
        });
        d2 = bestDir;
      }
    }

    function tick() {
      if (gameOverRef.current) return;
      updateDirection();
      frameCount++;

      const h1 = { x: (s1[0].x + d1.x + cols) % cols, y: (s1[0].y + d1.y + rows) % rows };
      const h2 = { x: (s2[0].x + d2.x + cols) % cols, y: (s2[0].y + d2.y + rows) % rows };

      s1.unshift(h1);
      s2.unshift(h2);

      if (h1.x === food.x && h1.y === food.y) { score1++; food = spawnFood(); } else s1.pop();
      if (h2.x === food.x && h2.y === food.y) { score2++; food = spawnFood(); } else s2.pop();

      const dead1 = collides(h1, s1) || s2.some(s => s.x === h1.x && s.y === h1.y);
      const dead2 = collides(h2, s2) || s1.some(s => s.x === h2.x && s.y === h2.y);

      if (dead1 || dead2 || frameCount > 600) {
        handleEnd(score1, score2);
        return;
      }

      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        if ((i + j) % 2 === 0) { ctx.fillStyle = "rgba(255,255,255,0.02)"; ctx.fillRect(i * taille, j * taille, taille, taille); }
      }

      ctx.fillStyle = "#e63946";
      ctx.shadowColor = "#e63946";
      ctx.shadowBlur = 8;
      s1.forEach((s, i) => {
        ctx.globalAlpha = 1 - i * 0.03;
        ctx.fillRect(s.x * taille + 1, s.y * taille + 1, taille - 2, taille - 2);
      });
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#3498db";
      ctx.shadowColor = "#3498db";
      s2.forEach((s, i) => {
        ctx.globalAlpha = 1 - i * 0.03;
        ctx.fillRect(s.x * taille + 1, s.y * taille + 1, taille - 2, taille - 2);
      });
      ctx.globalAlpha = 1;

      ctx.shadowColor = "#2ecc71";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#2ecc71";
      ctx.beginPath();
      ctx.arc(food.x * taille + taille / 2, food.y * taille + taille / 2, taille / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      setScores({ j1: score1, j2: score2 });
      setTemps(Math.floor(frameCount / 6));
    }

    interval = setInterval(tick, 100);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", onKD);
      window.removeEventListener("keyup", onKU);
    };
  }, [handleEnd]);

  return (
    <div className={styles.gameBoard}>
      <div className={styles.gameHeader}>
        <div className={styles.playerLabel}>
          <span className={styles.playerDot} style={{ background: "#e63946" }} />
          J1 : <strong>{scores.j1}</strong>
        </div>
        <div className={styles.timer}>⏱ {temps}s</div>
        <div className={styles.playerLabel}>
          <span className={styles.playerDot} style={{ background: "#3498db" }} />
          {isOnline ? "J2" : "CPU"} : <strong>{scores.j2}</strong>
        </div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.controls}>
        J1: <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> | {isOnline ? "J2: Flèches" : "J2: CPU"} | Mange pour scorer !
      </p>
    </div>
  );
}
