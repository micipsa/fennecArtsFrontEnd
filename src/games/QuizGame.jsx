import { useState, useCallback, useEffect } from "react";
import styles from "./QuizGame.module.css";

const QUESTIONS = [
  { q: "Quel est le vrai nom de Mario ?", opts: ["Mario Mario", "Jumpman", "Mario Bros", "Luigi Mario"], correct: 0 },
  { q: "Combien de générations Pokémon existe-t-il (2024) ?", opts: ["7", "8", "9", "10"], correct: 2 },
  { q: "Quel studio a créé The Witcher 3 ?", opts: ["Bethesda", "CD Projekt Red", "Ubisoft", "BioWare"], correct: 1 },
  { q: "Quel est le nom du héros de Zelda ?", opts: ["Zelda", "Link", "Ganon", "Epona"], correct: 1 },
  { q: "Quel jeu a popularisé le Battle Royale ?", opts: ["PUBG", "Fortnite", "H1Z1", "Apex Legends"], correct: 0 },
  { q: "Dans quel anime trouve-t-on le Sharingan ?", opts: ["Bleach", "One Piece", "Naruto", "Dragon Ball"], correct: 2 },
  { q: "Quel est le jeu le plus vendu de tous les temps ?", opts: ["GTA V", "Tetris", "Minecraft", "Wii Sports"], correct: 2 },
  { q: "Combien de champions a League of Legends (env.) ?", opts: ["120", "140", "160", "180"], correct: 2 },
  { q: "Quel est le rang le plus haut sur Valorant ?", opts: ["Immortel", "Radiant", "Champion", "Diamant"], correct: 1 },
  { q: "Qui est le créateur de Metal Gear Solid ?", opts: ["Miyamoto", "Kojima", "Sakurai", "Kamiya"], correct: 1 },
  { q: "Dans quel jeu combat-on Sephiroth ?", opts: ["Final Fantasy VII", "Kingdom Hearts", "Les deux", "Aucun"], correct: 2 },
  { q: "Quel Pokémon porte le numéro 25 ?", opts: ["Évoli", "Pikachu", "Rondoudou", "Salamèche"], correct: 1 },
  { q: "Quel est le fruit du diable de Luffy ?", opts: ["Gomu Gomu", "Mera Mera", "Hito Hito Nika", "Bara Bara"], correct: 2 },
  { q: "Combien de pierres d'infinité y a-t-il ?", opts: ["4", "5", "6", "7"], correct: 2 },
  { q: "Quel est le vrai nom d'Asta (Black Clover) ?", opts: ["On ne sait pas", "Asta Yuno", "Asta Silva", "Asta Clover"], correct: 0 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function QuizGame({ onGameEnd }) {
  const [questions] = useState(() => shuffle(QUESTIONS).slice(0, 10));
  const [indexQ, setIndexQ] = useState(0);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [tour, setTour] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(10);

  const q = questions[indexQ];

  const handleReponse = useCallback((choix) => {
    if (feedback) return;
    const correct = choix === q.correct;
    setFeedback({ choix, correct });
    if (correct) {
      if (tour === 1) setScore1(s => s + 1);
      else setScore2(s => s + 1);
    }
    setTimeout(() => {
      setFeedback(null);
      setTimer(10);
      if (tour === 1) {
        setTour(2);
      } else {
        setTour(1);
        if (indexQ + 1 >= questions.length) {
          onGameEnd(score1 + (tour === 1 && correct ? 1 : 0), score2 + (tour === 2 && correct ? 1 : 0));
        } else {
          setIndexQ(i => i + 1);
        }
      }
    }, 1500);
  }, [feedback, q, tour, indexQ, questions.length, onGameEnd, score1, score2]);

  useEffect(() => {
    if (feedback) return;
    if (timer <= 0) { handleReponse(-1); return; }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, feedback, handleReponse]);

  if (!q) return null;

  return (
    <div className={styles.quizBoard}>
      <div className={styles.quizHeader}>
        <div className={styles.quizPlayer} style={{ opacity: tour === 1 ? 1 : 0.4 }}>
          <span style={{ color: "#e63946" }}>● J1</span> <strong>{score1}</strong>
        </div>
        <div className={styles.quizInfo}>
          <span className={styles.quizCounter}>Q{indexQ + 1}/{questions.length}</span>
          <span className={styles.quizTour}>Tour J{tour}</span>
        </div>
        <div className={styles.quizPlayer} style={{ opacity: tour === 2 ? 1 : 0.4 }}>
          <span style={{ color: "#3498db" }}>● J2</span> <strong>{score2}</strong>
        </div>
      </div>

      <div className={styles.quizTimerBar}>
        <div className={styles.quizTimerFill} style={{ width: `${(timer / 10) * 100}%` }} />
      </div>

      <div className={styles.quizQuestion}>
        <h2>{q.q}</h2>
      </div>

      <div className={styles.quizOptions}>
        {q.opts.map((opt, i) => {
          let cls = styles.quizOpt;
          if (feedback) {
            if (i === q.correct) cls += " " + styles.quizCorrect;
            else if (i === feedback.choix && !feedback.correct) cls += " " + styles.quizWrong;
          }
          return (
            <button key={i} className={cls} onClick={() => handleReponse(i)} disabled={!!feedback}>
              <span className={styles.quizOptLetter}>{["A", "B", "C", "D"][i]}</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
