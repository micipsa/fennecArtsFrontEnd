import { useState, useEffect } from "react";
import data from "../../data/citations.json";
import styles from "./CitationAleatoire.module.css";

function CitationAleatoire() {
  const [citation, setCitation] = useState(null);
  const [visible, setVisible] = useState(true);

  const changerCitation = () => {
    setVisible(false);
    setTimeout(() => {
      const index = Math.floor(Math.random() * data.citations.length);
      setCitation(data.citations[index]);
      setVisible(true);
    }, 500);
  };

  useEffect(() => {
    let actif = true;
    const run = async () => {
      await Promise.resolve();
      if (actif) {
        changerCitation();
      }
    };
    run();
    const intervalle = setInterval(() => {
      if (actif) changerCitation();
    }, 10000);
    return () => {
      actif = false;
      clearInterval(intervalle);
    };
  }, []);

  if (!citation) return null;

  return (
    <div className={styles.bande}>
      <div
        className={`${styles.conteneur} ${visible ? styles.visible : styles.cache}`}>
        <div className={styles.bulle}>
          <p className={styles.texte}>« {citation.texte} »</p>
        </div>
        <div className={styles.personnage}>
          <span className={styles.auteur}>{citation.auteur}</span>
          <span className={styles.oeuvre}>{citation.oeuvre}</span>
        </div>
      </div>
    </div>
  );
}

export default CitationAleatoire;
