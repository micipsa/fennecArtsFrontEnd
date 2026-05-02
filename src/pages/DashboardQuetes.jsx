import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../components/UI/Toast";
import styles from "./DashboardQuetes.module.css";

const TYPES = [
  { value: "journaliere", label: "Journalière" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "speciale", label: "Spéciale" },
];
const ACTIONS = [
  { value: "commenter", label: "Commenter" },
  { value: "tournoi_inscription", label: "Inscription tournoi" },
  { value: "mission_inscription", label: "Inscription mission" },
  { value: "article_lu", label: "Lire un article" },
  { value: "connexion", label: "Connexion" },
  { value: "checkin", label: "Check-in" },
  { value: "achat_store", label: "Achat store" },
];

const FORM_VIDE = { code: "", nom: "", description: "", type: "journaliere", action: "connexion", objectif: 1, recompenseXP: 10, recompenseFM: 5, actif: true };

export default function DashboardQuetes() {
  const [quetes, setQuetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...FORM_VIDE });
  const [editing, setEditing] = useState(null);
  const [filtreType, setFiltreType] = useState("tous");
  const { addToast } = useToast();

  useEffect(() => { fetchQuetes(); }, []);

  const fetchQuetes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/quetes");
      setQuetes(res.data.data);
    } catch (err) {
      addToast("Erreur chargement quêtes", "error");
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/api/quetes/${editing}`, form);
        addToast("Quête modifiée", "success");
      } else {
        await api.post("/api/quetes", form);
        addToast("Quête créée", "success");
      }
      setForm({ ...FORM_VIDE });
      setEditing(null);
      fetchQuetes();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur", "error");
    }
  };

  const handleEdit = (q) => {
    setEditing(q._id);
    setForm({ code: q.code, nom: q.nom, description: q.description, type: q.type, action: q.action, objectif: q.objectif, recompenseXP: q.recompenseXP, recompenseFM: q.recompenseFM, actif: q.actif });
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette quête ?")) return;
    try {
      await api.delete(`/api/quetes/${id}`);
      addToast("Quête supprimée", "success");
      fetchQuetes();
    } catch (err) { addToast("Erreur suppression", "error"); }
  };

  const toggleActif = async (q) => {
    try {
      await api.patch(`/api/quetes/${q._id}`, { actif: !q.actif });
      fetchQuetes();
    } catch (err) { addToast("Erreur", "error"); }
  };

  const filtered = filtreType === "tous" ? quetes : quetes.filter(q => q.type === filtreType);

  return (
    <div className={styles.container}>
      <h1 className={styles.titre}>Gestion des Quêtes</h1>

      <div className={styles.layout}>
        <div className={styles.formPanel}>
          <h2>{editing ? "Modifier la quête" : "Nouvelle quête"}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Code (slug)</label>
              <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div className={styles.formGroup}>
              <label>Nom</label>
              <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows="2" />
            </div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Action</label>
                <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}>
                  {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Objectif</label>
                <input type="number" min="1" value={form.objectif} onChange={e => setForm({ ...form, objectif: Number(e.target.value) })} />
              </div>
              <div className={styles.formGroup}>
                <label>XP</label>
                <input type="number" min="0" value={form.recompenseXP} onChange={e => setForm({ ...form, recompenseXP: Number(e.target.value) })} />
              </div>
              <div className={styles.formGroup}>
                <label>FM</label>
                <input type="number" min="0" value={form.recompenseFM} onChange={e => setForm({ ...form, recompenseFM: Number(e.target.value) })} />
              </div>
            </div>
            <div className={styles.actions}>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm({ ...FORM_VIDE }); }} className={styles.btnCancel}>Annuler</button>}
              <button type="submit" className={styles.btnSubmit}>{editing ? "Enregistrer" : "Créer"}</button>
            </div>
          </form>
        </div>

        <div className={styles.listPanel}>
          <div className={styles.listHeader}>
            <h2>Quêtes existantes</h2>
            <div className={styles.filtres}>
              {["tous", ...TYPES.map(t => t.value)].map(v => (
                <button key={v} className={filtreType === v ? styles.filtreActif : styles.filtre} onClick={() => setFiltreType(v)}>
                  {v === "tous" ? "Tous" : TYPES.find(t => t.value === v)?.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? <p>Chargement...</p> : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Action</th>
                    <th>Objectif</th>
                    <th>XP/FM</th>
                    <th>Actif</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(q => (
                    <tr key={q._id} style={{ opacity: q.actif ? 1 : 0.4 }}>
                      <td>{q.nom}</td>
                      <td>{TYPES.find(t => t.value === q.type)?.label}</td>
                      <td>{ACTIONS.find(a => a.value === q.action)?.label}</td>
                      <td>{q.objectif}</td>
                      <td>{q.recompenseXP} / {q.recompenseFM}</td>
                      <td>
                        <button className={styles.toggleBtn} onClick={() => toggleActif(q)}>
                          {q.actif ? "✅" : "❌"}
                        </button>
                      </td>
                      <td className={styles.tdActions}>
                        <button onClick={() => handleEdit(q)} className={styles.btnEdit}>✏️</button>
                        <button onClick={() => handleDelete(q._id)} className={styles.btnDelete}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
