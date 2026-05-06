import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CommandPalette.module.css";

const COMMANDES = [
  { groupe: "Navigation", items: [
    { label: "Accueil", icone: "🏠", path: "/", keywords: "home accueil" },
    { label: "Articles", icone: "📰", path: "/articles", keywords: "articles blog" },
    { label: "Tournois", icone: "🏆", path: "/tournaments", keywords: "tournois esport" },
    { label: "Événements", icone: "📅", path: "/events", keywords: "events evenements" },
    { label: "WebTV", icone: "📺", path: "/webtv", keywords: "webtv stream live" },
    { label: "Missions", icone: "🎯", path: "/missions", keywords: "missions benevolat" },
    { label: "Classement", icone: "🏅", path: "/classement", keywords: "classement leaderboard" },
    { label: "Communauté", icone: "👥", path: "/communaute", keywords: "communaute membres" },
    { label: "Agenda", icone: "📆", path: "/agenda", keywords: "agenda calendrier" },
    { label: "Saisons", icone: "🗓️", path: "/saisons", keywords: "saisons" },
    { label: "Store", icone: "🛒", path: "/store", keywords: "boutique store fm" },
    { label: "Lootbox", icone: "🎁", path: "/lootbox", keywords: "lootbox coffre gacha" },
    { label: "Défis", icone: "⚔️", path: "/defis", keywords: "defis 1v1" },
    { label: "Salle d'arcade", icone: "🕹️", path: "/arcade", keywords: "arcade jeux pong snake quiz memory wordle" },
  ]},
  { groupe: "Mon compte", items: [
    { label: "Mon profil", icone: "👤", path: "/profil", keywords: "profil compte" },
    { label: "Mon activité", icone: "📊", path: "/mon-activite", keywords: "activite stats" },
    { label: "Notifications", icone: "🔔", path: "/notifications", keywords: "notifications" },
    { label: "Inventaire", icone: "🎒", path: "/inventaire", keywords: "inventaire items" },
    { label: "Codes promo", icone: "🎟️", path: "/codes", keywords: "code promo qr" },
    { label: "Dojo Play", icone: "🎮", path: "/play", keywords: "play dojo" },
  ]},
];

export default function CommandPalette({ ouvert, onFermer }) {
  const [recherche, setRecherche] = useState("");
  const [indexActif, setIndexActif] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (ouvert && inputRef.current) inputRef.current.focus();
    if (!ouvert) { setRecherche(""); setIndexActif(0); }
  }, [ouvert]);

  const itemsFiltres = COMMANDES.flatMap(g =>
    g.items
      .filter(i => i.label.toLowerCase().includes(recherche.toLowerCase()) ||
                   i.keywords.includes(recherche.toLowerCase()))
      .map(i => ({ ...i, groupe: g.groupe }))
  );

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onFermer();
    if (e.key === "ArrowDown") { e.preventDefault(); setIndexActif(i => Math.min(i + 1, itemsFiltres.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIndexActif(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && itemsFiltres[indexActif]) {
      navigate(itemsFiltres[indexActif].path);
      onFermer();
    }
  };

  if (!ouvert) return null;

  return (
    <div className={styles.overlay} onClick={onFermer}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <span className={styles.icone}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Tape une commande ou cherche..."
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setIndexActif(0); }}
            onKeyDown={handleKeyDown}
            className={styles.input}
          />
          <span className={styles.kbd}>ESC</span>
        </div>
        <div className={styles.resultats}>
          {itemsFiltres.length === 0 ? (
            <div className={styles.vide}>Aucun résultat</div>
          ) : itemsFiltres.map((item, i) => (
            <div
              key={item.path}
              className={`${styles.item} ${i === indexActif ? styles.actif : ""}`}
              onClick={() => { navigate(item.path); onFermer(); }}
              onMouseEnter={() => setIndexActif(i)}
            >
              <span className={styles.itemIcone}>{item.icone}</span>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.itemGroupe}>{item.groupe}</span>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <span><span className={styles.kbd}>↑↓</span> naviguer</span>
          <span><span className={styles.kbd}>↵</span> sélectionner</span>
          <span><span className={styles.kbd}>ESC</span> fermer</span>
        </div>
      </div>
    </div>
  );
}
