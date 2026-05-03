import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { calculerRang } from "../../utils/rangs";
import styles from "./AvatarMenu.module.css";

export default function AvatarMenu({ utilisateur, onDeconnexion }) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOuvert(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const rang = calculerRang(utilisateur.points || 0);
  const initiale = utilisateur.nom?.[0]?.toUpperCase() || "?";

  const handleClick = (path) => { setOuvert(false); navigate(path); };
  const handleDecon = () => { setOuvert(false); onDeconnexion(); };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.avatarBtn} onClick={() => setOuvert(!ouvert)} style={{ "--rang-couleur": rang.couleur }}>
        <span className={styles.avatar}>{initiale}</span>
      </button>
      {ouvert && (
        <div className={styles.dropdown}>
          <div className={styles.entete}>
            <div className={styles.avatarLarge} style={{ "--rang-couleur": rang.couleur }}>
              <span>{initiale}</span>
            </div>
            <div className={styles.infos}>
              <span className={styles.nom}>{utilisateur.nom}</span>
              <span className={styles.rang} style={{ color: rang.couleur }}>{rang.affichage}</span>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>XP</span>
              <span className={styles.statValeur}>{utilisateur.points || 0}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>FM</span>
              <span className={styles.statValeur} style={{ color: "var(--couleur-accent)" }}>💰 {utilisateur.fm || 0}</span>
            </div>
          </div>
          <div className={styles.menu}>
            <button onClick={() => handleClick("/profil")}>👤 Mon profil</button>
            <button onClick={() => handleClick("/mon-activite")}>📊 Mon activité</button>
            <button onClick={() => handleClick("/inventaire")}>🎒 Inventaire</button>
            <button onClick={() => handleClick("/notifications")}>🔔 Notifications</button>
            <button onClick={() => handleClick("/codes")}>🎟️ Codes promo</button>
            {utilisateur.role === "admin" && (
              <button onClick={() => handleClick("/dashboard")}>⚙️ Dashboard</button>
            )}
            {(utilisateur.role === "organisateur" || utilisateur.estOrganisateur) && utilisateur.role !== "admin" && (
              <button onClick={() => handleClick("/dashboard/missions")}>⚙️ Dashboard</button>
            )}
            {utilisateur.role === "redacteur" && (
              <button onClick={() => handleClick("/redacteur")}>📝 Mes articles</button>
            )}
            <div className={styles.separateur} />
            <button onClick={handleDecon} className={styles.deconnexion}>🚪 Déconnexion</button>
          </div>
        </div>
      )}
    </div>
  );
}
