import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./TypingGame.module.css";

const PHRASES = [
  "Le fennec est le plus petit canidé sauvage du monde",
  "Les jeux vidéo sont un art interactif unique",
  "La réalité virtuelle va transformer le gaming",
  "Un bon gamer ne rage quit jamais en tournoi",
  "Le code source est la poésie du numérique",
  "Chaque pixel compte dans un jeu bien designé",
  "Stream ton gameplay et partage ta passion",
  "Les esports rassemblent des millions de fans",
  "Le modding permet de créer des mondes infinis",
  "Speed run et no hit sont des arts du gaming",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function TypingGame({ onGameEnd }) {
  const [phrases] = useState(() => shuffle(PHRASES).slice(0, 5));
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [tour, setTour] = useState(1);
  const [input, setInput] = useState("");
  const [temps1, setTemps1] = useState([]);
  const [temps2, setTemps2] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [phase, setPhase] = useState("ready");
  const inputRef = useRef(null);
  const gameOverRef = useRef(false);

  const handleEnd = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    const avg1 = temps1.reduce((a, b) => a + b, 0) / (temps1.length || 1);
    const avg2 = temps2.reduce((a, b) => a + b, 0) / (temps2.length || 1);
    const score1 = Math.round(1000 / Math.max(avg1, 0.1));
    const score2 = Math.round(1000 / Math.max(avg2, 0.1));
    onGameEnd(score1, score2);
  }, [temps1, temps2, onGameEnd]);

  const startPhrase = useCallback(() => {
    setInput("");
    setStartTime(Date.now());
    setPhase("typing");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (phase !== "typing" || !startTime) return;
    const phrase = phrases[currentPhrase];
    if (input === phrase) {
      const elapsed = (Date.now() - startTime) / 1000;
      if (tour === 1) {
        const newTemps = [...temps1, elapsed];
        setTemps1(newTemps);
        if (currentPhrase + 1 >= phrases.length) {
          setTour(2);
          setCurrentPhrase(0);
          setPhase("ready");
        } else {
          setCurrentPhrase(p => p + 1);
          setPhase("ready");
        }
      } else {
        const newTemps = [...temps2, elapsed];
        setTemps2(newTemps);
        if (currentPhrase + 1 >= phrases.length) {
          setTimeout(() => {
            const avg1 = temps1.reduce((a, b) => a + b, 0) / (temps1.length || 1);
            const avg2 = newTemps.reduce((a, b) => a + b, 0) / (newTemps.length || 1);
            const s1 = Math.round(1000 / Math.max(avg1, 0.1));
            const s2 = Math.round(1000 / Math.max(avg2, 0.1));
            onGameEnd(s1, s2);
          }, 500);
        } else {
          setCurrentPhrase(p => p + 1);
          setPhase("ready");
        }
      }
      setInput("");
    }
  }, [input, phase, startTime, currentPhrase, phrases, tour, temps1, temps2, onGameEnd, handleEnd]);

  const phrase = phrases[currentPhrase] || "";
  const chars = phrase.split("");

  return (
    <div className={styles.typingBoard}>
      <div className={styles.typingHeader}>
        <div className={styles.typingPlayer} style={{ opacity: tour === 1 ? 1 : 0.4 }}>
          <span style={{ color: "#e63946" }}>●</span> J1
          {temps1.length > 0 && <small>{(temps1.reduce((a,b) => a+b, 0) / temps1.length).toFixed(1)}s moy</small>}
        </div>
        <div className={styles.typingInfo}>
          Phrase {currentPhrase + 1}/{phrases.length} — Tour J{tour}
        </div>
        <div className={styles.typingPlayer} style={{ opacity: tour === 2 ? 1 : 0.4 }}>
          <span style={{ color: "#3498db" }}>●</span> J2
          {temps2.length > 0 && <small>{(temps2.reduce((a,b) => a+b, 0) / temps2.length).toFixed(1)}s moy</small>}
        </div>
      </div>

      {phase === "ready" ? (
        <div className={styles.typingReady}>
          <h2>Joueur {tour}, prêt ?</h2>
          <p className={styles.typingPreview}>{phrase}</p>
          <button className={styles.typingStartBtn} onClick={startPhrase}>
            ▶ GO !
          </button>
        </div>
      ) : (
        <div className={styles.typingZone}>
          <div className={styles.typingPhrase}>
            {chars.map((c, i) => {
              let cls = styles.charPending;
              if (i < input.length) {
                cls = input[i] === c ? styles.charCorrect : styles.charWrong;
              } else if (i === input.length) {
                cls = styles.charCurrent;
              }
              return <span key={i} className={cls}>{c === " " ? "\u00A0" : c}</span>;
            })}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.typingInput}
            autoComplete="off"
            spellCheck="false"
          />
          {startTime && (
            <div className={styles.typingTimer}>
              {((Date.now() - startTime) / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      )}
    </div>
  );
}
