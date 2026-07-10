import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import styles from "./DashboardCodesPromo.module.css";
import qStyles from "./DashboardAnimations.module.css";
import { toast } from "react-hot-toast";

const QUESTION_VIDE = { text: "", options: ["", "", "", ""], correctIndex: 0 };

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
    config: { questions: [], question: "", options: "" }
  });
  const [questions, setQuestions] = useState([{ ...QUESTION_VIDE }]);

  const fetchAnims = useCallback(async () => {
    try {
      const res = await api.get("/api/animations");
      setAnimations(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let actif = true;
    const run = async () => {
      await Promise.resolve();
      if (actif) {
        fetchAnims();
      }
    };
    run();
    return () => {
      actif = false;
    };
  }, [fetchAnims]);

  const resetForm = () => {
    setFormData({
      titre: "", description: "", type: "quizz",
      recompenseXP: 50, recompenseFM: 10,
      config: { questions: [], question: "", options: "" }
    });
    setQuestions([{ ...QUESTION_VIDE }]);
  };

  const openModal = () => { resetForm(); setShowModal(true); };

  // ── Questions helpers ──
  const updateQuestion = (idx, field, value) => {
    const q = [...questions];
    q[idx] = { ...q[idx], [field]: value };
    setQuestions(q);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const q = [...questions];
    q[qIdx].options = [...q[qIdx].options];
    q[qIdx].options[optIdx] = value;
    setQuestions(q);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correctIndex: 0 }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return toast.error("Il faut au moins une question.");
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx, dir) => {
    const q = [...questions];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= q.length) return;
    [q[idx], q[newIdx]] = [q[newIdx], q[idx]];
    setQuestions(q);
  };

  // ── Soumission ──
  const handleCreate = async (e) => {
    e.preventDefault();

    if (formData.type === "quizz") {
      // Validation des questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim()) return toast.error(`Question ${i + 1} : le texte est vide.`);
        const filledOpts = q.options.filter(o => o.trim());
        if (filledOpts.length < 2) return toast.error(`Question ${i + 1} : au moins 2 options.`);
        if (!q.options[q.correctIndex]?.trim()) return toast.error(`Question ${i + 1} : la bonne réponse est vide.`);
      }
    }

    const config = formData.type === "quizz"
      ? {
          questions: questions.map(q => ({
            text: q.text.trim(),
            options: q.options.filter(o => o.trim()),
            correctIndex: q.correctIndex
          }))
        }
      : {
          question: formData.config.question,
          options: formData.config.options.split(",").map(o => o.trim()).filter(Boolean)
        };

    try {
      await api.post("/api/animations", { ...formData, config });
      toast.success("Animation créée !");
      setShowModal(false);
      fetchAnims();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ?")) return;
    try {
      await api.delete(`/api/animations/${id}`);
      toast.success("Supprimé.");
      fetchAnims();
    } catch (err) { toast.error("Erreur."); }
  };

  const toggleActif = async (anim) => {
    try {
      await api.patch(`/api/animations/${anim._id}`, { actif: !anim.actif });
      toast.success(anim.actif ? "Désactivé" : "Activé");
      fetchAnims();
    } catch (err) { toast.error("Erreur."); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.entete}>
        <h1 className={styles.titre}>Gestion Dojo Play</h1>
        <button className={styles.btnCreer} onClick={openModal}>
          + Nouvelle Animation
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Questions</th>
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
                <td>{anim.type === "quizz" ? `${anim.config?.questions?.length || 0} Q` : "—"}</td>
                <td>
                  <span className={styles.recompXP}>+{anim.recompenseXP} XP</span>
                  <span className={styles.recompFM}>+{anim.recompenseFM} FM</span>
                </td>
                <td className={anim.actif ? styles.statutActif : styles.statutInactif}>
                  {anim.actif ? "Actif" : "Inactif"}
                </td>
                <td className={styles.actionsCell}>
                  <button onClick={() => toggleActif(anim)} className={styles.btnToggle} title={anim.actif ? "Désactiver" : "Activer"}>
                    {anim.actif ? "⏸" : "▶️"}
                  </button>
                  <button onClick={() => handleDelete(anim._id)} className={styles.btnSupp} title="Supprimer">🗑️</button>
                </td>
              </tr>
            ))}
            {animations.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.5)" }}>
                  Aucune animation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══════ Modale de création ══════ */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${qStyles.modalLarge}`}>
            <h2>Créer une animation</h2>
            <form onSubmit={handleCreate} className={styles.formGrid}>
              <label>
                Titre
                <input type="text" placeholder="Ex: Quiz de la semaine" required
                  value={formData.titre}
                  onChange={e => setFormData({...formData, titre: e.target.value})}
                />
              </label>

              <label>
                Description courte
                <input type="text" placeholder="Ex: Gagnez des XP en répondant..." required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </label>

              <label>
                Type d'animation
                <select value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="quizz">Quizz</option>
                  <option value="sondage">Sondage</option>
                </select>
              </label>

              <div style={{ display: "flex", gap: "1rem" }}>
                <label style={{ flex: 1 }}>
                  Récompense XP
                  <input type="number" min="0" value={formData.recompenseXP}
                    onChange={e => setFormData({...formData, recompenseXP: Number(e.target.value)})} />
                </label>
                <label style={{ flex: 1 }}>
                  Récompense FM
                  <input type="number" min="0" value={formData.recompenseFM}
                    onChange={e => setFormData({...formData, recompenseFM: Number(e.target.value)})} />
                </label>
              </div>

              {formData.type === "sondage" ? (
                <>
                  <label>
                    La question du sondage
                    <input type="text" placeholder="Ex: Quel jeu préférez-vous ?" required
                      onChange={e => setFormData({...formData, config: {...formData.config, question: e.target.value}})}
                    />
                  </label>
                  <label>
                    Options (séparées par des virgules)
                    <input type="text" placeholder="Ex: Valorant, LoL, CS2" required
                      onChange={e => setFormData({...formData, config: {...formData.config, options: e.target.value}})}
                    />
                  </label>
                </>
              ) : (
                /* ══════ ÉDITEUR DE QUIZ VISUEL ══════ */
                <div className={qStyles.quizEditor}>
                  <div className={qStyles.quizHeader}>
                    <h3 className={qStyles.quizTitre}>📝 Questions ({questions.length})</h3>
                    <button type="button" className={qStyles.btnAddQ} onClick={addQuestion}>
                      + Ajouter une question
                    </button>
                  </div>

                  <div className={qStyles.questionsList}>
                    {questions.map((q, qIdx) => (
                      <div key={qIdx} className={qStyles.questionCard}>
                        <div className={qStyles.questionHeader}>
                          <span className={qStyles.questionNum}>Q{qIdx + 1}</span>
                          <div className={qStyles.questionActions}>
                            <button type="button" onClick={() => moveQuestion(qIdx, -1)} disabled={qIdx === 0} className={qStyles.btnMove}>↑</button>
                            <button type="button" onClick={() => moveQuestion(qIdx, 1)} disabled={qIdx === questions.length - 1} className={qStyles.btnMove}>↓</button>
                            <button type="button" onClick={() => removeQuestion(qIdx)} className={qStyles.btnRemoveQ}>✕</button>
                          </div>
                        </div>

                        <input
                          type="text"
                          className={qStyles.questionInput}
                          placeholder="Écris ta question ici..."
                          value={q.text}
                          onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                        />

                        <div className={qStyles.optionsGrid}>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`${qStyles.optionRow} ${q.correctIndex === optIdx ? qStyles.optionCorrect : ""}`}>
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={q.correctIndex === optIdx}
                                onChange={() => updateQuestion(qIdx, "correctIndex", optIdx)}
                                className={qStyles.radioInput}
                                title="Marquer comme bonne réponse"
                              />
                              <input
                                type="text"
                                className={qStyles.optionInput}
                                placeholder={`Option ${optIdx + 1}`}
                                value={opt}
                                onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                              />
                              {q.correctIndex === optIdx && <span className={qStyles.correctBadge}>✓</span>}
                            </div>
                          ))}
                        </div>

                        <p className={qStyles.hintCorrect}>
                          🎯 Cliquez sur le rond pour sélectionner la bonne réponse
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnAnnuler} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className={styles.btnCreer}>
                  {formData.type === "quizz" ? `Créer le quiz (${questions.length} questions)` : "Créer le sondage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
