import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../components/UI/Toast";
import styles from "./OngletGaming.module.css";

export default function OngletGaming({ profil, onUpdate }) {
  const [jeux, setJeux] = useState([]);
  const [jeuxPreferes, setJeuxPreferes] = useState(profil?.jeuxPreferes || []);
  const [setupGaming, setSetupGaming] = useState(profil?.setupGaming || {});
  const [pseudos, setPseudos] = useState(profil?.pseudosExternes || {});
  const [recherche, setRecherche] = useState("");
  const [sauvegarde, setSauvegarde] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    api.get("/api/jeux").then(r => setJeux(r.data.data || []));
  }, []);

  const ajouterJeu = (jeu) => {
    if (jeuxPreferes.some(jp => jp.jeu === jeu._id || jp.jeu?._id === jeu._id)) return;
    setJeuxPreferes([...jeuxPreferes, { jeu: jeu._id, niveau: "Débutant", mains: [] }]);
    setRecherche("");
  };

  const ajouterJeuCustom = () => {
    const nom = prompt("Nom du jeu ?");
    if (!nom) return;
    setJeuxPreferes([...jeuxPreferes, { nomLibre: nom, niveau: "Débutant", mains: [] }]);
  };

  const modifierJeu = (index, champ, valeur) => {
    const copie = [...jeuxPreferes];
    copie[index] = { ...copie[index], [champ]: valeur };
    setJeuxPreferes(copie);
  };

  const supprimerJeu = (index) => setJeuxPreferes(jeuxPreferes.filter((_, i) => i !== index));

  const monter = (index) => {
    if (index === 0) return;
    const copie = [...jeuxPreferes];
    [copie[index - 1], copie[index]] = [copie[index], copie[index - 1]];
    setJeuxPreferes(copie);
  };

  const sauvegarder = async () => {
    setSauvegarde(true);
    try {
      await api.patch("/api/users/me/profil-etendu", { jeuxPreferes, setupGaming, pseudosExternes: pseudos });
      addToast("Profil gaming sauvegardé", "success");
      onUpdate?.();
    } catch (err) {
      addToast("Erreur de sauvegarde", "error");
    } finally { setSauvegarde(false); }
  };

  const jeuxFiltres = recherche
    ? jeux.filter(j => j.nom.toLowerCase().includes(recherche.toLowerCase()) && !jeuxPreferes.some(jp => (jp.jeu === j._id || jp.jeu?._id === j._id)))
    : [];

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h3 className={styles.titre}>🎮 Mes jeux préférés</h3>
        <div className={styles.recherche}>
          <input type="text" placeholder="Rechercher un jeu..." value={recherche} onChange={(e) => setRecherche(e.target.value)} className={styles.input} />
          {jeuxFiltres.length > 0 && (
            <div className={styles.suggestions}>
              {jeuxFiltres.slice(0, 8).map(j => (
                <button key={j._id} className={styles.suggestion} onClick={() => ajouterJeu(j)} style={{ borderLeftColor: j.couleur }}>{j.nom}</button>
              ))}
            </div>
          )}
          <button className={styles.btnCustom} onClick={ajouterJeuCustom}>+ Jeu custom</button>
        </div>
        <div className={styles.jeuxListe}>
          {jeuxPreferes.map((jp, i) => {
            const jeu = jeux.find(j => j._id === jp.jeu || j._id === jp.jeu?._id);
            return (
              <div key={i} className={`${styles.jeuCard} ${i < 3 ? styles.top3 : ""}`}>
                <div className={styles.jeuHeader}>
                  <span className={styles.jeuNom}>{jeu?.nom || jp.nomLibre}</span>
                  <div className={styles.jeuActions}>
                    <button onClick={() => monter(i)} disabled={i === 0}>↑</button>
                    <button onClick={() => supprimerJeu(i)}>🗑️</button>
                  </div>
                </div>
                <div className={styles.jeuChamps}>
                  <select value={jp.niveau || "Débutant"} onChange={(e) => modifierJeu(i, "niveau", e.target.value)}>
                    <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option><option>Pro</option>
                  </select>
                  <input type="text" placeholder="Rang in-game" value={jp.rangIngame || ""} onChange={(e) => modifierJeu(i, "rangIngame", e.target.value)} />
                  <input type="text" placeholder="Pseudo dans le jeu" value={jp.pseudoIngame || ""} onChange={(e) => modifierJeu(i, "pseudoIngame", e.target.value)} />
                  <input type="text" placeholder="Mains (virgule)" value={(jp.mains || []).join(", ")} onChange={(e) => modifierJeu(i, "mains", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>🖥️ Mon setup</h3>
        <div className={styles.setup}>
          <select value={setupGaming.plateforme || ""} onChange={(e) => setSetupGaming({ ...setupGaming, plateforme: e.target.value || null })}>
            <option value="">Plateforme principale</option>
            <option>PC</option><option>PS5</option><option>PS4</option><option>Xbox</option><option>Switch</option><option>Mobile</option><option>Multi</option>
          </select>
          <input type="text" placeholder="Clavier" value={setupGaming.clavier || ""} onChange={(e) => setSetupGaming({ ...setupGaming, clavier: e.target.value })} />
          <input type="text" placeholder="Souris" value={setupGaming.souris || ""} onChange={(e) => setSetupGaming({ ...setupGaming, souris: e.target.value })} />
          <input type="text" placeholder="Casque" value={setupGaming.casque || ""} onChange={(e) => setSetupGaming({ ...setupGaming, casque: e.target.value })} />
          <input type="text" placeholder="Écran" value={setupGaming.ecran || ""} onChange={(e) => setSetupGaming({ ...setupGaming, ecran: e.target.value })} />
          <textarea placeholder="Notes additionnelles..." value={setupGaming.notes || ""} onChange={(e) => setSetupGaming({ ...setupGaming, notes: e.target.value })} />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>🎯 Mes pseudos in-game</h3>
        <div className={styles.pseudos}>
          {[
            { key: "riotId", label: "Riot ID" }, { key: "steam", label: "Steam" },
            { key: "discord", label: "Discord" }, { key: "battleNet", label: "Battle.net" },
            { key: "epicGames", label: "Epic Games" }, { key: "psn", label: "PSN" },
            { key: "xboxLive", label: "Xbox Live" }, { key: "nintendoId", label: "Nintendo Online" },
          ].map(({ key, label }) => (
            <div key={key} className={styles.pseudoChamp}>
              <label>{label}</label>
              <input type="text" value={pseudos[key] || ""} onChange={(e) => setPseudos({ ...pseudos, [key]: e.target.value })} />
            </div>
          ))}
        </div>
      </section>

      <button className={styles.btnSauvegarder} onClick={sauvegarder} disabled={sauvegarde}>
        {sauvegarde ? "Sauvegarde..." : "💾 Sauvegarder"}
      </button>
    </div>
  );
}
