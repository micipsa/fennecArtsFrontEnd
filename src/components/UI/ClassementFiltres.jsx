import { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./ClassementFiltres.module.css";

export default function ClassementFiltres({ onFiltrer }) {
  const [jeux, setJeux] = useState([]);
  const [actif, setActif] = useState("global");

  useEffect(() => {
    api.get("/api/jeux").then(r => setJeux(r.data.data || []));
  }, []);

  const selectionner = (val) => {
    setActif(val);
    onFiltrer(val);
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.filtre} ${actif === "global" ? styles.actif : ""}`}
        onClick={() => selectionner("global")}
      >
        🌍 Global
      </button>
      {jeux.map(j => (
        <button
          key={j._id}
          className={`${styles.filtre} ${actif === j._id ? styles.actif : ""}`}
          style={{ "--couleur-jeu": j.couleur }}
          onClick={() => selectionner(j._id)}
        >
          {j.iconeUrl && <img src={j.iconeUrl} alt={j.nom} className={styles.icone} />}
          {j.nom}
        </button>
      ))}
    </div>
  );
}
