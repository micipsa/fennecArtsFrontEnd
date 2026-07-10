import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "./Toast";
import styles from "./CreerDefiModal.module.css";

export default function CreerDefiModal({ onClose, onCreated }) {
  const [jeux, setJeux] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState([]);
  const [form, setForm] = useState({ defie: null, defieNom: "", jeu: "", miseFM: 0, description: "", type: "classique" });
  const [envoi, setEnvoi] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let actif = true;
    api.get("/api/jeux")
      .then(r => {
        if (actif) setJeux(r.data.data || []);
      })
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    let actif = true;
    if (recherche.length < 2) {
      const run = async () => {
        await Promise.resolve();
        if (actif) {
          setResultats([]);
        }
      };
      run();
      return () => {
        actif = false;
      };
    }
    const t = setTimeout(() => {
      api.get(`/api/users/classement?search=${recherche}`)
        .then(r => {
          if (actif) setResultats(r.data.data?.slice(0, 5) || []);
        })
        .catch(() => {});
    }, 300);
    return () => {
      actif = false;
      clearTimeout(t);
    };
  }, [recherche]);

  const selectionnerJoueur = (j) => {
    setForm({ ...form, defie: j._id, defieNom: j.nom });
    setRecherche("");
    setResultats([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.defie || !form.jeu) return addToast("Sélectionne un joueur et un jeu", "warning");
    setEnvoi(true);
    try {
      await api.post("/api/defis", form);
      addToast("Défi envoyé !", "success");
      onCreated();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur", "error");
    } finally { setEnvoi(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.titre}>⚔️ Créer un défi</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.champ}>
            <label>Adversaire</label>
            {form.defie ? (
              <div className={styles.selected}>
                <span>{form.defieNom}</span>
                <button type="button" onClick={() => setForm({ ...form, defie: null, defieNom: "" })}>✕</button>
              </div>
            ) : (
              <div className={styles.searchWrap}>
                <input type="text" placeholder="Rechercher un joueur..." value={recherche} onChange={e => setRecherche(e.target.value)} />
                {resultats.length > 0 && (
                  <div className={styles.dropdown}>
                    {resultats.map(j => <button key={j._id} type="button" onClick={() => selectionnerJoueur(j)}>{j.nom}</button>)}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.champ}>
            <label>Jeu</label>
            <select value={form.jeu} onChange={e => setForm({ ...form, jeu: e.target.value })} required>
              <option value="">Choisir un jeu</option>
              {jeux.map(j => <option key={j._id} value={j._id}>{j.nom}</option>)}
            </select>
          </div>
          <div className={styles.row}>
            <div className={styles.champ}>
              <label>Mise FM</label>
              <input type="number" min="0" value={form.miseFM} onChange={e => setForm({ ...form, miseFM: Number(e.target.value) })} />
            </div>
            <div className={styles.champ}>
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="classique">Classique</option>
                <option value="showcase">Showcase</option>
                <option value="thematique">Thématique</option>
              </select>
            </div>
          </div>
          <div className={styles.champ}>
            <label>Description (optionnel)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Règles, conditions..." rows={2} />
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>Annuler</button>
            <button type="submit" disabled={envoi} className={styles.btnSubmit}>{envoi ? "Envoi..." : "Envoyer le défi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
