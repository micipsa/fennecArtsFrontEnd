import { useState, useEffect } from "react";
import data from "../../data/anecdotes.json";
import styles from "./AnecdoteAleatoire.module.css";

function AnecdoteAleatoire() {
  const [anecdote, setAnecdote] = useState(null);
  const [visible, setVisible] = useState(true);

  const changerAnecdote = () => {
    setVisible(false);
    setTimeout(() => {
      const index = Math.floor(Math.random() * data.anecdotes.length);
      setAnecdote(data.anecdotes[index]);
      setVisible(true);
    }, 500);
  };

  useEffect(() => {
    changerAnecdote();
    const intervalle = setInterval(changerAnecdote, 12000);
    return () => clearInterval(intervalle);
  }, []);

  if (!anecdote) return null;

  return (
    <div className={styles.bande}>
      <div
        className={`${styles.carte} ${visible ? styles.visible : styles.cache}`}>
        <div className={styles.header}>
          <span className={styles.dot}></span>
          <span className={styles.tag}>Le savais-tu ?</span>
          <span className={styles.categorie}>{anecdote.categorie}</span>
        </div>
        <p className={styles.texte}>{anecdote.texte}</p>
        <div className={styles.footer}>
          <div className={styles.ligne}></div>
          <p className={styles.sujet}>{anecdote.sujet}</p>
          <div className={styles.ligne}></div>
        </div>
      </div>
    </div>
  );
}

export default AnecdoteAleatoire;
