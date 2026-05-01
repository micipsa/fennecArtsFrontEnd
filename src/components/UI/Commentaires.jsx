import { useState, useEffect } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import styles from "./Commentaires.module.css";

function Commentaires({ cibleId, typeCible }) {
  const { utilisateur } = useAuth();
  const [commentaires, setCommentaires] = useState([]);
  const [reponses, setReponses] = useState([]);
  const [contenu, setContenu] = useState("");
  const [repondreA, setRepondreA] = useState(null);
  const [contenuReponse, setContenuReponse] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get(`/api/commentaires?cible=${cibleId}&type=${typeCible}`)
      .then((res) => {
        setCommentaires(res.data.data || []);
        setReponses(res.data.reponses || []);
      })
      .catch(() => {});
  }, [cibleId, typeCible]);

  const handleEnvoyer = async (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;
    setEnvoi(true);
    try {
      const res = await api.post("/api/commentaires", { contenu, cible: cibleId, typeCible });
      setCommentaires((prev) => [res.data.data, ...prev]);
      setContenu("");
    } catch {
      alert("Erreur lors de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  };

  const handleRepondre = async (e) => {
    e.preventDefault();
    if (!contenuReponse.trim()) return;
    setEnvoi(true);
    try {
      const res = await api.post("/api/commentaires", {
        contenu: contenuReponse,
        cible: cibleId,
        typeCible,
        parent: repondreA,
      });
      setReponses((prev) => [...prev, res.data.data]);
      setContenuReponse("");
      setRepondreA(null);
    } catch {
      alert("Erreur lors de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  };

  const handleSupprimer = async (id, estReponse) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await api.delete(`/api/commentaires/${id}`);
      if (estReponse) {
        setReponses((prev) => prev.filter((r) => r._id !== id));
      } else {
        setCommentaires((prev) => prev.filter((c) => c._id !== id));
        setReponses((prev) => prev.filter((r) => r.parent !== id));
      }
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const peutSupprimer = (auteurId) =>
    utilisateur && (utilisateur._id === auteurId || utilisateur.id === auteurId || utilisateur.role === "admin");

  return (
    <div className={styles.section}>
      <h3 className={styles.titre}>Commentaires ({commentaires.length})</h3>

      {utilisateur ? (
        <form className={styles.formulaire} onSubmit={handleEnvoyer}>
          <textarea
            className={styles.textarea}
            placeholder="Votre commentaire..."
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={3}
            maxLength={1000}
            required
          />
          <button className={styles.btnEnvoyer} type="submit" disabled={envoi}>
            {envoi ? "Envoi..." : "Commenter"}
          </button>
        </form>
      ) : (
        <p className={styles.nonConnecte}>Connectez-vous pour commenter.</p>
      )}

      <div className={styles.liste}>
        {commentaires.length === 0 && (
          <p className={styles.vide}>Aucun commentaire pour l'instant.</p>
        )}
        {commentaires.map((c) => (
          <div key={c._id} className={styles.commentaire}>
            <div className={styles.commentaireEntete}>
              <span className={styles.auteur}>{c.auteur?.nom ?? "Anonyme"}</span>
              <span className={styles.date}>
                {new Date(c.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <p className={styles.contenu}>{c.contenu}</p>
            <div className={styles.actions}>
              {utilisateur && (
                <button
                  className={styles.btnRepondre}
                  onClick={() => setRepondreA(repondreA === c._id ? null : c._id)}>
                  {repondreA === c._id ? "Annuler" : "Répondre"}
                </button>
              )}
              {peutSupprimer(c.auteur?._id) && (
                <button className={styles.btnSupprimer} onClick={() => handleSupprimer(c._id, false)}>
                  Supprimer
                </button>
              )}
            </div>

            {repondreA === c._id && (
              <form className={styles.formulaireReponse} onSubmit={handleRepondre}>
                <textarea
                  className={styles.textarea}
                  placeholder="Votre réponse..."
                  value={contenuReponse}
                  onChange={(e) => setContenuReponse(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  required
                />
                <button className={styles.btnEnvoyer} type="submit" disabled={envoi}>
                  {envoi ? "Envoi..." : "Répondre"}
                </button>
              </form>
            )}

            {reponses.filter((r) => r.parent?.toString() === c._id || r.parent === c._id).map((r) => (
              <div key={r._id} className={styles.reponse}>
                <div className={styles.commentaireEntete}>
                  <span className={styles.auteur}>{r.auteur?.nom ?? "Anonyme"}</span>
                  <span className={styles.date}>
                    {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className={styles.contenu}>{r.contenu}</p>
                {peutSupprimer(r.auteur?._id) && (
                  <button className={styles.btnSupprimer} onClick={() => handleSupprimer(r._id, true)}>
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Commentaires;
