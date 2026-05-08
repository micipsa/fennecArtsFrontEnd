import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import styles from "./QuizzGame.module.css";
import { toast } from "react-hot-toast";
import { useXPPopup } from "../../../components/UI/XPPopup";

export default function QuizzGame({ quizz, onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // 15s par question
  const [finished, setFinished] = useState(false);
  const [sending, setSending] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const { showXP, XPPopupContainer } = useXPPopup();
  
  const questions = quizz.config.questions || [];
  const currentQuestion = questions[currentIdx];

  if (!currentQuestion) {
    return <div className={styles.game}>Ce quizz est vide ou mal configuré.</div>;
  }

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
      const res = await api.post(`/api/animations/${quizz._id}/participer`, {
        score,
        reponses: { totalQuestions: questions.length, correct: score }
      });
      const { gains } = res.data;
      toast.success(`Récompenses récupérées !`);
      showXP(gains.xp, gains.fm);
      setClaimed(true);
      
      // On laisse le temps à la popup de s'afficher avant de revenir à la liste
      setTimeout(() => {
        onFinish();
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la soumission.");
    } finally {
      setSending(false);
    }
  };

  if (claimed) {
    return (
      <div className={styles.merciBox}>
        <div className={styles.merciIcon}>🎉</div>
        <h2>Quête Accomplie !</h2>
        <p>Merci pour ta participation au Quizz.</p>
        <p className={styles.redirect}>Retour au Quest Board...</p>
        <XPPopupContainer />
      </div>
    );
  }

  if (finished) {
    return (
      <div className={styles.resultBox}>
        <h2 className={styles.resultTitre}>Quizz Terminé !</h2>
        <div className={styles.finalScore}>{score} / {questions.length}</div>
        <p className={styles.resultTexte}>
          {score === questions.length ? "Parfait ! Maîtrise totale." : "Pas mal ! Tu peux faire mieux la prochaine fois."}
        </p>
        <div className={styles.recompensesAttendues}>
          {quizz.recompenseXP > 0 && <span>+{quizz.recompenseXP} XP</span>}
          {quizz.recompenseFM > 0 && <span>+{quizz.recompenseFM} FM</span>}
        </div>
        <button 
          className={styles.btnTerminer} 
          onClick={submitResults}
          disabled={sending}
        >
          {sending ? "Envoi..." : "Récupérer mes récompenses"}
        </button>
        <XPPopupContainer />
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
      <XPPopupContainer />
    </div>
  );
}
