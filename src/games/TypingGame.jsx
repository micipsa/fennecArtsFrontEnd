import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./TypingGame.module.css";

const PHRASES_FR = [
  "Le fennec est le plus petit canide sauvage du monde et vit dans le desert du Sahara.",
  "La plateforme Fennec Arts propose des defis de programmation, de design et de jeu en ligne.",
  "Chaque pixel d'un jeu de plateforme retro est concu avec une precision extreme par les artistes.",
  "Les developpeurs passent des nuits entieres a corriger les bugs pour offrir la meilleure experience.",
  "Participe aux tournois hebdomadaires de l'association, remporte des points et deviens le champion.",
  "L'esport est en pleine expansion et rassemble des millions de spectateurs enthousiastes dans les arenes.",
  "Un bon developpeur ecrit du code propre, commente ses fonctions et utilise le controle de version.",
  "Le retro-gaming nous rappelle l'epoque ou la difficulte des jeux etait un veritable defi.",
  "La creativite artistique s'exprime a travers le pixel art, la musique chiptune et les illustrations.",
  "Travailler en equipe permet de concevoir des projets culturels de grande envergure pour la communaute."
];

const PHRASES_EN = [
  "The fennec fox is a small crepuscular fox native to the deserts of North Africa and the Sahara.",
  "Gamers from all over the world gather to compete in high stakes esports tournaments every week.",
  "Coding is the process of translating human ideas into instructions that a computer can execute.",
  "A beautiful user interface combined with a smooth user experience makes a web application premium.",
  "Keep typing as fast as you can without making errors to secure the highest score on the leaderboard.",
  "Artificial intelligence is transforming the way we design, play, and experience modern video games.",
  "Pixel art is a form of digital art where images are edited on the pixel level with precision.",
  "The community platform allows artists to share their creations and receive feedback from peers.",
  "Speedrunning requires deep knowledge of game mechanics, glitches, and hundreds of hours of practice.",
  "A great programmer always tests their code, uses clear variable names, and documents their APIs."
];

function selectRandomParagraph(lang) {
  const collection = lang === "FR" ? PHRASES_FR : PHRASES_EN;
  const shuffled = [...collection].sort(() => 0.5 - Math.random());
  // Pick 3 random sentences and join them
  return shuffled.slice(0, 3).join(" ");
}

export default function TypingGame({ onGameEnd }) {
  const [phase, setPhase] = useState("lobby"); // lobby | typing | finished
  const [langue, setLangue] = useState("FR"); // FR | EN
  const [textToType, setTextToType] = useState("");
  const [typedText, setTypedText] = useState("");
  
  // Timer States
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const inputRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Initialize text on phase transition
  const demarrerPartie = (selectedLang) => {
    setLangue(selectedLang);
    const text = selectRandomParagraph(selectedLang);
    setTextToType(text);
    setTypedText("");
    setStartTime(null);
    setElapsedTime(0);
    setTimerActive(false);
    setPhase("typing");
    // Focus the input shortly after
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        setInputFocused(true);
      }
    }, 100);
  };

  // Timer tick
  useEffect(() => {
    if (timerActive && startTime) {
      timerIntervalRef.current = setInterval(() => {
        const diff = (Date.now() - startTime) / 1000;
        setElapsedTime(diff);
      }, 50);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, startTime]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (phase !== "typing") return;

    // Start timer on first character typed
    if (!startTime && val.length > 0) {
      const now = Date.now();
      setStartTime(now);
      setTimerActive(true);
    }

    setTypedText(val);

    // Stop timer on last character validated
    if (val.length === textToType.length) {
      setTimerActive(false);
      const exactEndTime = Date.now();
      const finalElapsed = (exactEndTime - (startTime || exactEndTime)) / 1000;
      setElapsedTime(finalElapsed);
      setPhase("finished");

      // Calculate final stats
      let correctChars = 0;
      for (let i = 0; i < textToType.length; i++) {
        if (val[i] === textToType[i]) {
          correctChars++;
        }
      }
      const accuracy = (correctChars / textToType.length) * 100;
      const rawWPM = (textToType.length / 5) / (finalElapsed / 60);
      const adjustedWPM = Math.round(rawWPM * (accuracy / 100));

      // Report final score and exact elapsed time back to page handler
      setTimeout(() => {
        onGameEnd(adjustedWPM, 0, { temps: Math.round(finalElapsed * 10) / 10 });
      }, 1000);
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setInputFocused(true);
    }
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const recommencer = () => {
    demarrerPartie(langue);
  };

  const retournerMenu = () => {
    setPhase("lobby");
  };

  // Live stats calculation
  const getLiveWpm = () => {
    if (elapsedTime <= 0.5) return 0;
    return Math.round((typedText.length / 5) / (elapsedTime / 60));
  };

  const getLiveAccuracy = () => {
    if (typedText.length === 0) return 100;
    let correct = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === textToType[i]) correct++;
    }
    return Math.round((correct / typedText.length) * 100);
  };

  if (phase === "lobby") {
    return (
      <div className={styles.lobbyScreen}>
        <div className={styles.retroLogo}>⌨️ TYPING COMPETITION</div>
        <p className={styles.tagline}>
          Mesure ta vitesse de frappe en français ou en anglais. Le chrono se déclenche au premier caractère tapé.
        </p>

        <div className={styles.langSelectorTitle}>Choisissez votre langue :</div>
        <div className={styles.langButtons}>
          <button className={styles.langBtn} onClick={() => demarrerPartie("FR")}>
            <span className={styles.flag}>🇫🇷</span> Français
          </button>
          <button className={styles.langBtn} onClick={() => demarrerPartie("EN")}>
            <span className={styles.flag}>🇬🇧</span> English
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.typingGameWrapper}>
      {/* Live Stats Header */}
      <div className={styles.statsBar}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Temps</span>
          <span className={styles.statValue}>{elapsedTime.toFixed(1)}s</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Vitesse</span>
          <span className={styles.statValue}>{getLiveWpm()} WPM</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Précision</span>
          <span className={styles.statValue}>{getLiveAccuracy()}%</span>
        </div>
        <div className={styles.controlButtons}>
          <button className={styles.iconBtn} onClick={recommencer} title="Recommencer la partie">
            🔄
          </button>
          <button className={styles.iconBtn} onClick={retournerMenu} title="Retour au menu principal">
            🏠
          </button>
        </div>
      </div>

      {/* Typing box */}
      <div 
        className={`${styles.typingContainer} ${!inputFocused && phase === "typing" ? styles.unfocused : ""}`}
        onClick={handleContainerClick}
      >
        {!inputFocused && phase === "typing" && (
          <div className={styles.focusOverlay}>
            <div className={styles.focusOverlayText}>Cliquez ici pour activer le clavier ⌨️</div>
          </div>
        )}

        <div className={styles.textToType}>
          {textToType.split("").map((char, index) => {
            let charClass = "";
            let isCurrent = index === typedText.length;

            if (index < typedText.length) {
              charClass = typedText[index] === char ? styles.correct : styles.incorrect;
            }

            return (
              <span 
                key={index} 
                className={`${styles.char} ${charClass} ${isCurrent ? styles.current : ""}`}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>

        {/* Hidden input to capture keyboard inputs */}
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          className={styles.hiddenInput}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          disabled={phase === "finished"}
        />
      </div>

      {phase === "finished" && (
        <div className={styles.completionBanner}>
          <h3>🎉 Partie Terminée !</h3>
          <p>Score en cours d'enregistrement...</p>
        </div>
      )}
    </div>
  );
}
