import { useState, useEffect } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/UI/Toast";
import CreerDefiModal from "../components/UI/CreerDefiModal";
import { Link } from "react-router-dom";
import styles from "./DefisPage.module.css";

const STATUT_LABELS = {
  en_attente: "⏳ En attente",
  accepte: "⚔️ En cours",
  refuse: "❌ Refusé",
  termine: "✅ Terminé",
  litige: "⚠️ Litige",
  annule: "🚫 Annulé",
};

export default function DefisPage() {
  const { utilisateur } = useAuth();
  const [defis, setDefis] = useState([]);
  const [onglet, setOnglet] = useState("recus");
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const { addToast } = useToast();

  const charger = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/defis");
      setDefis(res.data.data);
    } catch (err) { addToast("Erreur chargement défis", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { charger(); }, []);

  const accepter = async (id) => {
    try { await api.patch(`/api/defis/${id}/accepter`); addToast("Défi accepté !", "success"); charger(); }
    catch (err) { addToast(err.response?.data?.message || "Erreur", "error"); }
  };
  const refuser = async (id) => {
    try { await api.patch(`/api/defis/${id}/refuser`); addToast("Défi refusé", "info"); charger(); }
    catch (err) { addToast(err.response?.data?.message || "Erreur", "error"); }
  };
  const annuler = async (id) => {
    try { await api.patch(`/api/defis/${id}/annuler`); addToast("Défi annulé", "info"); charger(); }
    catch (err) { addToast(err.response?.data?.message || "Erreur", "error"); }
  };

  const userId = utilisateur?.id;
  const recus = defis.filter(d => d.defie?._id === userId);
  const envoyes = defis.filter(d => d.challenger?._id === userId);
  const historique = defis.filter(d => ["termine", "annule", "refuse"].includes(d.statut));
  const current = onglet === "recus" ? recus : onglet === "envoyes" ? envoyes : historique;

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.entete}>
          <div>
            <h1 className={styles.titre}>⚔️ Défis 1v1</h1>
            <p className={styles.sousTitre}>Défie d'autres joueurs et mise tes FM</p>
          </div>
          <button className={styles.btnCreer} onClick={() => setModalOuvert(true)}>+ Nouveau défi</button>
        </div>

        <div className={styles.onglets}>
          {[
            { id: "recus", label: `Reçus (${recus.length})` },
            { id: "envoyes", label: `Envoyés (${envoyes.length})` },
            { id: "historique", label: "Historique" },
          ].map(o => (
            <button key={o.id} className={`${styles.onglet} ${onglet === o.id ? styles.ongletActif : ""}`} onClick={() => setOnglet(o.id)}>
              {o.label}
            </button>
          ))}
        </div>

        {loading ? <p className={styles.vide}>Chargement...</p> : current.length === 0 ? (
          <p className={styles.vide}>Aucun défi dans cette catégorie.</p>
        ) : (
          <div className={styles.grid}>
            {current.map(d => (
              <div key={d._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.jeuTag} style={{ background: d.jeu?.couleur || "#888" }}>{d.jeu?.nom || "?"}</span>
                  <span className={styles.statut}>{STATUT_LABELS[d.statut]}</span>
                </div>
                <div className={styles.versus}>
                  <span className={styles.joueur}>{d.challenger?.nom}</span>
                  <span className={styles.vs}>VS</span>
                  <span className={styles.joueur}>{d.defie?.nom}</span>
                </div>
                {d.miseFM > 0 && <div className={styles.mise}>🪙 Mise : {d.miseFM} FM</div>}
                {d.description && <p className={styles.desc}>{d.description}</p>}
                {d.vainqueur && <div className={styles.vainqueur}>🏆 Vainqueur : {d.vainqueur === d.challenger?._id ? d.challenger?.nom : d.defie?.nom}</div>}

                <div className={styles.cardActions}>
                  {d.statut === "en_attente" && d.defie?._id === userId && (
                    <>
                      <button onClick={() => accepter(d._id)} className={styles.btnAccepter}>Accepter</button>
                      <button onClick={() => refuser(d._id)} className={styles.btnRefuser}>Refuser</button>
                    </>
                  )}
                  {d.statut === "en_attente" && d.challenger?._id === userId && (
                    <button onClick={() => annuler(d._id)} className={styles.btnRefuser}>Annuler</button>
                  )}
                  {d.statut === "accepte" && <Link to={`/defis/${d._id}`} className={styles.btnAccepter}>Soumettre score</Link>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOuvert && <CreerDefiModal onClose={() => setModalOuvert(false)} onCreated={() => { setModalOuvert(false); charger(); }} />}
    </div>
  );
}
