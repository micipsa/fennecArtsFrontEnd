import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import styles from "./QuizzGame.module.css";
import { toast } from "react-hot-toast";

export default function QuizzGame({ quizz, onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // 15s par question
  const [finished, setFinished] = useState(false);
  const [sending, setSending] = useState(false);
  
  const questions = quizz.config.questions || [];
  const currentQuestion = questions[currentIdx];

  const handleNext = useCallback((correct = false) => {
    if (correct) setScore(s => s + 1);
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setTimeLeft(15);
    } else {
      setFinished(true);
    }
  }, [currentIdx, questions.length]);

  useEffect(() => {
    if (finished || timeLeft <= 0) {
      if (timeLeft === 0) handleNext(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finished, handleNext]);

  const submitResults = async () => {
    setSending(true);
    try {
      await api.post(`/api/animations/${quizz._id}/participer`, {
        score,
        reponses: { totalQuestions: questions.length, correct: score }
      });
      toast.success("Félicitations ! Tu as reçu tes récompenses.");
      onFinish();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la soumission.");
    } finally {
      setSending(false);
    }
  };

  if (finished) {
    return (
      <div className={styles.resultBox}>
        <h2 className={styles.resultTitre}>Quizz Terminé !</h2>
        <div className={styles.finalScore}>{score} / {questions.length}</div>
        <p className={styles.resultTexte}>
          {score === questions.length ? "Parfait ! Maîtrise totale." : "Pas mal ! Tu peux faire mieux la prochaine fois."}
        </p>
        <button 
          className={styles.btnTerminer} 
          onClick={submitResults}
          disabled={sending}
        >
          {sending ? "Envoi..." : "Récupérer mes récompenses"}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.game}>
      <div className={styles.header}>
        <span className={styles.progress}>Question {currentIdx + 1} / {questions.length}</span>
        <span className={`${styles.timer} ${timeLeft < 5 ? styles.urgent : ""}`}>⏱ {timeLeft}s</span>
      </div>
      
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${(timeLeft/15)*100}%` }} />
      </div>

      <h2 className={styles.question}>{currentQuestion.text}</h2>

      <div className={styles.options}>
        {currentQuestion.options.map((opt, i) => (
          <button 
            key={i} 
            className={styles.optionBtn}
            onClick={() => handleNext(i === currentQuestion.correctIndex)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
