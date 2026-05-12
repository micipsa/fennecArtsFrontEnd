import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WordleGame.module.css';
import { getDailyWordInfo, DICTIONNAIRE_FR, DICTIONNAIRE_EN } from './dictionnaireWordle';
import useAuth from '../hooks/useAuth';

const LIGNES = 6;
const COLONNES = 5;
const CLAVIER_LIGNES = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['ENTRER', 'W', 'X', 'C', 'V', 'B', 'N', 'EFFACER']
];

export default function WordleGame({ onGameEnd }) {
  const navigate = useNavigate();
  const [langue, setLangue] = useState(null); // 'FR' ou 'EN', si null affiche menu
  const [dailyInfo, setDailyInfo] = useState(null);
  const [grille, setGrille] = useState(Array(LIGNES).fill(''));
  const [ligneActuelle, setLigneActuelle] = useState(0);
  const [etatLettres, setEtatLettres] = useState({});
  const [shakeLigne, setShakeLigne] = useState(-1);
  const [revealedRows, setRevealedRows] = useState([]);
  
  const gameOverRef = useRef(false);
  const startTimeRef = useRef(null);
  const { utilisateur } = useAuth();
  const [completedLangs, setCompletedLangs] = useState([]);

  // Vérifier si le joueur a déjà joué aujourd'hui au chargement
  useEffect(() => {
    if (!utilisateur) return;
    const todayEdition = getDailyWordInfo("FR").editionNumber;
    
    const completed = [];
    if (localStorage.getItem(`fennecWordCompleted_FR_${utilisateur._id}`) === todayEdition.toString()) completed.push("FR");
    if (localStorage.getItem(`fennecWordCompleted_EN_${utilisateur._id}`) === todayEdition.toString()) completed.push("EN");
    
    if (completed.length === 2) {
      setLangue("ALREADY_PLAYED");
    } else {
      setCompletedLangs(completed);
    }
  }, [utilisateur]);

  const startDailyGame = (selectedLang) => {
    setLangue(selectedLang);
    setDailyInfo(getDailyWordInfo(selectedLang));
  };

  const handleEnd = useCallback((isWin) => {
    if (!gameOverRef.current) {
      gameOverRef.current = true;
      const endTime = Date.now();
      const tempsEcoule = startTimeRef.current ? Math.floor((endTime - startTimeRef.current) / 1000) : 0;
      
      // Sauvegarder dans le localStorage pour bloquer les tentatives futures aujourd'hui
      if (utilisateur) {
        localStorage.setItem(`fennecWordCompleted_${langue}_${utilisateur._id}`, dailyInfo.editionNumber.toString());
      }

      // On affiche le mot du jour dans un petit toast interne avant de quitter
      setTimeout(() => {
        // En mode daily, score: 1 = win, 0 = loss. On passe le temps en paramètre optionnel.
        // Puisque onGameEnd(scoreJ1, scoreJ2) on va envoyer un objet spécial au GamePlayPage
        // On modifie GamePlayPage pour accepter un 3ème paramètre `extras`
        onGameEnd(isWin ? 1 : 0, 0, { 
          temps: tempsEcoule,
          motDuJour: dailyInfo.mot,
          edition: dailyInfo.editionNumber,
          langue
        }); 
      }, 2000);
    }
  }, [onGameEnd, dailyInfo, langue]);

  const validerLigne = () => {
    const motSaisi = grille[ligneActuelle];
    if (motSaisi.length !== COLONNES) {
      faireTrembler();
      return;
    }
    
    const dictionnaireActuel = langue === "FR" ? DICTIONNAIRE_FR : DICTIONNAIRE_EN;
    if (!dictionnaireActuel.includes(motSaisi)) {
      faireTrembler();
      return;
    }

    const motCible = dailyInfo.mot;
    const nouvelleEtatLettres = { ...etatLettres };
    const cibleLettres = motCible.split('');
    const saisieLettres = motSaisi.split('');
    
    saisieLettres.forEach((lettre, i) => {
      if (lettre === cibleLettres[i]) {
        nouvelleEtatLettres[lettre] = 'correct';
        cibleLettres[i] = null;
      }
    });
    
    saisieLettres.forEach((lettre, i) => {
      if (lettre !== motCible[i]) {
        const index = cibleLettres.indexOf(lettre);
        if (index > -1) {
          if (nouvelleEtatLettres[lettre] !== 'correct') {
            nouvelleEtatLettres[lettre] = 'present';
          }
          cibleLettres[index] = null;
        } else {
          if (!nouvelleEtatLettres[lettre]) {
            nouvelleEtatLettres[lettre] = 'absent';
          }
        }
      }
    });

    setRevealedRows([...revealedRows, ligneActuelle]);
    
    setTimeout(() => {
      setEtatLettres(nouvelleEtatLettres);
      
      if (motSaisi === motCible) {
        handleEnd(true);
      } else if (ligneActuelle === LIGNES - 1) {
        handleEnd(false);
      } else {
        setLigneActuelle(ligneActuelle + 1);
      }
    }, COLONNES * 300);
  };

  const faireTrembler = () => {
    setShakeLigne(ligneActuelle);
    setTimeout(() => setShakeLigne(-1), 500);
  };

  const onKeyPress = useCallback((key) => {
    if (gameOverRef.current || !langue) return;
    
    // Démarrer le chrono à la première frappe
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    
    const mot = grille[ligneActuelle];
    
    if (key === 'ENTRER' || key === 'Enter') {
      validerLigne();
    } else if (key === 'EFFACER' || key === 'Backspace') {
      if (mot.length > 0) {
        const nouvelleGrille = [...grille];
        nouvelleGrille[ligneActuelle] = mot.slice(0, -1);
        setGrille(nouvelleGrille);
      }
    } else if (/^[A-Z]$/i.test(key) && key.length === 1) {
      if (mot.length < COLONNES) {
        const nouvelleGrille = [...grille];
        nouvelleGrille[ligneActuelle] = mot + key.toUpperCase();
        setGrille(nouvelleGrille);
      }
    }
  }, [grille, ligneActuelle, langue, dailyInfo, etatLettres, revealedRows, handleEnd]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      onKeyPress(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const getCouleurCase = (motSaisi, index, estRevele) => {
    if (!estRevele) return '';
    const motCible = dailyInfo.mot;
    const lettre = motSaisi[index];
    if (lettre === motCible[index]) return styles.correct;
    
    let countInCible = motCible.split('').filter(c => c === lettre).length;
    let countCorrectBefore = motSaisi.split('').filter((c, i) => c === lettre && motCible[i] === lettre).length;
    let countPresentBefore = motSaisi.split('').filter((c, i) => c === lettre && i <= index && motCible[i] !== lettre).length;
    
    if (countInCible > countCorrectBefore && countPresentBefore <= (countInCible - countCorrectBefore)) {
      return styles.present;
    }
    return styles.absent;
  };

  // ─── ÉCRAN DE SÉLECTION DE LANGUE / BLOCAGE ───
  if (langue === "ALREADY_PLAYED") {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#fff", background: "rgba(0,0,0,0.5)", borderRadius: "16px", maxWidth: "500px", margin: "2rem auto" }}>
        <h2 style={{ fontFamily: "var(--font-manga)", fontSize: "2.5rem", marginBottom: "1rem", color: "#f39c12" }}>DÉJÀ JOUÉ</h2>
        <p style={{ opacity: 0.8, fontSize: "1.2rem", marginBottom: "2rem" }}>Tu as complété les deux Fennec Words du jour (FR & EN) !</p>
        <p style={{ opacity: 0.6, fontStyle: "italic" }}>Reviens demain pour de nouveaux mots.</p>
        <button 
          onClick={() => navigate('/arcade')}
          style={{ marginTop: "2rem", padding: "1rem 2rem", fontSize: "1.2rem", background: "#3498db", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          Retour à l'Arcade
        </button>
      </div>
    );
  }

  if (!langue) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#fff", background: "rgba(0,0,0,0.5)", borderRadius: "16px", maxWidth: "500px", margin: "2rem auto" }}>
        <h2 style={{ fontFamily: "var(--font-manga)", fontSize: "2.5rem", marginBottom: "1rem" }}>MOT DU JOUR</h2>
        <p style={{ opacity: 0.8, marginBottom: "2rem" }}>Tu peux jouer une partie en Français et une partie en Anglais par jour.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          {!completedLangs.includes("FR") ? (
            <button 
              onClick={() => startDailyGame("FR")}
              style={{ padding: "1rem 2rem", fontSize: "1.2rem", background: "#3498db", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
            >
              🇫🇷 Français
            </button>
          ) : (
            <button disabled style={{ padding: "1rem 2rem", fontSize: "1.2rem", background: "#7f8c8d", color: "#bdc3c7", border: "none", borderRadius: "8px", cursor: "not-allowed", fontWeight: "bold" }}>
              🇫🇷 Fait !
            </button>
          )}

          {!completedLangs.includes("EN") ? (
            <button 
              onClick={() => startDailyGame("EN")}
              style={{ padding: "1rem 2rem", fontSize: "1.2rem", background: "#e63946", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
            >
              🇬🇧 English
            </button>
          ) : (
            <button disabled style={{ padding: "1rem 2rem", fontSize: "1.2rem", background: "#7f8c8d", color: "#bdc3c7", border: "none", borderRadius: "8px", cursor: "not-allowed", fontWeight: "bold" }}>
              🇬🇧 Fait !
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wordleBoard}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "0 1rem", color: "rgba(255,255,255,0.5)", fontWeight: "bold" }}>
        <span>Fennec Word #{dailyInfo.editionNumber}</span>
        <span>{langue === "FR" ? "🇫🇷" : "🇬🇧"}</span>
      </div>

      <div className={styles.grid}>
        {grille.map((mot, indexLigne) => {
          const estLigneActuelle = indexLigne === ligneActuelle;
          const estRevele = revealedRows.includes(indexLigne);
          const classShake = shakeLigne === indexLigne ? styles.shake : '';
          
          return (
            <div key={indexLigne} className={`${styles.row} ${classShake}`}>
              {Array.from({ length: COLONNES }).map((_, indexCol) => {
                const lettre = mot[indexCol] || '';
                const couleurClass = getCouleurCase(mot, indexCol, estRevele);
                const flipClass = estRevele ? styles.flip : '';
                const activeClass = (estLigneActuelle && lettre) ? styles.active : '';
                const animationDelay = estRevele && indexLigne === revealedRows[revealedRows.length - 1] 
                                       ? `${indexCol * 0.1}s` : '0s';

                return (
                  <div 
                    key={indexCol} 
                    className={`${styles.cell} ${couleurClass} ${flipClass} ${activeClass}`}
                    style={{ animationDelay: flipClass ? animationDelay : '0s' }}
                  >
                    {lettre}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className={styles.keyboard}>
        {CLAVIER_LIGNES.map((ligne, i) => (
          <div key={i} className={styles.keyboardRow}>
            {ligne.map((key) => {
              const isWide = key === 'ENTRER' || key === 'EFFACER';
              const stateClass = etatLettres[key] ? styles[etatLettres[key]] : '';
              return (
                <button
                  key={key}
                  className={`${styles.key} ${isWide ? styles.wide : ''} ${stateClass}`}
                  onClick={() => onKeyPress(key)}
                >
                  {key === 'EFFACER' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
