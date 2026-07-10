import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import styles from "./PlayPage.module.css";
import QuizzGame from "./components/QuizzGame";
import SondageCard from "./components/SondageCard";
import Spinner from "../../components/UI/Spinner";

export default function PlayPage() {
  const [animations, setAnimations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [selectedAnim, setSelectedAnim] = useState(null);

  const fetchAnims = useCallback(async () => {
    try {
      const res = await api.get("/api/animations");
      setAnimations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    let actif = true;
    const run = async () => {
      await Promise.resolve();
      if (actif) {
        fetchAnims();
      }
    };
    run();
    return () => {
      actif = false;
    };
  }, [fetchAnims]);

  if (chargement) return <Spinner />;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.titre}>Quest Board 📜</h1>
        <p className={styles.description}>
          Participe aux activités de la semaine pour gagner des XP et FM !
        </p>
      </header>

      {selectedAnim ? (
        <div className={styles.gameArea}>
          <button className={styles.btnRetour} onClick={() => setSelectedAnim(null)}>
            ← Retour aux jeux
          </button>
          {selectedAnim.type === "quizz" ? (
            <QuizzGame 
              quizz={selectedAnim} 
              onFinish={() => {
                fetchAnims();
                setSelectedAnim(null);
              }} 
            />
          ) : (
            <SondageCard 
              sondage={selectedAnim} 
              onFinish={() => {
                fetchAnims();
                setSelectedAnim(null);
              }} 
            />
          )}
        </div>
      ) : (
        <div className={styles.grille}>
          {animations.length === 0 && <p className={styles.vide}>Aucune animation disponible pour le moment.</p>}
          {animations.map(anim => (
            <div 
              key={anim._id} 
              className={`${styles.carte} ${anim.dejaFait ? styles.fait : ""}`}
              onClick={() => !anim.dejaFait && setSelectedAnim(anim)}
            >
              <div className={styles.carteType}>{anim.type === "quizz" ? "🏆 Quizz" : "📊 Sondage"}</div>
              <h3 className={styles.carteTitre}>{anim.titre}</h3>
              <p className={styles.carteDesc}>{anim.description}</p>
              <div className={styles.recompenses}>
                <span>+{anim.recompenseXP} XP</span>
                <span>+{anim.recompenseFM} FM</span>
              </div>
              {anim.dejaFait && <div className={styles.badgeFait}>QUÊTE ACCOMPLIE</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
