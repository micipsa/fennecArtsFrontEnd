import { useState, useEffect } from "react";
import api from "../services/api";
import styles from "./DashboardCodesPromo.module.css"; // Réutilisation des styles de tableau
import { toast } from "react-hot-toast";

export default function DashboardAnimations() {
  const [animations, setAnimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    type: "quizz",
    recompenseXP: 50,
    recompenseFM: 10,
    config: { questions: [], question: "", options: [] }
  });

  useEffect(() => {
    fetchAnims();
  }, []);

  const fetchAnims = async () => {
    try {
      const res = await api.get("/api/animations");
      setAnimations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Préparation de la config selon le type
      let config = {};
      if (formData.type === "quizz") {
        config = { questions: formData.config.questions };
      } else {
        config = { 
          question: formData.config.question, 
          options: formData.config.options.split(",").map(o => o.trim()) 
        };
      }

      await api.post("/api/animations", { ...formData, config });
      toast.success("Animation créée !");
      setShowModal(false);
      fetchAnims();
    } catch (err) {
      toast.error("Erreur.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ?")) return;
    try {
      await api.delete(`/api/animations/${id}`);
      toast.success("Supprimé.");
      fetchAnims();
    } catch (err) {
      toast.error("Erreur.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.entete}>
        <h1 className={styles.titre}>Gestion Dojo Play</h1>
        <button className={styles.btnCreer} onClick={() => setShowModal(true)}>
          + Nouvelle Animation
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Récompenses</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {animations.map(anim => (
              <tr key={anim._id}>
                <td className={styles.codeCell}>{anim.titre}</td>
                <td><span className={styles.typeBadge}>{anim.type}</span></td>
                <td>
                  <span className={styles.recompXP}>+{anim.recompenseXP} XP</span> 
                  <span className={styles.recompFM}>+{anim.recompenseFM} FM</span>
                </td>
                <td className={anim.actif ? styles.statutActif : styles.statutInactif}>
                  {anim.actif ? "Actif" : "Inactif"}
                </td>
                <td className={styles.actionsCell}>
                  <button onClick={() => handleDelete(anim._id)} className={styles.btnSupp} title="Supprimer">🗑️</button>
                </td>
              </tr>
            ))}
            {animations.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.5)" }}>
                  Aucune animation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Créer une animation</h2>
            <form onSubmit={handleCreate} className={styles.formGrid}>
              <label>
                Titre de l'animation
                <input 
                  type="text" 
                  placeholder="Ex: Quiz de la semaine" 
                  required 
                  value={formData.titre}
                  onChange={e => setFormData({...formData, titre: e.target.value})}
                />
              </label>
              
              <label>
                Description courte
                <input 
                  type="text"
                  placeholder="Ex: Gagnez des XP en répondant..." 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </label>
              
              <label>
                Type d'animation
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="quizz">Quizz</option>
                  <option value="sondage">Sondage</option>
                </select>
              </label>

              <div style={{ display: "flex", gap: "1rem" }}>
                <label style={{ flex: 1 }}>
                  Récompense XP
                  <input type="number" min="0" value={formData.recompenseXP} onChange={e => setFormData({...formData, recompenseXP: Number(e.target.value)})} />
                </label>
                <label style={{ flex: 1 }}>
                  Récompense FM
                  <input type="number" min="0" value={formData.recompenseFM} onChange={e => setFormData({...formData, recompenseFM: Number(e.target.value)})} />
                </label>
              </div>

              {formData.type === "sondage" ? (
                <>
                  <label>
                    La question du sondage
                    <input 
                      type="text" 
                      placeholder="Ex: Quel jeu préférez-vous ?" 
                      onChange={e => setFormData({...formData, config: {...formData.config, question: e.target.value}})}
                      required={formData.type === "sondage"}
                    />
                  </label>
                  <label>
                    Options de réponse (séparées par des virgules)
                    <input 
                      type="text" 
                      placeholder="Ex: Valorant, LoL, CS2" 
                      onChange={e => setFormData({...formData, config: {...formData.config, options: e.target.value}})}
                      required={formData.type === "sondage"}
                    />
                  </label>
                </>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "1rem" }}>
                  Note : L'éditeur de quiz complet sera implémenté ultérieurement. Actuellement, la création manuelle d'un quiz nécessite un format JSON, utilisez le script de seed.
                </p>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnAnnuler} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className={styles.btnCreer}>Créer l'animation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
